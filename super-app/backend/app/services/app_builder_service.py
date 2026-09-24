"""AI App Builder backend service.

Lovable-style local app generation:

    Next.js frontend  ->  FastAPI backend  ->  Ollama (local model ONLY)
                            ^
                            +-- sandboxed workspace + safe build/preview

Responsibilities
    * Plan & generate a full Next.js + TypeScript + Tailwind project
      from a natural-language prompt (Planner / Code Generator agents).
    * Iteratively modify an existing generated project in place
      (never regenerates the whole app unnecessarily).
    * Build with `npm install` / `npm run build` and auto-repair errors
      using the model (Debugger agent) with a bounded retry loop.
    * Run / stop / restart a production preview server per project and
      expose it through a safe URL (no raw filesystem paths).
    * Enforce a strict sandbox: generated code can never escape its
      project directory, run arbitrary commands, or touch other files.
"""

from __future__ import annotations

import asyncio
import io
import json
import logging
import os
import re
import shutil
import signal
import subprocess
import time
import uuid
import zipfile
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from app.core.config import settings
from app.services.app_builder_providers import AIProvider, AIProviderError, app_builder_ai_client

logger = logging.getLogger("app_builder.service")

PROJECT_ID_RE = re.compile(r"^[a-zA-Z0-9_-]{1,120}$")
# Files/dirs that are never exposed to the browser or the model.
HIDDEN_NAMES = {"node_modules", ".next", ".git", ".cache", "__pycache__", ".turbo"}
# Extensions treated as text for the file explorer / model context.
TEXT_EXTS = {
    ".ts", ".tsx", ".js", ".jsx", ".json", ".css", ".md", ".html", ".svg",
    ".mjs", ".cjs", ".env.example", ".txt", ".yml", ".yaml", ".tsconfig",
}
MAX_READ_SIZE = 200_000
MAX_CONTEXT_CHARS = 28_000
MAX_BUILD_ATTEMPTS = 3
# Zip download guard: refuse to package more than this (keeps the endpoint fast
# and prevents a huge archive from being streamed in memory).
MAX_DOWNLOAD_BYTES = 200 * 1024 * 1024

# Bounded subprocess execution: every npm/node command is force-stopped after
# its deadline instead of leaving the pipeline hung on a runaway process.
INSTALL_TIMEOUT = 1200  # npm install
BUILD_TIMEOUT = 900     # next build
# Marker prepended to `_run` output when a command exceeded its deadline so
# callers can distinguish "timed out" from a real build failure.
TIMEOUT_MARKER = "COMMAND_TIMED_OUT"

WINDOWS = os.name == "nt"


class AppBuilderError(RuntimeError):
    """Expected, user-facing failure (bad input, unreachable Ollama, ...)."""


def _npm_pieces(command: str, *args: str) -> List[str]:
    """Build a fixed, safe argv list for npm via `cmd /c` on Windows."""
    if WINDOWS:
        return ["cmd", "/c", "npm", command, *args]
    return ["npm", command, *args]


# ---------------------------------------------------------------------------
# Base scaffold: a known-good toolchain so the model only has to produce
# app code (pages, components, CSS), dramatically improving build success.
# ---------------------------------------------------------------------------

