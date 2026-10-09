import json
import re
from datetime import date, datetime
from typing import Optional, List, Dict, Any
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.task import Task, TaskPriority, TaskStatus
from app.agents import agent_coordinator

class TaskService:
    @staticmethod
    async def create_task(
        db: AsyncSession,
        user_id: int,
        title: str,
        description: Optional[str] = None,
        priority: str = "medium",
        due_date: Optional[str] = None,
        category: Optional[str] = None,
        is_ai_generated: bool = False,
    ) -> Task:
        try:
            priority_val = priority.lower() if isinstance(priority, str) else priority
            priority_enum = TaskPriority(priority_val) if isinstance(priority_val, str) else priority
        except ValueError:
            priority_enum = TaskPriority.MEDIUM

        due: Optional[date] = None
        if isinstance(due_date, str) and due_date:
            try:
                due = date.fromisoformat(due_date)
            except ValueError:
                due = None
        elif isinstance(due_date, date):
            due = due_date

        task = Task(
            user_id=user_id,
            title=title.strip()[:255],
            description=description.strip() if description else None,
            priority=priority_enum,
            due_date=due,
            category=category,
            is_ai_generated=is_ai_generated,
            created_at=datetime.utcnow(),
        )
        db.add(task)
        await db.flush()
        return task

    @staticmethod
    async def get_user_tasks(db: AsyncSession, user_id: int) -> list:
        result = await db.execute(
            select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc(), Task.id.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def update_task_status(db: AsyncSession, task_id: int, user_id: int, status: str) -> Optional[Task]:
        try:
            status_val = status.lower() if isinstance(status, str) else status
            status_enum = TaskStatus(status_val) if isinstance(status_val, str) else status
        except ValueError:
            status_enum = TaskStatus.TODO

        result = await db.execute(select(Task).where(Task.id == task_id, Task.user_id == user_id))
        task = result.scalar_one_or_none()
        if task:
            task.status = status_enum
            await db.flush()
        return task

    @staticmethod
    def _parse_task_generation_output(raw_text: str) -> List[Dict[str, Any]]:
        tasks: List[Dict[str, Any]] = []
        text = (raw_text or "").strip()
        if not text:
            return []

        # 1. Direct JSON attempt (strip markdown code blocks first)
        cleaned = text
        if "```" in cleaned:
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.MULTILINE)
            cleaned = re.sub(r"```$", "", cleaned, flags=re.MULTILINE).strip()

        try:
            data = json.loads(cleaned)
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and item.get("title"):
                        p = str(item.get("priority", "medium")).strip().lower()
                        if p not in ("low", "medium", "high", "critical"):
                            p = "medium"
                        tasks.append({
                            "title": str(item["title"]).strip()[:255],
                            "priority": p,
                            "description": str(item.get("description", "")).strip()[:500] if item.get("description") else None,
                        })
                if tasks:
                    return tasks
        except Exception:
            pass

        # 2. Search for embedded JSON array substring [ ... ]
        match = re.search(r"\[\s*\{.*\}\s*\]", text, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group(0))
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and item.get("title"):
                            p = str(item.get("priority", "medium")).strip().lower()
                            if p not in ("low", "medium", "high", "critical"):
                                p = "medium"
                            tasks.append({
                                "title": str(item["title"]).strip()[:255],
                                "priority": p,
                                "description": str(item.get("description", "")).strip()[:500] if item.get("description") else None,
                            })
                    if tasks:
                        return tasks
            except Exception:
                pass

        # 3. Line-by-line fallback
        priority_pattern = re.compile(
            r"\[(low|medium|high|critical)\]|\((low|medium|high|critical)\)|\b(?:priority|pri):\s*(low|medium|high|critical)\b",
            re.IGNORECASE
        )
        lines = text.split("\n")
        for line in lines:
            line_str = line.strip()
            if not line_str or line_str.startswith(("#", "|", "---", "===", "```")):
                continue
            if line_str.lower().startswith(("here is", "as a ", "below is", "project:", "objective:", "goal:")):
                continue

            priority = "medium"
            p_match = priority_pattern.search(line_str)
            if p_match:
                extracted = (p_match.group(1) or p_match.group(2) or p_match.group(3) or "").lower()
                if extracted in ("low", "medium", "high", "critical"):
                    priority = extracted
                line_str = priority_pattern.sub("", line_str).strip()

            line_str = re.sub(r"^(\d+[\.\)]|\*|\-|\+)\s*", "", line_str).strip()
            line_str = line_str.strip("*_`~: ")
            if len(line_str) >= 4:
                tasks.append({
                    "title": line_str[:255],
                    "priority": priority,
                    "description": None,
                })

        return tasks

    @staticmethod
    async def generate_tasks_from_goal(db: AsyncSession, user_id: int, goal: str) -> list:
        cleaned_goal = goal.strip()
        goal_key = f"goal:{cleaned_goal.lower()[:90]}"

        # 1. Prevent duplicate insertion when the request is repeated for the same goal
        existing_goal_result = await db.execute(
            select(Task).where(
                Task.user_id == user_id,
                Task.is_ai_generated == True,
                Task.category == goal_key,
            ).order_by(Task.created_at.desc(), Task.id.desc())
        )
        existing_for_goal = existing_goal_result.scalars().all()
        if existing_for_goal:
            return existing_for_goal

        prompt = (
            f"Break down the following goal into 4 to 8 clear, actionable tasks with realistic priorities.\n"
            f"Goal: {cleaned_goal}\n\n"
            f"Return ONLY a valid JSON array of objects. Do not include markdown code fences, headers, or conversational prose.\n"
            f"Each object must have the following keys:\n"
            f'- "title": A concise, actionable task title (max 100 characters)\n'
            f'- "priority": One of "low", "medium", "high", "critical"\n'
            f'- "description": A short explanation or deliverable for this task (optional, max 200 characters)\n'
            f'Example format:\n'
            f'[\n'
            f'  {{"title": "Review core data structures and algorithms", "priority": "high", "description": "Practice arrays, hash maps, and trees"}},\n'
            f'  {{"title": "Prepare 3 system design case studies", "priority": "medium", "description": "Focus on scalability and caching"}}\n'
            f']'
        )

        try:
            result = await agent_coordinator.process_with_agent("planning", prompt)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"AI agent error: {str(e)}")

        if not result or result.startswith("Planning Strategist: No LLM configured"):
            raise HTTPException(status_code=503, detail="AI planning service is not configured or unavailable.")

        parsed_items = TaskService._parse_task_generation_output(result)
        if not parsed_items:
            raise HTTPException(
                status_code=502,
                detail="Unable to extract actionable tasks from AI response. Please try with a clearer goal."
            )

        # Deduplicate tasks against all existing user tasks to prevent duplicate insertion
        existing_result = await db.execute(select(Task).where(Task.user_id == user_id))
        existing_tasks = existing_result.scalars().all()
        existing_titles_map = {t.title.strip().lower(): t for t in existing_tasks}

        created_tasks: List[Task] = []
        for item in parsed_items:
            norm_title = item["title"].strip().lower()
            if norm_title in existing_titles_map:
                # Task already exists; reuse without inserting a duplicate row
                created_tasks.append(existing_titles_map[norm_title])
                continue

            task = await TaskService.create_task(
                db,
                user_id=user_id,
                title=item["title"],
                description=item.get("description"),
                priority=item.get("priority", "medium"),
                category=goal_key,
                is_ai_generated=True,
            )
            created_tasks.append(task)
            existing_titles_map[norm_title] = task

        return created_tasks

