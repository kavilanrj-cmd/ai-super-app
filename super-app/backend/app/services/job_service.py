import logging
import re
import time
from typing import Callable, List, Optional, Tuple

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.job import Job

logger = logging.getLogger("job_service")

JSEARCH_URL = "https://jsearch.p.rapidapi.com/search"
ADZUNA_URL = "https://api.adzuna.com/v1/api/jobs/{country}/search/{page}"
ADZUNA_COUNTRY = "in"
REMOTIVE_URL = "https://remotive.com/api/remote-jobs"
REMOTIVE_FETCH_CAP = 250
CACHE_TTL_PRIMARY = 300
CACHE_TTL_FALLBACK = 900

# ---------------------------- errors / cache ----------------------------

class JobProviderError(Exception):
    """Raised when no job provider is configured or a provider fails."""


_search_cache: dict = {}


def _cache_key(*parts) -> str:
    return "|".join("" if p is None else str(p) for p in parts)


async def _cached(key: str, ttl: int, loader: Callable[[], object]):
    now = time.time()
    hit = _search_cache.get(key)
    if hit and hit[0] > now:
        return hit[1]
    data = await loader()
    _search_cache[key] = (now + ttl, data)
    return data


# ---------------------------- helpers ----------------------------

def _redact_url(url: str) -> str:
    from urllib.parse import urlencode, urlsplit, urlunsplit
    parts = urlsplit(url)
    query = {}
    for k, v in parts.query.split("&"):
        if not k:
            continue
        key, val = (k.split("=", 1) + [""])[:2] if "=" in k else (k, "")
        if any(s in key.lower() for s in ("key", "token", "secret")):
            query[key] = "***"
        else:
            query[key] = val
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


def _job_debug(provider: str, query: str, location: Optional[str], url: str, status, keys: List[str], count: int, error: Optional[str] = None):
    logger.info(
        "JOB SEARCH DEBUG - "
        "provider=%s query=%r location=%r request_url=%s http_status=%s response_keys=%s jobs=%s provider_error=%s",
        provider, query, location, _redact_url(url), status, keys, count, error or "none",
    )


def _clean(value, limit: Optional[int] = None) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    return text[:limit] if limit and len(text) > limit else text


def _strip_html(value) -> str:
    if not value:
        return ""
    text = re.sub(r"<[^>]+>", " ", str(value))
    text = re.sub(r"\s+", " ", text).strip()
    return text


_SKILLS = [
    "python", "fastapi", "django", "flask", "sql", "mysql", "postgresql", "postgres",
    "mongodb", "redis", "docker", "kubernetes", "k8s", "aws", "azure", "gcp",
    "react", "reactjs", "next.js", "nextjs", "node.js", "nodejs", "node",
    "javascript", "typescript", "java", "kotlin", "swift", "c++", "c#", "golang", "go",
    "ruby", "rust", "graphql", "rest api", "machine learning", "deep learning",
    "nlp", "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn", "llm",
    "tailwind", "html", "css", "redux", "git", "ci/cd", "terraform", "kafka",
    "spark", "hadoop", "linux", "bash", "excel", "sqlite", "laravel", "spring",
    "tableau", "power bi", "selenium", "pytest", "jest", "playwright",
]

_WORK_MODE_REMOTE = (
    "remote", "work from home", "wfh", "work remotely", "home based", "home-based",
    "telecommute", "100% remote", "anywhere", "worldwide", "from anywhere", "global remote",
)
_WORK_MODE_HYBRID = ("hybrid",)
_WORK_MODE_ONSITE = ("on-site", "onsite", "on site", "in office", "in-office", "office based", "on premises")

_EXP_KEYWORDS = {
    "entry": "",
    "internship": "internship",
    "junior": "junior",
    "mid": "",
    "midlevel": "mid-level",
    "senior": "senior",
    "lead": "lead",
}

_JOB_TYPE_ADZUNA = {
    "full-time": "full_time",
    "part-time": "part_time",
    "contract": "contract",
    "permanent": "permanent",
    "internship": None,
    "freelance": None,
}

_REMOTIVE_TYPE_MAP = {
    "full-time": "full_time",
    "part-time": "part_time",
    "contract": "contract",
    "freelance": "freelance",
    "internship": "internship",
    "permanent": "full_time",
}
_REMOTIVE_TYPE_LABEL = {
    "full_time": "Full-time",
    "part_time": "Part-time",
    "contract": "Contract",
    "freelance": "Freelance",
    "internship": "Internship",
}


