import pytest
from httpx import AsyncClient

from app.services import job_service
from app.services.job_service import JobProviderError, _normalize_adzuna, _normalize_jsearch

REQUIRED_KEYS = ("title", "company", "location", "description", "url", "salary", "posted_at", "employment_type")


async def _register(client: AsyncClient, email: str):
    reg = await client.post("/api/v1/auth/register", json={
        "email": email,
        "username": email.split("@")[0],
        "password": "TestPass123!",
    })
    token = reg.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_jobs_search_returns_503_and_clear_message_without_provider(client: AsyncClient, monkeypatch):
    async def _fail(*args, **kwargs):
        raise JobProviderError("not configured")

    monkeypatch.setattr(job_service, "_fetch_jsearch", _fail)
    headers = await _register(client, "jobs503@example.com")

    res = await client.get(
        "/api/v1/jobs/search",
        params={"query": "full stack developer", "location": "Chennai"},
        headers=headers,
    )
    assert res.status_code == 503
    assert res.json()["detail"] == "Job search service is currently unavailable. Please try again."


SAMPLE = [
    {
        "title": "Senior Full Stack Developer",
        "company": "TechCorp",
        "location": "Mumbai, Maharashtra, India",
        "description": "Build full stack applications.",
        "url": "https://apply.example.com/1",
        "salary": "₹1500000 - ₹2500000",
        "salary_min": 1500000,
        "salary_max": 2500000,
        "salary_currency": "INR",
        "posted_at": "2026-08-01T00:00:00Z",
        "employment_type": "FULLTIME",
    },
    {
        "title": "React Developer",
        "company": "StartupX",
        "location": "Chennai, Tamil Nadu, India",
        "description": "",
        "url": "https://apply.example.com/2",
        "salary": None,
        "salary_min": None,
        "salary_max": None,
        "salary_currency": None,
        "posted_at": None,
        "employment_type": None,
    },
]


@pytest.mark.asyncio
async def test_jobs_search_returns_normalized_jobs_from_provider(client: AsyncClient, monkeypatch):
    async def _fake(query, location):
        return SAMPLE

    monkeypatch.setattr(job_service, "_fetch_jsearch", _fake)
    headers = await _register(client, "jobs200@example.com")

    res = await client.get(
        "/api/v1/jobs/search",
        params={"query": "react developer", "location": "Mumbai"},
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2
    for job in data:
        for key in REQUIRED_KEYS:
            assert key in job, f"missing normalized key {key}"
        assert "source_url" in job
        assert "id" in job
    assert data[0]["title"] == "Senior Full Stack Developer"
    assert data[0]["company"] == "TechCorp"
    assert data[1]["job_type"] == "Full-time"

    res2 = await client.get(
        "/api/v1/jobs/search",
        params={"query": "react developer", "location": "Mumbai"},
        headers=headers,
    )
    assert len(res2.json()) == 2


def test_normalize_jsearch_tolerates_missing_fields():
    out = _normalize_jsearch({"job_title": "  Python Developer  "})
    assert out["title"] == "Python Developer"
    assert out["location"] == ""
    assert out["salary"] is None
    assert out["salary_min"] is None
    assert out["salary_max"] is None
    assert out["posted_at"] == ""


def test_normalize_jsearch_builds_salary_and_location():
    out = _normalize_jsearch({
        "job_title": "X",
        "employer_name": "Y",
        "job_city": "Bangalore",
        "job_state": "Karnataka",
        "job_country": "India",
        "job_minimum_salary": 1200000,
        "job_maximum_salary": 1800000,
        "job_employment_type": "FULLTIME",
        "job_apply_link": "https://x.example.com/a",
    })
    assert out["location"] == "Bangalore, Karnataka, India"
    assert out["salary"] == "₹1,200,000 - ₹1,800,000"
    assert out["employment_type"] == "FULLTIME"
    assert out["url"] == "https://x.example.com/a"


def test_normalize_jsearch_ignores_zero_salary():
    out = _normalize_jsearch({"job_title": "X", "job_minimum_salary": 0, "job_maximum_salary": 0})
    assert out["salary"] is None
    assert out["salary_min"] is None


def test_normalize_adzuna_tolerates_missing_fields():
    out = _normalize_adzuna({})
    assert out["title"] == ""
    assert out["company"] == ""
    assert out["salary"] is None
    assert out["salary_currency"] == "INR"