SCAFFOLD: Dict[str, str] = {
    "package.json": json.dumps(
        {
            "name": "ai-generated-app",
            "version": "1.0.0",
            "private": True,
            "scripts": {
                "dev": "next dev",
                "build": "next build",
                "start": "next start",
                "lint": "next lint",
            },
            "dependencies": {
                "next": "14.2.15",
                "react": "18.3.1",
                "react-dom": "18.3.1",
            },
            "devDependencies": {
                "@types/node": "^20.14.0",
                "@types/react": "^18.3.3",
                "@types/react-dom": "^18.3.0",
                "autoprefixer": "^10.4.20",
                "postcss": "^8.4.41",
                "tailwindcss": "^3.4.10",
                "typescript": "^5.5.4",
            },
        },
        indent=2,
    ),
    "tsconfig.json": json.dumps(
        {
            "compilerOptions": {
                "lib": ["dom", "dom.iterable", "esnext"],
                "allowJs": True,
                "skipLibCheck": True,
                "strict": True,
                "noEmit": True,
                "esModuleInterop": True,
                "module": "esnext",
                "moduleResolution": "bundler",
                "resolveJsonModule": True,
                "isolatedModules": True,
                "jsx": "preserve",
                "incremental": True,
                "plugins": [{"name": "next"}],
                "paths": {"@/*": ["./*"]},
            },
            "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
            "exclude": ["node_modules"],
        },
        indent=2,
    ),
    "next.config.mjs": "/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  reactStrictMode: true,\n};\n\nexport default nextConfig;\n",
    "postcss.config.mjs": "/** @type {import('postcss-load-config').Config} */\nconst config = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};\n\nexport default config;\n",
    "tailwind.config.ts": (
        "import type { Config } from 'tailwindcss';\n\n"
        "const config: Config = {\n"
        "  darkMode: 'class',\n"
        "  content: [\n"
        "    './app/**/*.{js,ts,jsx,tsx,mdx}',\n"
        "    './components/**/*.{js,ts,jsx,tsx,mdx}',\n"
        "    './lib/**/*.{js,ts,jsx,tsx,mdx}',\n"
        "  ],\n"
        "  theme: {\n"
        "    extend: {\n"
        "      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },\n"
        "      colors: { background: 'hsl(var(--background))', foreground: 'hsl(var(--foreground))', border: 'hsl(var(--border))', primary: 'hsl(var(--primary))', accent: 'hsl(var(--accent))' },\n"
        "    },\n"
        "  },\n"
        "  plugins: [],\n"
        "};\n\n"
        "export default config;\n"
    ),
    "next-env.d.ts": "/// <reference types=\"next\" />\n/// <reference types=\"next/image-types/global\" />\n\n// NOTE: This file should not be edited\n// see https://nextjs.org/docs/basic-features/typescript for more information.\n",
    ".gitignore": (
        "# dependencies\n/node_modules\n/.pnp\n.pnp.js\n\n"
        "# testing\n/coverage\n\n"
        "# next.js\n/.next/\n/out/\n\n"
        "# production\n/build\n\n"
        "# misc\n.DS_Store\n*.pem\n\n"
        "# debug\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\n\n"
        "# env\n.env*\n\n"
        "# typescript\n*.tsbuildinfo\nnext-env.d.ts\n"
    ),
    "README.md": (
        "# AI Generated App\n\n"
        "Created with the **AI App Builder** inside AI Super App.\n\n"
        "## Stack\n\n- Next.js 14\n- React 18\n- TypeScript\n- Tailwind CSS\n\n"
        "## Commands\n\n```bash\nnpm install\nnpm run dev\nnpm run build\nnpm run start\n```\n"
    ),
    "app/layout.tsx": (
        "import type { Metadata } from 'next';\n"
        "import './globals.css';\n\n"
        "export const metadata: Metadata = {\n"
        "  title: 'Generated App',\n"
        "  description: 'Generated by AI App Builder',\n"
        "};\n\n"
        "export default function RootLayout({ children }: { children: React.ReactNode }) {\n"
        "  return (\n"
        "    <html lang=\"en\">\n"
        "      <body>{children}</body>\n"
        "    </html>\n"
        "  );\n"
        "}\n"
    ),
    "app/globals.css": (
        "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n"
        ":root {\n  --background: 0 0% 4%;\n  --foreground: 0 0% 96%;\n}\n\n"
        "* { box-sizing: border-box; }\n"
        "html, body { padding: 0; margin: 0; }\n"
        "body { background: hsl(var(--background)); color: hsl(var(--foreground)); }\n"
        "a { color: inherit; text-decoration: none; }\n"
    ),
}

# Prompt the model to stay on the pinned toolchain (local models often
# hallucinate packages that would break `npm install`).
TOOLCHAIN_RULES = (
    "USE ONLY the packages already installed in package.json: next, react, "
    "react-dom, tailwindcss. Do NOT import or require anything else "
    "(no axios, no framer-motion, no lucide, no external UI kits). Use "
    "inline SVG or emoji for icons. Use Tailwind utility classes for styling. "
    "Make app/layout.tsx import './globals.css'. Make app/page.tsx the landing "
    "content. Keep every component self-contained and TypeScript-clean."
)


# ---------------------------------------------------------------------------
# Sandbox / path helpers
# ---------------------------------------------------------------------------


def _project_dir(project_id: str) -> Path:
    if not PROJECT_ID_RE.match(project_id or ""):
        raise AppBuilderError("Invalid project id.")
    workspace = Path(settings.app_builder_workspace_path).resolve()
    project = (workspace / project_id).resolve()
    if not str(project).startswith(str(workspace)):  # never escape the workspace
        raise AppBuilderError("Project path escaped the sandbox.")
    return project


def _validate_file_path(project_id: str, rel_path: str) -> Path:
    """Validate a generated/requested file path and return the safe target."""
    if not isinstance(rel_path, str) or not rel_path.strip():
        raise AppBuilderError("Empty file path.")
    rel_path = rel_path.strip()
    if rel_path.startswith("/") or re.match(r"^[A-Za-z]:[\\/]", rel_path):
        raise AppBuilderError(f"Absolute path rejected: {rel_path}")
    if "\x00" in rel_path:
        raise AppBuilderError("Null byte in path.")
    rel_path = rel_path.replace("\\", "/")
    parts = [p for p in rel_path.split("/") if p not in ("", ".")]
    if any(p == ".." for p in parts):
        raise AppBuilderError(f"Path traversal rejected: {rel_path}")
    if not parts:
        raise AppBuilderError(f"Invalid path: {rel_path}")
    if parts[0] in HIDDEN_NAMES:
        raise AppBuilderError(f"Protected path rejected: {rel_path}")
    project = _project_dir(project_id)
    target = project.joinpath(*parts).resolve()
    if not str(target).startswith(str(project)):
        raise AppBuilderError(f"Path escaped project: {rel_path}")
    return target


