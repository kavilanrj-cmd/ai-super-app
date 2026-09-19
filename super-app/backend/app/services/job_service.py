import logging
from typing import List, Optional
from urllib.parse import urlencode, urlsplit, urlunsplit

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.job import Job

logger = logging.getLogger("job_service")

JSEARCH_URL = "https://jsearch.p.rapidapi.com/search"
ADZUNA_URL = "https://api.adzuna.com/v1/api/jobs/{country}/search/1"
ADZUNA_COUNTRY = "in"


class JobProviderError(Exception):
    """Raised when no job provider is configured or a provider fails."""


def _redact_url(url: str) -> str:
    """Strip sensitive query params (e.g. app_key) before logging."""
    parts = urlsplit(url)
    query = {}
    for k, v in parts.query.split("&"):
        if not k:
            continue
        if "=" in k:
            key, val = k.split("=", 1)
            key = key
        else:
            key, val = k, ""
        if "key" in key.lower() or "token" in key.lower() or "secret" in key.lower():
            query[key] = "***"
        else:
            query[key] = val
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


def _job_debug(provider: str, query: str, location: Optional[str], url: str, status, keys: List[str], count: int, error: Optional[str] = None):
    logger.info(
        "JOB SEARCH DEBUG - "
        "provider=%s query=%r location=%r request_url=%s http_status=%s response_keys=%s jobs=%s provider_error=%s",
        provider,
        query,
        location,
        _redact_url(url),
        status,
        keys,
        count,
        error or "none",
    )


def _clean(value, limit: Optional[int] = None) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    return text[:limit] if limit and len(text) > limit else text


def _normalize_jsearch(item: dict) -> dict:
    city = item.get("job_city") or ""
    state = item.get("job_state") or ""
    country = item.get("job_country") or ""
    loc = ", ".join(x for x in (city, state, country) if x)
    salary_min = item.get("job_minimum_salary")
    salary_max = item.get("job_maximum_salary")
    if isinstance(salary_min, (int, float)) and salary_min and salary_min > 0:
        salary_min = float(salary_min)
    else:
        salary_min = None
    if isinstance(salary_max, (int, float)) and salary_max and salary_max > 0:
        salary_max = float(salary_max)
    else:
        salary_max = None
    salary = None
    if salary_min is not None and salary_max is not None:
        salary = f"₹{salary_min:,.0f} - ₹{salary_max:,.0f}"
    elif salary_min is not None:
        salary = f"from ₹{salary_min:,.0f}"
    elif salary_max is not None:
        salary = f"up to ₹{salary_max:,.0f}"
    return {
        "title": _clean(item.get("job_title")),
        "company": _clean(item.get("employer_name")),
        "location": loc,
        "description": _clean(item.get("job_description", ""), 4000),
        "url": _clean(item.get("job_apply_link") or item.get("job_google_link")),
        "salary": salary,
        "salary_min": salary_min,
        "salary_max": salary_max,
        "salary_currency": _clean(item.get("job_salary_currency")),
        "posted_at": _clean(item.get("job_posted_at_datetime_utc")),
        "employment_type": _clean(item.get("job_employment_type")),
    }


def _normalize_adzuna(item: dict) -> dict:
    company = item.get("company") or {}
    location = item.get("location") or {}
    salary_min = item.get("salary_min")
    salary_max = item.get("salary_max")
    if not isinstance(salary_min, (int, float)):
        salary_min = None
    if not isinstance(salary_max, (int, float)):
        salary_max = None
    currency = "INR"
    salary = None
    if salary_min is not None and salary_max is not None:
        salary = f"₹{salary_min:,.0f} - ₹{salary_max:,.0f}"
    elif salary_min is not None:
        salary = f"from ₹{salary_min:,.0f}"
    elif salary_max is not None:
        salary = f"up to ₹{salary_max:,.0f}"
    employment_type = _clean(item.get("contract_type") or item.get("contract_time"))
    return {
        "title": _clean(item.get("title")),
        "company": _clean(company.get("display_name")),
        "location": _clean(location.get("display_name")),
        "description": _clean(item.get("description", ""), 4000),
        "url": _clean(item.get("redirect_url")),
        "salary": salary,
        "salary_min": salary_min,
        "salary_max": salary_max,
        "salary_currency": currency,
        "posted_at": _clean(item.get("created")),
        "employment_type": employment_type,
    }


async def _fetch_jsearch(query: str, location: Optional[str]) -> List[dict]:
    if not settings.job_provider_configured:
        logger.info(
            "JOB SEARCH DEBUG - provider=jsearch query=%r location=%r request_url=%s http_status=not_configured response_keys=[] jobs=0 provider_error=JSEARCH_API_KEY is not set",
            query, location, JSEARCH_URL,
        )
        raise JobProviderError("JSEARCH_API_KEY is not configured")
    params: dict = {"num_pages": 1, "page": 1}
    params["query"] = f"{query} in {location}" if location else query
    if location:
        params["location"] = location
    params["country"] = "IN"
    headers = {"x-rapidapi-key": settings.JSEARCH_API_KEY, "x-rapidapi-host": "jsearch.p.rapidapi.com"}
    url = f"{JSEARCH_URL}?{urlencode(params)}"
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(JSEARCH_URL, params=params, headers=headers)
    except httpx.HTTPError as exc:
        _job_debug("jsearch", query, location, url, "network_error", [], 0, error=str(exc)[:200])
        raise JobProviderError("Job search service is currently unavailable. Please try again.")
    keys: List[str] = []
    error = None
    data: List[dict] = []
    try:
        payload = resp.json()
        keys = list(payload.keys())
        if isinstance(payload.get("data"), list):
            data = payload["data"]
    except ValueError:
        error = resp.content[:200].decode("utf-8", "replace")
    if resp.status_code != 200 or error:
        _job_debug("jsearch", query, location, url, resp.status_code, keys, 0, error=error or resp.content[:200].decode("utf-8", "replace"))
        raise JobProviderError("Job search service is currently unavailable. Please try again.")
    _job_debug("jsearch", query, location, url, resp.status_code, keys, len(data))
    return [_normalize_jsearch(item) for item in data if isinstance(item, dict)]