def _extract_skills(title: str, description: str) -> List[str]:
    text = f"{title or ''} {description or ''}".lower()
    found = [s for s in _SKILLS if re.search(r"\b" + re.escape(s) + r"\b", text)]
    # drop raw code tokens that are prefixes of a longer skill already found
    skills = []
    for s in found:
        if s in ("go", "node") and any(x in text for x in ("golang", "node.js", "nodejs")):
            continue
        if s not in skills:
            skills.append(s)
        if len(skills) >= 8:
            break
    return skills


def _classify_work_mode(location: str, title: str, description: str, force_remote: bool = False) -> str:
    if force_remote:
        return "remote"
    text = f"{title or ''} {location or ''} {description or ''}".lower()
    if any(w in text for w in _WORK_MODE_HYBRID):
        return "hybrid"
    if any(w in text for w in _WORK_MODE_REMOTE):
        return "remote"
    if any(w in text for w in _WORK_MODE_ONSITE):
        return "onsite"
    return "onsite"


def _apply_work_mode_filter(items: List[dict], mode: Optional[str]) -> List[dict]:
    mode = (mode or "").strip().lower()
    if mode in ("", "all"):
        return items
    return [it for it in items if it.get("work_mode") == mode]


def _apply_salary_filter(items: List[dict], salary_min: Optional[float], salary_max: Optional[float]) -> List[dict]:
    s_min = float(salary_min) if salary_min else None
    s_max = float(salary_max) if salary_max else None
    if s_min is None and s_max is None:
        return items
    out = []
    for it in items:
        lo, hi = it.get("salary_min"), it.get("salary_max")
        if lo is None and hi is None:
            out.append(it)
            continue
        lo = float(lo) if lo is not None else lo
        hi = float(hi) if hi is not None else hi
        if s_min is not None and lo is not None and hi is None:
            if lo < s_min:
                continue
        elif s_max is not None and hi is not None and lo is None:
            if hi > s_max:
                continue
        elif s_min is not None and s_max is not None and lo is not None and hi is not None:
            if hi < s_min or lo > s_max:
                continue
        elif s_min is not None and lo is not None and hi is not None:
            if hi < s_min:
                continue
        elif s_max is not None and lo is not None and hi is not None:
            if lo > s_max:
                continue
        out.append(it)
    return out


_SALARY_RANGE_RE = re.compile(r"([\d.,]+)\s*[-–—]\s*([\d.,]+)")
_SALARY_SINGLE_RE = re.compile(r"([\d.,]+)")
_SALARY_CURRENCY = {"€": "EUR", "$": "USD", "£": "GBP", "₹": "INR", "zł": "PLN", "kr": "SEK", "fr": "CHF"}


def _parse_salary_text(text) -> Tuple[Optional[float], Optional[float], Optional[str]]:
    if not text:
        return None, None, None
    currency = None
    for sym, code in _SALARY_CURRENCY.items():
        if sym in text:
            currency = code
            break
    if currency is None and re.search(r"\b(usd|eur|gbp|inr)\b", text, re.IGNORECASE):
        currency = re.search(r"\b(usd|eur|gbp|inr)\b", text, re.IGNORECASE).group(1).upper()
    m = _SALARY_RANGE_RE.search(text)
    if m:
        try:
            return float(m.group(1).replace(",", "")), float(m.group(2).replace(",", "")), currency
        except ValueError:
            pass
    m = _SALARY_SINGLE_RE.search(text)
    if m:
        try:
            return float(m.group(1).replace(",", "")), None, currency
        except ValueError:
            pass
    return None, None, currency


# ---------------------------- normalizers ----------------------------

def _normalize_jsearch(item: dict, source: str) -> dict:
    city = _clean(item.get("job_city"))
    state = _clean(item.get("job_state"))
    country = _clean(item.get("job_country"))
    loc = ", ".join(x for x in (city, state, country) if x)
    salary_min = item.get("job_minimum_salary")
    salary_max = item.get("job_maximum_salary")
    salary_min = float(salary_min) if isinstance(salary_min, (int, float)) and salary_min else None
    salary_max = float(salary_max) if isinstance(salary_max, (int, float)) and salary_max else None
    salary, currency = _format_salary(salary_min, salary_max, _clean(item.get("job_salary_currency")))
    title = _clean(item.get("job_title"))
    description = _clean(item.get("job_description"), 4000)
    mode = _classify_work_mode(loc, title, description)
    return {
        "title": title,
        "company": _clean(item.get("employer_name")),
        "location": loc,
        "description": description,
        "url": _clean(item.get("job_apply_link") or item.get("job_google_link")),
        "salary": salary,
        "salary_min": salary_min,
        "salary_max": salary_max,
        "salary_currency": currency,
        "posted_at": _clean(item.get("job_posted_at_datetime_utc")),
        "employment_type": _clean(item.get("job_employment_type")),
        "remote": mode in ("remote", "hybrid"),
        "work_mode": mode,
        "skills": _extract_skills(title, description),
        "logo": _clean(item.get("employer_logo")) or None,
        "source": source,
    }