def _safe_relative(project_id: str, abs_path: Path) -> str:
    project = _project_dir(project_id)
    rel = abs_path.relative_to(project).as_posix()
    return rel


def _decode_content(content: str) -> str | bytes:
    """Decode `data:image/...;base64,` content into bytes, else keep text."""
    if isinstance(content, str) and content.startswith("data:"):
        try:
            import base64

            head, _, b64 = content.partition(",")
            if ";base64" in head and b64.strip():
                return base64.b64decode(b64)
        except Exception:
            pass
    return content


def _write_file(target: Path, content: str | bytes) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(content, bytes):
        target.write_bytes(content)
    else:
        target.write_text(content, encoding="utf-8")


def _iter_project_files(project: Path) -> List[Path]:
    found: List[Path] = []
    for root, dirs, files in os.walk(project):
        dirs[:] = [d for d in dirs if d not in HIDDEN_NAMES and not d.startswith(".")]
        for name in files:
            if name in HIDDEN_NAMES or (name.startswith(".") and name not in (".gitkeep",)):
                continue
            found.append(Path(root) / name)
    return sorted(found)


def _iter_download_files(project: Path) -> List[Path]:
    """All files of a generated project for zip packaging.

    Build-time artifacts (node_modules, .next, .turbo, .cache, .git) and the
    internal `.app-builder.json` meta file are excluded; everything else is
    kept, including scaffold dotfiles such as `.gitignore`/`.env.example`.
    """
    found: List[Path] = []
    for root, dirs, files in os.walk(project):
        dirs[:] = [d for d in dirs if d not in HIDDEN_NAMES]
        for name in files:
            if name in HIDDEN_NAMES or name == ".app-builder.json" or name.startswith(".env"):
                continue
            found.append(Path(root) / name)
    return sorted(found)


def _zip_filename(name: str) -> str:
    """Turn a project name into a safe `xxx.zip` archive filename."""
    slug = re.sub(r"[^a-zA-Z0-9_.-]+", "-", (name or "").strip()).strip(".-")
    slug = slug[:80]
    return f"{(slug or 'generated-app')}.zip"


def _is_text(name: str, size: int) -> bool:
    suffix = Path(name).suffix.lower()
    if suffix in TEXT_EXTS:
        return True
    return name in {"package.json", "tsconfig.json", "README.md"} and size < MAX_READ_SIZE


# ---------------------------------------------------------------------------
# JSON helpers
# ---------------------------------------------------------------------------


def _extract_json(text: str) -> dict:
    """Robustly parse the model's JSON payload (tolerates fences/cruft)."""
    text = (text or "").strip()
    if not text:
        raise AIProviderError("Model returned an empty generation result.")
    # Strip markdown fences.
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\s*", "", text).strip()
        text = re.sub(r"\s*```$", "", text).strip()
    start, end = -1, -1
    for i, ch in enumerate(text):
        if ch == "{":
            start = i
            break
    if start == -1:
        raise AIProviderError(f"Model did not return JSON. Got: {text[:300]}")
    for i in range(len(text) - 1, start - 1, -1):
        if text[i] == "}":
            end = i
            break
    if end <= start:
        raise AIProviderError(f"Model JSON was incomplete: {text[:300]}")
    try:
        return json.loads(text[start:end + 1])
    except json.JSONDecodeError as exc:
        raise AIProviderError(f"Model returned invalid JSON: {exc}. Raw: {text[:300]}")


# ---------------------------------------------------------------------------
# Agents (internal pipeline)
# ---------------------------------------------------------------------------


