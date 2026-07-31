import re
import json
from typing import Any, Optional
from datetime import datetime

def extract_text_from_html(html_text: str) -> str:
    clean = re.compile("<.*?>")
    return re.sub(clean, "", html_text)

def parse_json_safe(text: str) -> Optional[Any]:
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return None

def truncate_text(text: str, max_length: int = 1000) -> str:
    if len(text) <= max_length:
        return text
    return text[:max_length] + "..."

def format_datetime(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d %H:%M:%S") if dt else ""

def extract_email(text: str) -> Optional[str]:
    pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    match = re.search(pattern, text)
    return match.group(0) if match else None

def extract_urls(text: str) -> list:
    pattern = r"https?://[^\s]+"
    return re.findall(pattern, text)

def calculate_ats_score(resume_text: str, job_description: str = "") -> float:
    resume_words = set(resume_text.lower().split())
    if job_description:
        job_words = set(job_description.lower().split())
        if len(job_words) == 0:
            return 0.0
        common = resume_words.intersection(job_words)
        return round((len(common) / len(job_words)) * 100, 2)
    return 0.0

def extract_skills(text: str) -> list:
    common_skills = [
        "python", "javascript", "typescript", "react", "angular", "vue", "node",
        "express", "django", "flask", "fastapi", "spring", "java", "c++", "c#",
        "go", "rust", "ruby", "php", "sql", "mongodb", "postgresql", "mysql",
        "redis", "docker", "kubernetes", "aws", "azure", "gcp", "git", "linux",
        "machine learning", "deep learning", "data science", "nlp", "computer vision",
        "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "tableau",
        "power bi", "excel", "agile", "scrum", "jira", "devops", "ci/cd",
        "jenkins", "terraform", "ansible", "graphql", "rest api", "microservices",
    ]
    text_lower = text.lower()
    found = [skill for skill in common_skills if skill in text_lower]
    return list(set(found))