def _normalize_adzuna(item: dict, source: str) -> dict:
    company = item.get("company") or {}
    location = item.get("location") or {}
    salary_min = item.get("salary_min") if isinstance(item.get("salary_min"), (int, float)) else None
    salary_max = item.get("salary_max") if isinstance(item.get("salary_max"), (int, float)) else None
    currency = "INR"
    salary, _ = _format_salary(salary_min, salary_max, currency)
    contract_time = _clean(item.get("contract_time"))
    contract_type = _clean(item.get("contract_type"))
    employment_type = []
    if contract_time:
        employment_type.append(contract_time.replace("_", "-"))
    if contract_type and contract_type != contract_time:
        employment_type.append(contract_type)
    employment = " ".join(employment_type).strip() or "Full-time"
    title = _clean(item.get("title"))
    description = _clean(item.get("description"), 4000)
    loc = _clean(location.get("display_name"))
    mode = _classify_work_mode(loc, title, description)
    return {
        "title": title,
        "company": _clean(company.get("display_name")),
        "location": loc,
        "description": description,
        "url": _clean(item.get("redirect_url")),
        "salary": salary,
        "salary_min": salary_min,
        "salary_max": salary_max,
        "salary_currency": currency,
        "posted_at": _clean(item.get("created")),
        "employment_type": employment,
        "remote": mode in ("remote", "hybrid"),
        "work_mode": mode,
        "skills": _extract_skills(title, description),
        "logo": _clean(item.get("company_logo")) or None,
        "source": source,
    }


def _normalize_remotive(item: dict, source: str) -> dict:
    title = _clean(item.get("title"))
    description = _strip_html(item.get("description") or "")[:4000]
    loc = _clean(item.get("candidate_required_location")) or "Remote"
    salary_text = _clean(item.get("salary"))
    salary_min, salary_max, currency = _parse_salary_text(salary_text)
    if currency is None and salary_min is not None:
        currency = "USD"
    salary = salary_text or _format_salary(salary_min, salary_max, currency or "USD")[0]
    raw_type = _clean(item.get("job_type")).lower().replace("-", "_")
    employment = _REMOTIVE_TYPE_LABEL.get(raw_type, _clean(item.get("job_type")) or "Full-time")
    mode = "remote"
    return {
        "title": title,
        "company": _clean(item.get("company_name")),
        "location": loc,
        "description": description,
        "url": _clean(item.get("url")),
        "salary": salary,
        "salary_min": salary_min,
        "salary_max": salary_max,
        "salary_currency": currency,
        "posted_at": _clean(item.get("publication_date")),
        "employment_type": employment,
        "remote": True,
        "work_mode": mode,
        "skills": _clean(item.get("tags")) or _extract_skills(title, description),
        "logo": _clean(item.get("company_logo")) or None,
        "source": source,
        "candidate_location": loc,
    }