class _Agents:
    """Lightweight multi-agent pipeline for the App Builder."""

    def __init__(self, provider: AIProvider) -> None:
        self.provider = provider

    async def planner(self, prompt: str) -> Dict[str, Any]:
        system = (
            "You are the Planner + Code Generator agent of a Lovable-style AI app builder. "
            "You generate a complete, buildable Next.js 14 + React + TypeScript + Tailwind CSS "
            "project from a short user description. "
            f"{TOOLCHAIN_RULES}\n\n"
            "Respond with ONLY a JSON object in exactly this shape:\n"
            '{"name": "<app name>", "description": "<one sentence>", '
            '"files": [{"path": "app/page.tsx", "content": "<full file content>"}, ...]}\n'
            "Guidelines: generate a dark, modern, polished design. Include app/layout.tsx, "
            "app/page.tsx and app/globals.css. Split UI into small components under "
            "components/ (e.g. components/Hero.tsx, components/Navbar.tsx, "
            "components/Section.tsx, components/Footer.tsx). Use Tailwind utility classes "
            "directly - do not add custom CSS beyond @layer components helpers in "
            "app/globals.css. You may add public/ assets only as small SVG files. "
            "Provide the FULL content of every file. Never output comments inside JSON "
            "or anything outside the single JSON object. Keep the total output as "
            "compact as reasonably possible while staying complete and buildable."
        )
        raw = await self.provider.chat(system, f"Build this app:\n\n{prompt}", json_mode=True, temperature=0.25, max_tokens=9000)
        plan = _extract_json(raw)
        files = plan.get("files")
        if not isinstance(files, list) or not files:
            raise AIProviderError("Model returned a plan with no files.")
        return plan

    async def modifier(self, prompt: str, context: str) -> Dict[str, Any]:
        system = (
            "You are the Modifier agent of an AI app builder. The user wants to change an "
            "EXISTING generated project. You are given its file tree and the contents of key "
            "files. Determine the minimal change and rewrite ONLY the files that need to change. "
            "Do NOT regenerate the whole project. "
            f"{TOOLCHAIN_RULES}\n\n"
            "Respond with ONLY a JSON object:\n"
            '{"message": "<1-2 sentence summary of what you changed>", '
            '"files": [{"path": "app/page.tsx", "content": "<complete new file content>"}, ...]}\n'
            "Each entry must contain the FULL new content of a file. If no change is needed, "
            'return {"message": "...", "files": []}.'
        )
        raw = await self.provider.chat(system, context, json_mode=True, temperature=0.2, max_tokens=10000)
        return _extract_json(raw)

    async def debugger(self, errors: str, context: str) -> Dict[str, Any]:
        system = (
            "You are the Debugger agent of an AI app builder. A generated project failed to "
            "build. Below are the build errors (TypeScript / Next.js / React) and the relevant "
            "file contents. Fix exactly these errors with minimal changes. "
            f"{TOOLCHAIN_RULES}\n\n"
            "Respond with ONLY a JSON object:\n"
            '{"note": "<brief explanation>", '
            '"files": [{"path": "<file>", "content": "<complete corrected file content>"}, ...]}\n'
            "Never invent new imports that are not installed. No CSS-in-JS libraries."
        )
        raw = await self.provider.chat(
            system, f"BUILD ERRORS:\n{errors}\n\nPROJECT CONTEXT:\n{context}",
            json_mode=True, temperature=0.1, max_tokens=10000,
        )
        return _extract_json(raw)


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------


def _timed_out(output: str) -> bool:
    """True when `_run` reported a hard timeout (not a plain build failure)."""
    return TIMEOUT_MARKER in (output or "")


async def _kill_process_tree(proc: asyncio.subprocess.Process) -> None:
    """Force-kill a subprocess and every descendant so npm/node cannot orphan.

    Windows: `taskkill /T /F` kills the tree rooted at cmd.exe (npm -> node).
    POSIX: children live in their own session (start_new_session), so
    `os.killpg` reaps the whole group.
    """
    if proc is None:
        return
    try:
        if proc.returncode is not None:
            return
        if WINDOWS:
            subprocess.run(
                ["taskkill", "/PID", str(proc.pid), "/T", "/F"],
                capture_output=True,
                timeout=20,
            )
        else:
            try:
                os.killpg(proc.pid, signal.SIGKILL)
            except (ProcessLookupError, PermissionError, OSError):
                proc.kill()
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass
    # Reap the process (bounded) so the port/pipe is released and no zombie
    # keeps the `cmd /c` handle alive.
    try:
        await asyncio.wait_for(proc.wait(), timeout=8)
    except (asyncio.TimeoutError, ProcessLookupError):
        pass