async def _fetch_adzuna(query: str, location: Optional[str]) -> List[dict]:
    if not settings.job_provider_configured:
        logger.info(
            "JOB SEARCH DEBUG - provider=adzuna query=%r location=%r request_url=%s http_status=not_configured response_keys=[] jobs=0 provider_error=ADZUNA_APP_ID/ADZUNA_APP_KEY is not set",
            query, location, ADZUNA_URL.format(country=ADZUNA_COUNTRY),
        )
        raise JobProviderError("ADZUNA_APP_ID/ADZUNA_APP_KEY is not configured")
    params = {
        "app_id": settings.ADZUNA_APP_ID,
        "app_key": settings.ADZUNA_APP_KEY,
        "results_per_page": 50,
        "content-type": "application/json",
        "what": query,
    }
    if location:
        params["where"] = location
    url = ADZUNA_URL.format(country=ADZUNA_COUNTRY)
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.get(url, params=params)
    except httpx.HTTPError as exc:
        _job_debug("adzuna", query, location, f"{url}?{urlencode(params)}", "network_error", [], 0, error=str(exc)[:200])
        raise JobProviderError("Job search service is currently unavailable. Please try again.")
    keys: List[str] = []
    error = None
    data: List[dict] = []
    try:
        payload = resp.json()
        keys = list(payload.keys())
        if isinstance(payload.get("results"), list):
            data = payload["results"]
    except ValueError:
        error = resp.content[:200].decode("utf-8", "replace")
    if resp.status_code != 200 or error:
        _job_debug(
            "adzuna",
            query,
            location,
            f"{url}?{urlencode({k: v for k, v in params.items() if k != 'app_key'})}",
            resp.status_code,
            keys,
            0,
            error=error or resp.content[:200].decode("utf-8", "replace"),
        )
        raise JobProviderError("Job search service is currently unavailable. Please try again.")
    _job_debug("adzuna", query, location, f"{url}?{urlencode({k: v for k, v in params.items() if k != 'app_key'})}", resp.status_code, keys, len(data))
    return [_normalize_adzuna(item) for item in data if isinstance(item, dict)]


def _provider() -> str:
    return (settings.JOB_PROVIDER or "jsearch").strip().lower()


class JobService:
    @staticmethod
    async def search_jobs(db: AsyncSession, query: str, location: Optional[str] = None, job_type: Optional[str] = None) -> list:
        name = _provider()
        if name == "adzuna":
            results = await _fetch_adzuna(query, location)
        else:
            results = await _fetch_jsearch(query, location)

        jobs = []
        for item in results:
            job = await JobService._upsert_job(db, item)
            if job:
                jobs.append(JobService._serialize(job))
        return jobs

    @staticmethod
    async def _upsert_job(db: AsyncSession, item: dict) -> Optional[Job]:
        source_url = (item.get("url") or "").strip()
        if not source_url:
            return None
        result = await db.execute(select(Job).where(Job.source_url == source_url).limit(1))
        existing = result.scalar_one_or_none()
        if existing:
            return existing
        job = Job(
            title=item.get("title") or "Untitled job",
            company=item.get("company"),
            location=item.get("location"),
            description=item.get("description"),
            salary_min=item.get("salary_min"),
            salary_max=item.get("salary_max"),
            salary_currency=item.get("salary_currency"),
            job_type=(item.get("employment_type") or "Full-time")[:50],
            source=settings.JOB_PROVIDER,
            source_url=source_url,
            is_active=True,
        )
        db.add(job)
        await db.flush()
        return job

    @staticmethod
    def _serialize(job: Job) -> dict:
        salary = None
        if job.salary_min is not None and job.salary_max is not None:
            salary = f"₹{job.salary_min:,.0f} - ₹{job.salary_max:,.0f}"
        elif job.salary_min is not None:
            salary = f"from ₹{job.salary_min:,.0f}"
        elif job.salary_max is not None:
            salary = f"up to ₹{job.salary_max:,.0f}"
        return {
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "description": (job.description or "")[:500],
            "url": job.source_url,
            "source_url": job.source_url,
            "salary": salary,
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "salary_currency": job.salary_currency,
            "posted_at": None,
            "employment_type": job.job_type,
            "job_type": job.job_type,
            "created_at": job.created_at.isoformat() if job.created_at else None,
        }

    @staticmethod
    async def save_job(db: AsyncSession, user_id: int, job_id: int) -> Job:
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()
        if job:
            job.is_saved = True
            job.user_id = user_id
        return job

    @staticmethod
    async def get_saved_jobs(db: AsyncSession, user_id: int) -> list:
        result = await db.execute(select(Job).where(Job.user_id == user_id, Job.is_saved == True))
        return result.scalars().all()

    @staticmethod
    async def get_ai_recommendations(db: AsyncSession, user_id: int) -> list:
        result = await db.execute(
            select(Job).where(Job.is_active == True).order_by(Job.ai_match_score.desc().nullslast()).limit(10)
        )
        return result.scalars().all()