def _format_salary(salary_min: Optional[float], salary_max: Optional[float], currency: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
    if salary_min is None and salary_max is None:
        return None, currency
    symbol = "₹" if (currency or "").upper() == "INR" else ("€" if (currency or "").upper() == "EUR" else ("£" if (currency or "").upper() == "GBP" else "$"))
    if salary_min is not None and salary_max is not None:
        return f"{symbol}{salary_min:,.0f} - {symbol}{salary_max:,.0f}", currency
    if salary_min is not None:
        return f"from {symbol}{salary_min:,.0f}", currency
    return f"up to {symbol}{salary_max:,.0f}", currency


# ---------------------------- primary providers ----------------------------

def _expanded_query(query: str, experience_level: Optional[str]) -> str:
    kw = _EXP_KEYWORDS.get((experience_level or "").strip().lower())
    if kw and kw not in query.lower():
        return f"{query} {kw}".strip()
    return query.strip()


async def _fetch_jsearch(query: str, location: Optional[str], job_type: Optional[str],
                         experience_level: Optional[str], remote: Optional[str],
                         salary_min: Optional[float], salary_max: Optional[float],
                         page: int, limit: int) -> Tuple[List[dict], int, bool]:
    if not settings.job_provider_configured:
        raise JobProviderError("JSEARCH_API_KEY is not configured")
    params: dict = {"num_pages": 1, "page": min(page, 1)}
    params["query"] = _expanded_query(query, experience_level)
    if location:
        params["query"] = f"{params['query']} in {location}"
        params["location"] = location
    if job_type and (job_type.strip().lower() != "all"):
        mapping = {"full-time": "FULLTIME", "part-time": "PARTTIME", "contract": "CONTRACTOR", "internship": "INTERN"}
        ft = mapping.get(job_type.strip().lower())
        if ft:
            params["employment_types"] = ft
    if remote and remote.strip().lower() == "remote":
        params["remote_jobs_only"] = "true"
    params["country"] = "IN"
    headers = {"x-rapidapi-key": settings.JSEARCH_API_KEY, "x-rapidapi-host": "jsearch.p.rapidapi.com"}
    url = JSEARCH_URL
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(JSEARCH_URL, params=params, headers=headers)
    except httpx.HTTPError as exc:
        _job_debug("jsearch", query, location, url, "network_error", [], 0, error=str(exc)[:200])
        raise JobProviderError("Job search service is currently unavailable. Please try again.")
    data: List[dict] = []
    total = 0
    try:
        payload = resp.json()
        if isinstance(payload.get("data"), list):
            data = payload["data"]
        total = int(payload.get("total_results") or len(data))
    except ValueError:
        pass
    if resp.status_code != 200:
        _job_debug("jsearch", query, location, url, resp.status_code, list(payload.keys()) if 'payload' in dir() else [], 0,
                   error=resp.content[:200].decode("utf-8", "replace"))
        raise JobProviderError("Job search service is currently unavailable. Please try again.")
    _job_debug("jsearch", query, location, url, resp.status_code, list(payload.keys()) if 'payload' in dir() else [], len(data))
    items = [_normalize_jsearch(i, "jsearch") for i in data if isinstance(i, dict)]
    items = _apply_work_mode_filter(items, remote)
    items = _apply_salary_filter(items, salary_min, salary_max)
    has_more = (page * limit) < total
    return items[:limit], total, has_more


async def _fetch_adzuna(query: str, location: Optional[str], job_type: Optional[str],
                        experience_level: Optional[str], remote: Optional[str],
                        salary_min: Optional[float], salary_max: Optional[float],
                        page: int, limit: int) -> Tuple[List[dict], int, bool]:
    if not settings.job_provider_configured:
        raise JobProviderError("ADZUNA_APP_ID/ADZUNA_APP_KEY is not configured")
    params = {
        "app_id": settings.ADZUNA_APP_ID,
        "app_key": settings.ADZUNA_APP_KEY,
        "results_per_page": limit,
        "content-type": "application/json",
        "what": _expanded_query(query, experience_level),
        "sort_by": "date",
    }
    if location:
        params["where"] = location
    flag = _JOB_TYPE_ADZUNA.get((job_type or "").strip().lower())
    if flag:
        params[flag] = "1"
    if salary_min:
        params["salary_min"] = int(float(salary_min))
    if salary_max:
        params["salary_max"] = int(float(salary_max))
    if remote and remote.strip().lower() == "remote":
        params["what"] = f"{params['what']} remote"
    url = ADZUNA_URL.format(country=ADZUNA_COUNTRY, page=max(page, 1))
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.get(url, params=params)
    except httpx.HTTPError as exc:
        _job_debug("adzuna", query, location, f"{url}?{params['app_id']}", "network_error", [], 0, error=str(exc)[:200])
        raise JobProviderError("Job search service is currently unavailable. Please try again.")
    data: List[dict] = []
    total = 0
    try:
        payload = resp.json()
        if isinstance(payload.get("results"), list):
            data = payload["results"]
        total = int(payload.get("count") or len(data))
    except ValueError:
        payload = {}
    if resp.status_code != 200:
        _job_debug("adzuna", query, location, url, resp.status_code, list(payload.keys()), 0,
                   error=resp.content[:200].decode("utf-8", "replace"))
        raise JobProviderError("Job search service is currently unavailable. Please try again.")
    _job_debug("adzuna", query, location, url, resp.status_code, list(payload.keys()), len(data))
    items = [_normalize_adzuna(i, "adzuna") for i in data if isinstance(i, dict)]
    items = _apply_work_mode_filter(items, remote)
    items = _apply_salary_filter(items, salary_min, salary_max)
    has_more = (page * limit) < total
    return items, total, has_more


async def _fetch_primary(name: str, query: str, location: Optional[str], job_type: Optional[str],
                         experience_level: Optional[str], remote: Optional[str],
                         salary_min: Optional[float], salary_max: Optional[float],
                         page: int, limit: int) -> Tuple[List[dict], int, bool]:
    if name == "adzuna":
        return await _fetch_adzuna(query, location, job_type, experience_level, remote, salary_min, salary_max, page, limit)
    return await _fetch_jsearch(query, location, job_type, experience_level, remote, salary_min, salary_max, page, limit)


# ---------------------------- fallback provider (Remotive) ----------------------------

def _matches_location(text: str, location: Optional[str]) -> bool:
    if not location:
        return True
    text_l = (text or "").lower()
    if any(w in text_l for w in ("anywhere", "worldwide", "global", "from anywhere")):
        return True
    tokens = [t for t in re.split(r"[\s,]+", location.strip().lower()) if len(t) > 2]
    if not tokens:
        return True
    return any(t in text_l for t in tokens)


def _apply_location_filter(items: List[dict], location: Optional[str]) -> List[dict]:
    if not location:
        return items
    return [it for it in items if _matches_location(it.get("candidate_location") or it.get("location"), location)]


def _apply_remotive_type_filter(items: List[dict], job_type: Optional[str]) -> List[dict]:
    slug = _REMOTIVE_TYPE_MAP.get((job_type or "").strip().lower())
    if not slug:
        return items
    out = []
    for it in items:
        raw = (it.get("employment_type") or "").lower().replace(" ", "_")
        if raw == slug:
            out.append(it)
    return out


async def _fetch_remotive(query: str, location: Optional[str], job_type: Optional[str],
                          experience_level: Optional[str], remote: Optional[str],
                          salary_min: Optional[float], salary_max: Optional[float],
                          page: int, limit: int) -> Tuple[List[dict], int, bool]:
    search = _expanded_query(query, experience_level)
    params = {"search": search, "limit": REMOTIVE_FETCH_CAP}
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.get(REMOTIVE_URL, params=params)
    except httpx.HTTPError as exc:
        _job_debug("remotive", query, location, f"{REMOTIVE_URL}?search={search}", "network_error", [], 0, error=str(exc)[:200])
        raise JobProviderError("Job search service is currently unavailable. Please try again.")
    try:
        payload = resp.json()
        raw = payload.get("jobs", []) if isinstance(payload, dict) else []
    except ValueError:
        raw = []
    if resp.status_code != 200:
        _job_debug("remotive", query, location, f"{REMOTIVE_URL}?search={search}", resp.status_code, [], 0,
                   error=resp.content[:200].decode("utf-8", "replace"))
        raise JobProviderError("Job search service is currently unavailable. Please try again.")
    items = [_normalize_remotive(i, "remotive") for i in raw if isinstance(i, dict)]
    items = _apply_location_filter(items, location)
    items = _apply_remotive_type_filter(items, job_type)
    items = _apply_work_mode_filter(items, remote)
    items = _apply_salary_filter(items, salary_min, salary_max)
    total = len(items)
    has_more = (page * limit) < total
    return items[(page - 1) * limit: page * limit], total, has_more


def _fallback_provider() -> Optional[str]:
    name = (settings.JOB_FALLBACK_PROVIDER or "").strip().lower()
    return name if name in ("remotive",) else None


# ---------------------------- service ----------------------------

class JobService:
    @staticmethod
    async def search_jobs(db: AsyncSession, query: str, location: Optional[str] = None,
                          job_type: Optional[str] = None, experience_level: Optional[str] = None,
                          remote: Optional[str] = None, salary_min: Optional[float] = None,
                          salary_max: Optional[float] = None, page: int = 1, limit: int = 12) -> dict:
        page = max(1, int(page or 1))
        limit = max(1, min(int(limit or 12), 50))
        primary = _provider()
        items: List[dict] = []
        total = 0
        has_more = False
        used: List[str] = []

        if settings.job_provider_configured:
            try:
                key = _cache_key("primary", primary, query, location, job_type, experience_level, remote, salary_min, salary_max, limit, page)
                items, total, has_more = await _cached(
                    key, CACHE_TTL_PRIMARY,
                    lambda: _fetch_primary(primary, query, location, job_type, experience_level, remote, salary_min, salary_max, page, limit),
                )
                used.append(primary)
            except JobProviderError as exc:
                logger.warning("JOB SEARCH DEBUG - primary provider %s failed for query=%r: %s; using fallback", primary, query, exc)
                items = []

        if not items:
            fallback = _fallback_provider()
            if fallback:
                key = _cache_key("fallback", fallback, query, location, job_type, experience_level, remote, salary_min, salary_max, limit, page)
                items, total, has_more = await _cached(
                    key, CACHE_TTL_FALLBACK,
                    lambda: _fetch_remotive(query, location, job_type, experience_level, remote, salary_min, salary_max, page, limit),
                )
                used = used + [fallback] if used else [fallback]

        if not items and not used:
            raise JobProviderError("No job provider is configured.")

        jobs = []
        seen = set()
        for item in items:
            key = (
                str(item.get("company") or "").strip().lower(),
                str(item.get("title") or "").strip().lower(),
                str(item.get("location") or "").strip().lower(),
            )
            if key in seen or (not key[0] and not key[1]):
                continue
            seen.add(key)
            job = await JobService._upsert_job(db, item)
            if job:
                jobs.append(JobService._payload(job, item))

        return {
            "jobs": jobs,
            "total": total,
            "page": page,
            "limit": limit,
            "has_more": has_more,
            "providers": used,
            "query": {"query": query, "location": location, "job_type": job_type,
                      "experience_level": experience_level, "remote": remote,
                      "salary_min": salary_min, "salary_max": salary_max},
        }

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
            title=(item.get("title") or "Untitled job")[:255],
            company=(item.get("company") or "")[:255],
            location=(item.get("location") or "")[:255],
            description=item.get("description"),
            salary_min=item.get("salary_min"),
            salary_max=item.get("salary_max"),
            salary_currency=item.get("salary_currency"),
            job_type=((item.get("employment_type") or "Full-time")[:50]),
            experience_level=(item.get("experience_level") or "")[:50],
            skills_required=item.get("skills") or [],
            source=(item.get("source") or "unknown")[:100],
            source_url=source_url[:500],
            is_active=True,
        )
        db.add(job)
        await db.flush()
        return job

    @staticmethod
    def _serialize(job: Job, item: Optional[dict] = None) -> dict:
        salary = None
        salary_min = job.salary_min
        salary_max = job.salary_max
        if salary_min is not None and salary_max is not None:
            salary, _ = _format_salary(salary_min, salary_max, job.salary_currency)
        elif salary_min is not None:
            salary, _ = _format_salary(salary_min, None, job.salary_currency)
        elif salary_max is not None:
            salary, _ = _format_salary(None, salary_max, job.salary_currency)
        item = item or {}
        return {
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "location": item.get("location") or job.location,
            "description": (item.get("description") or job.description or "")[:500],
            "url": item.get("url") or job.source_url or "",
            "source": item.get("source") or job.source,
            "posted_at": item.get("posted_at"),
            "salary": item.get("salary") or salary,
            "salary_min": item.get("salary_min") if item.get("salary_min") is not None else job.salary_min,
            "salary_max": item.get("salary_max") if item.get("salary_max") is not None else job.salary_max,
            "salary_currency": item.get("salary_currency") or job.salary_currency,
            "employment_type": item.get("employment_type") or job.job_type,
            "experience_level": item.get("experience_level") or job.experience_level,
            "remote": bool(item.get("remote")),
            "work_mode": item.get("work_mode") or ("remote" if item.get("remote") else "onsite"),
            "skills": item.get("skills") or job.skills_required or [],
            "logo": item.get("logo"),
            "created_at": job.created_at.isoformat() if job.created_at else None,
        }

    @staticmethod
    def _payload(job: Job, item: dict) -> dict:
        return JobService._serialize(job, item)

    @staticmethod
    async def save_job(db: AsyncSession, user_id: int, job_id: int) -> Job:
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()
        if job is None:
            return None
        if not job.is_saved:
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


def _provider() -> str:
    return (settings.JOB_PROVIDER or "jsearch").strip().lower()