class AppBuilderService:
    def __init__(self) -> None:
        self._previews: Dict[str, Dict[str, Any]] = {}
        self._build_locks: Dict[str, asyncio.Lock] = {}
        self._port_counter = 0
        self._port_lock = asyncio.Lock()

    # -- workspace --------------------------------------------------------

    def _ensure_workspace(self) -> Path:
        workspace = Path(settings.app_builder_workspace_path).resolve()
        workspace.mkdir(parents=True, exist_ok=True)
        gitkeep = workspace / ".gitkeep"
        if not gitkeep.exists():
            gitkeep.write_text("", encoding="utf-8")
        return workspace

    # -- LLM helpers ------------------------------------------------------

    async def _provider(self) -> AIProvider:
        return await app_builder_ai_client.provider()

    async def check_status(self) -> Dict[str, Any]:
        status = await (await self._provider()).check()
        status["workspace"] = self._ensure_workspace().as_posix()
        status["projects_count"] = len(self.list_projects())
        return status

    # -- file ops ---------------------------------------------------------

    def _apply_files(self, project_id: str, files: list) -> List[Dict[str, str]]:
        applied: List[Dict[str, str]] = []
        for entry in files or []:
            if not isinstance(entry, dict):
                continue
            path = (entry.get("path") or "").strip()
            content = entry.get("content")
            if content is None:
                continue
            try:
                target = _validate_file_path(project_id, path)
                # Keep generated code fully inside its sandboxed project.
                _write_file(target, _decode_content(content))
                applied.append({"path": _safe_relative(project_id, target)})
            except AppBuilderError as exc:
                logger.warning("Rejected generated file %r: %s", path, exc)
                applied.append({"path": path, "error": str(exc)})
        return applied

    # -- agents orchestration ---------------------------------------------

    async def create_project(self, prompt: str, owner_user_id: Optional[int] = None) -> Dict[str, Any]:
        prompt = (prompt or "").strip()
        if not prompt:
            raise AppBuilderError("Please describe the app you want to build first.")
        project_id = time.strftime("%Y%m%d-%H%M%S") + "-" + uuid.uuid4().hex[:6]
        project = _project_dir(project_id)
        project.mkdir(parents=True, exist_ok=True)
        # Write the known-good scaffold first, then let the model fill in code.
        for path, content in SCAFFOLD.items():
            _write_file(_validate_file_path(project_id, path), content)

        agents = _Agents(await self._provider())
        plan = await agents.planner(prompt)
        name = str(plan.get("name") or "Generated App").strip() or "Generated App"
        applied = self._apply_files(project_id, plan.get("files") or [])
        meta = {
            "project_id": project_id,
            "name": name,
            "description": str(plan.get("description") or "").strip(),
            "prompt": prompt,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "updated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "owner_user_id": owner_user_id,
            "files": self.list_files(project_id),
            "written": [a for a in applied if "error" not in a],
            "rejected": [a for a in applied if "error" in a],
        }
        self._write_meta(project_id, meta)
        return meta

    async def iterate_project(self, project_id: str, prompt: str) -> Dict[str, Any]:
        prompt = (prompt or "").strip()
        if not prompt:
            raise AppBuilderError("Please describe what you want to change.")
        project = _project_dir(project_id)
        if not project.exists():
            raise AppBuilderError("Project not found.")
        context = self._build_context(project_id, focus=prompt)
        agents = _Agents(await self._provider())
        diff = await agents.modifier(prompt, context)
        applied = self._apply_files(project_id, diff.get("files") or [])
        meta = self._read_meta(project_id)
        meta["last_change"] = {
            "prompt": prompt,
            "message": str(diff.get("message") or "Applied the requested change."),
            "at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        }
        meta["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
        meta["files"] = self.list_files(project_id)
        self._write_meta(project_id, meta)
        return {
            "project_id": project_id,
            "message": str(diff.get("message") or "Applied the requested change."),
            "written": [a for a in applied if "error" not in a],
            "rejected": [a for a in applied if "error" in a],
            "files": meta["files"],
        }

    # -- context builder --------------------------------------------------

    def _build_context(self, project_id: str, focus: str = "") -> str:
        project = _project_dir(project_id)
        files = _iter_project_files(project)
        lines = ["User request:", focus, "", "Current project files:"]
        for f in files:
            rel = _safe_relative(project_id, f)
            try:
                size = f.stat().st_size
            except OSError:
                size = 0
            lines.append(f"- {rel} ({size} B)")
        lines.append("")
        # Include contents of the most important files up to the char budget.
        budget = MAX_CONTEXT_CHARS
        important = sorted(
            files,
            key=lambda f: (0 if ("page" in f.name or "layout" in f.name or f.name == "globals.css") else 1, str(f)),
        )
        for f in important:
            rel = _safe_relative(project_id, f)
            try:
                size = f.stat().st_size
            except OSError:
                continue
            if not _is_text(rel, size) or size > MAX_READ_SIZE:
                continue
            content = f.read_text(encoding="utf-8", errors="replace")
            if len(content) <= budget - 200:
                lines.append(f"===== {rel} =====")
                lines.append(content)
                budget -= len(content)
            if budget <= 0:
                break
        return "\n".join(lines)[:MAX_CONTEXT_CHARS + 6000]

    # -- build pipeline ---------------------------------------------------

    async def build_project(self, project_id: str) -> Dict[str, Any]:
        project = _project_dir(project_id)
        if not project.exists():
            raise AppBuilderError("Project not found.")
        lock = self._build_locks.setdefault(project_id, asyncio.Lock())
        async with lock:
            log_lines: List[str] = []
            attempts = 0
            success = False
            errors = ""
            env = os.environ.copy()
            env["NEXT_TELEMETRY_DISABLED"] = "1"
            env["CI"] = "false"

            # 1. Install dependencies (skip when node_modules already present).
            if not (project / "node_modules").exists():
                log_lines.append("> npm install (sandboxed workspace)")
                code, out = await self._run(_npm_pieces("install", "--ignore-scripts", "--no-audit", "--no-fund"), project.as_posix(), INSTALL_TIMEOUT, env)
                log_lines.append(out[-4000:])
                if code != 0:
                    if _timed_out(out):
                        raise AppBuilderError(
                            f"Dependency installation timed out after {INSTALL_TIMEOUT}s and was force-stopped. "
                            "The generated app may require packages that cannot be installed in the sandbox, "
                            "or the network install is stuck. Try again with a simpler app."
                        )
                    raise AppBuilderError(
                        "Dependency installation failed. The generated app may use a package "
                        "that is not allowed. Error:\n" + self._extract_errors(out)
                    )

            # 2. Build with bounded AI repair loop.
            max_repairs = max(0, settings.APP_BUILDER_MAX_REPAIRS)
            final_log = ""
            while attempts <= max_repairs:
                attempts += 1
                log_lines.append(f"> npm run build (attempt {attempts})")
                code, out = await self._run(_npm_pieces("run", "build"), project.as_posix(), BUILD_TIMEOUT, env)
                final_log = out[-6000:]
                log_lines.append(final_log[-4000:])
                if _timed_out(out):
                    # A hang is NOT an autofixable error: asking the AI debugger
                    # to repair a build that never finished wastes another long
                    # model call. Stop immediately and report the timeout.
                    raise AppBuilderError(
                        f"Build timed out after {BUILD_TIMEOUT}s and was force-stopped. "
                        "The next build never completed; this is a hang, not a code error. "
                        "Try again or simplify the generated app."
                    )
                if code == 0:
                    success = True
                    break
                errors = self._extract_errors(out)
                if attempts > max_repairs:
                    break
                log_lines.append("> AI debugger is fixing build errors...")
                context = self._build_context(project_id)
                try:
                    agents = _Agents(await self._provider())
                    fix = await agents.debugger(errors, context)
                    applied = self._apply_files(project_id, fix.get("files") or [])
                    if not applied:
                        break
                except (AIProviderError, AppBuilderError) as exc:
                    log_lines.append(f"Debugger failed: {exc}")
                    break

            result = {
                "project_id": project_id,
                "success": success,
                "attempts": attempts,
                "log": "\n".join(log_lines)[-16000:],
                "errors": errors[:6000],
            }
            self._write_state(project_id, {"build_success": success, "last_build_at": time.strftime("%Y-%m-%dT%H:%M:%S")})
            return result

    # -- preview lifecycle ------------------------------------------------

    async def start_preview(self, project_id: str, host: str = "localhost") -> Dict[str, Any]:
        project = _project_dir(project_id)
        if not project.exists():
            raise AppBuilderError("Project not found.")
        await self.ensure_built(project_id)

        existing = self._previews.get(project_id)
        if existing and existing.get("proc") and existing["proc"].poll() is None:
            return {"preview_url": existing["url"], "port": existing["port"], "running": True}

        port = await self._next_port()
        env = os.environ.copy()
        env["NEXT_TELEMETRY_DISABLED"] = "1"
        if WINDOWS:
            creationflags = subprocess.CREATE_NEW_PROCESS_GROUP
        else:
            creationflags = 0
        proc = subprocess.Popen(  # noqa: S603 - fixed argv, no model input
            _npm_pieces("run", "start", "--", "-p", str(port)),
            cwd=project.as_posix(),
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creationflags,
        )
        url = f"http://{host}:{port}"
        self._previews[project_id] = {"proc": proc, "port": port, "url": url, "started": time.time()}
        # Give the server a moment to boot, then confirm it is listening.
        await asyncio.sleep(1.6)
        if proc.poll() is not None:
            await self.stop_preview(project_id)
            raise AppBuilderError(f"Preview server failed to start (port {port}). Rebuild and try again.")
        if not await self._port_open(port):
            await self.stop_preview(project_id)
            raise AppBuilderError("Preview did not answer on port yet - wait a moment and press Restart.")
        return {"preview_url": url, "port": port, "running": True}

    async def ensure_built(self, project_id: str) -> None:
        project = _project_dir(project_id)
        # A production server needs a valid build; otherwise build first.
        build_id = project / ".next" / "BUILD_ID"
        if not build_id.exists():
            result = await self.build_project(project_id)
            if not result["success"]:
                raise AppBuilderError(
                    "The app has not built successfully yet, so the preview cannot start:\n" + result["errors"]
                )

    async def stop_preview(self, project_id: str) -> Dict[str, Any]:
        entry = self._previews.get(project_id)
        if entry and entry.get("proc"):
            await self._kill_proc(entry["proc"])
        self._previews.pop(project_id, None)
        return {"running": False}

    async def restart_preview(self, project_id: str, host: str = "localhost") -> Dict[str, Any]:
        await self.stop_preview(project_id)
        return await self.start_preview(project_id, host)

    async def stop_all_previews(self) -> None:
        """Terminate every running preview server (used on shutdown)."""
        for project_id in list(self._previews.keys()):
            try:
                await self.stop_preview(project_id)
            except Exception:
                self._previews.pop(project_id, None)

    # -- introspection ----------------------------------------------------

    def list_projects(self) -> List[Dict[str, Any]]:
        workspace = self._ensure_workspace()
        out: List[Dict[str, Any]] = []
        for d in sorted(workspace.iterdir(), key=lambda p: p.name, reverse=True):
            if not d.is_dir() or d.name.startswith("."):
                continue
            out.append(self._project_summary(d.name))
        return out

    def _project_summary(self, project_id: str) -> Dict[str, Any]:
        meta = self._read_meta(project_id) or {}
        preview = self._previews.get(project_id)
        preview_running = bool(preview and preview.get("proc") and preview["proc"].poll() is None)
        state = self._read_state(project_id) or {}
        return {
            "project_id": project_id,
            "name": meta.get("name") or "Generated App",
            "description": meta.get("description") or "",
            "created_at": meta.get("created_at"),
            "updated_at": meta.get("updated_at"),
            "last_change": meta.get("last_change"),
            "owner_user_id": meta.get("owner_user_id"),
            "files_count": len(self._safe_list(project_id)),
            "build_success": state.get("build_success", False),
            "preview_running": preview_running,
            "preview_url": (preview or {}).get("url"),
        }

    def rename_project(self, project_id: str, name: str) -> Dict[str, Any]:
        name = (name or "").strip()
        if not name:
            raise AppBuilderError("Please provide a project name.")
        if len(name) > 120:
            raise AppBuilderError("Project name is too long (max 120 characters).")
        project = _project_dir(project_id)
        if not project.exists():
            raise AppBuilderError("Project not found.")
        meta = self._read_meta(project_id) or {}
        meta["name"] = name
        meta["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
        self._write_meta(project_id, meta)
        return self._project_summary(project_id)

    async def duplicate_project(self, project_id: str, name: Optional[str] = None, owner_user_id: Optional[int] = None) -> Dict[str, Any]:
        project = _project_dir(project_id)
        if not project.exists():
            raise AppBuilderError("Project not found.")
        new_id = time.strftime("%Y%m%d-%H%M%S") + "-" + uuid.uuid4().hex[:6]
        new_project = _project_dir(new_id)
        shutil.copytree(
            project,
            new_project,
            ignore=shutil.ignore_patterns("node_modules", ".next", ".turbo", ".cache"),
        )
        meta = self._read_meta(project_id) or {}
        now = time.strftime("%Y-%m-%dT%H:%M:%S")
        new_name = (name or "").strip() or f"{meta.get('name') or 'Generated App'} (copy)"
        if len(new_name) > 120:
            new_name = new_name[:120]
        new_meta = {
            "project_id": new_id,
            "name": new_name,
            "description": meta.get("description") or "",
            "prompt": meta.get("prompt") or "",
            "created_at": now,
            "updated_at": now,
            "owner_user_id": owner_user_id if owner_user_id is not None else (meta.get("owner_user_id") or None),
            "files": self.list_files(new_id),
        }
        self._write_meta(new_id, new_meta)
        return self._project_summary(new_id)

    async def delete_project(self, project_id: str) -> Dict[str, Any]:
        project = _project_dir(project_id)
        if not project.exists():
            raise AppBuilderError("Project not found.")
        await self.stop_preview(project_id)
        self._build_locks.pop(project_id, None)
        shutil.rmtree(project, ignore_errors=True)
        return {"deleted": project_id}

    async def repair_project(self, project_id: str, errors: str = "") -> Dict[str, Any]:
        project = _project_dir(project_id)
        if not project.exists():
            raise AppBuilderError("Project not found.")
        context = self._build_context(project_id)
        agents = _Agents(await self._provider())
        try:
            fix = await agents.debugger(errors or "Build failed.", context)
        except (AIProviderError, AppBuilderError) as exc:
            raise AppBuilderError(f"AI could not prepare a fix: {exc}")
        applied = self._apply_files(project_id, fix.get("files") or [])
        if not applied:
            raise AppBuilderError(
                "The AI did not produce any file changes. This build error may come "
                "from something outside the generated code (e.g. a missing system "
                "dependency), so it cannot be auto-repaired. Check the log above."
            )
        return await self.build_project(project_id)

    def list_files(self, project_id: str) -> List[Dict[str, Any]]:
        return self._safe_list(project_id)

    def read_file(self, project_id: str, path: str) -> Dict[str, Any]:
        target = _validate_file_path(project_id, path)
        if not target.exists() or not target.is_file():
            raise AppBuilderError("File not found in the project workspace.")
        if target.stat().st_size > MAX_READ_SIZE:
            raise AppBuilderError("File is too large to preview.")
        content = target.read_text(encoding="utf-8", errors="replace")
        return {"path": _safe_relative(project_id, target), "content": content}

    def download_project(self, project_id: str) -> Tuple[str, io.BytesIO]:
        """Package a generated project as an in-memory ZIP.

        Returns (archive filename, bytes-IO). The project is validated against
        the sandbox (same `_project_dir` rules used everywhere else) and stays
        inside the App Builder workspace: project ids cannot escape it.
        """
        project = _project_dir(project_id)
        if not project.exists():
            raise AppBuilderError("Project not found.")
        files = _iter_download_files(project)
        if not files:
            raise AppBuilderError("Project directory is empty; nothing to download.")

        total = sum((f.stat().st_size if f.is_file() else 0) for f in files)
        if total > MAX_DOWNLOAD_BYTES:
            raise AppBuilderError(
                f"Project is too large to download ({total / 1024 // 1024} MB)."
            )

        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            for f in files:
                rel = f.relative_to(project).as_posix()
                try:
                    zf.write(f, arcname=rel)
                except FileNotFoundError:
                    continue  # removed during zipping; skip silently
        buf.seek(0)

        meta = self._read_meta(project_id) or {}
        filename = _zip_filename(meta.get("name") or "Generated App")
        return filename, buf

    # -- internal helpers -------------------------------------------------

    def _safe_list(self, project_id: str) -> List[Dict[str, Any]]:
        project = _project_dir(project_id)
        if not project.exists():
            return []
        out = []
        for f in _iter_project_files(project):
            rel = _safe_relative(project_id, f)
            try:
                size = f.stat().st_size
            except OSError:
                size = 0
            out.append({"path": rel, "size": size})
        return out

    def _write_meta(self, project_id: str, meta: Dict[str, Any]) -> None:
        project = _project_dir(project_id)
        (project / ".app-builder.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")

    def _read_meta(self, project_id: str) -> Optional[Dict[str, Any]]:
        project = _project_dir(project_id)
        meta_file = project / ".app-builder.json"
        if not meta_file.exists():
            return None
        try:
            return json.loads(meta_file.read_text(encoding="utf-8"))
        except Exception:
            return None

    def get_owner(self, project_id: str) -> Optional[int]:
        meta = self._read_meta(project_id) or {}
        owner = meta.get("owner_user_id")
        if owner is None:
            return None
        try:
            return int(owner)
        except (TypeError, ValueError):
            return None

    def adopt_project(self, project_id: str, user_id: int) -> bool:
        """Claim an ownerless (legacy) project for a user. Returns True on change."""
        meta = self._read_meta(project_id) or {}
        if meta.get("owner_user_id") is not None:
            return False
        meta["owner_user_id"] = user_id
        self._write_meta(project_id, meta)
        return True

    def _write_state(self, project_id: str, state: Dict[str, Any]) -> None:
        project = _project_dir(project_id)
        meta = self._read_meta(project_id) or {}
        meta["state"] = state
        meta["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
        self._write_meta(project_id, meta)

    def _read_state(self, project_id: str) -> Optional[Dict[str, Any]]:
        meta = self._read_meta(project_id) or {}
        return meta.get("state")

    @staticmethod
    def _extract_errors(output: str) -> str:
        if not output:
            return "Unknown build error."
        lines = output.splitlines()
        relevant = [
            ln for ln in lines
            if re.search(r"(error|Error|ERROR|Failed to compile|Type error|Cannot find|not assignable|Could not resolve|\.tsx\b|\.ts\b)", ln)
            or re.search(r"(pre-compile|Compiled with errors|unhandled)", ln, re.I)
        ]
        if len(relevant) < 3:
            relevant = lines
        return "\n".join(relevant[-80:])[:6000]

    @staticmethod
    async def _run(cmd: List[str], cwd: str, timeout: int, env: dict) -> Tuple[int, str]:
        """Run a single subprocess with a hard timeout and full output capture.

        On Windows the command is `cmd /c npm ...`, so killing only the outer
        process would leave npm/node running forever. Every spawn is put in its
        own process group and the whole tree is force-killed on timeout or
        cancellation so no npm/node child can remain orphaned.
        """
        creationflags = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0) if WINDOWS else 0
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=cwd,
            env=env,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
            creationflags=creationflags,
            start_new_session=not WINDOWS,
        )
        try:
            out, _ = await asyncio.wait_for(proc.communicate(), timeout=timeout)
        except asyncio.TimeoutError:
            # Respect the hard deadline: kill the whole tree and report an
            # error instead of letting the pipeline hang.
            await _kill_process_tree(proc)
            return 1, (
                f"{TIMEOUT_MARKER} command did not finish within {timeout}s "
                "and was force-stopped (entire process tree killed)."
            )
        except asyncio.CancelledError:
            # Client disconnected or task cancelled: never leave npm/node behind.
            await _kill_process_tree(proc)
            raise
        return proc.returncode or 0, out.decode("utf-8", errors="replace")

    @staticmethod
    async def _kill_proc(proc: subprocess.Popen) -> None:
        if proc is None or proc.poll() is not None:
            return
        try:
            if WINDOWS:
                subprocess.run(["taskkill", "/PID", str(proc.pid), "/T", "/F"], capture_output=True, timeout=15)
            else:
                proc.terminate()
        except Exception:
            try:
                proc.kill()
            except Exception:
                pass

    async def _next_port(self) -> int:
        async with self._port_lock:
            for _ in range(400):
                port = settings.APP_BUILDER_PREVIEW_PORT_BASE + self._port_counter
                self._port_counter = (self._port_counter + 1) % 400
                if not await self._port_open(port):
                    return port
            raise AppBuilderError("No free preview ports available.")

    @staticmethod
    async def _port_open(port: int) -> bool:
        try:
            import socket

            loop = asyncio.get_running_loop()
            fut = loop.create_future()

            def _check() -> None:
                try:
                    with socket.create_connection(("127.0.0.1", port), timeout=0.4):
                        if not fut.done():
                            fut.set_result(True)
                except OSError:
                    if not fut.done():
                        fut.set_result(False)

            loop.run_in_executor(None, _check)
            return bool(await asyncio.wait_for(fut, timeout=1.2))
        except Exception:
            return False


app_builder_service = AppBuilderService()