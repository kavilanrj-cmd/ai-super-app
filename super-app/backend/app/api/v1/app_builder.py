import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.services.app_builder_service import app_builder_service, AppBuilderError
from app.services.app_builder_providers import AIProviderError
from app.schemas.app_builder import GenerateRequest, IterateRequest, RenameRequest, DuplicateRequest, RepairRequest

logger = logging.getLogger("app_builder.api")

router = APIRouter(prefix="/app-builder", tags=["AI App Builder"])

ADMIN_ROLES = {UserRole.ADMIN}


def _preview_host(request: Request) -> str:
    """Prefer the host the user is actually browsing from (ip/domain, no port)."""
    host = request.headers.get("host", "localhost")
    if ":" in host:
        host = host.rsplit(":", 1)[0]
    return host or "localhost"


def _authorize_project(project_id: str, current_user: User) -> None:
    """Enforce project ownership (admin sees everything; ownerless projects are adopted)."""
    if current_user.role in ADMIN_ROLES:
        return
    owner = app_builder_service.get_owner(project_id)
    if owner is None:
        app_builder_service.adopt_project(project_id, current_user.id)
        return
    if owner != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this project.")


def _handle(exc: Exception) -> HTTPException:
    if isinstance(exc, (AppBuilderError, AIProviderError)):
        detail = str(exc)
        code = 422 if "Invalid project id" in detail or "Empty file" in detail or "Escaped" in detail or "traversal" in detail else 400
        if "Ollama" in detail or "not running" in detail:
            code = 503
        return HTTPException(status_code=code, detail=detail)
    logger.exception("App Builder error: %s", exc)
    return HTTPException(status_code=500, detail=f"App Builder failed: {exc}")


@router.get("/status")
async def app_builder_status(current_user: User = Depends(get_current_user)):
    return await app_builder_service.check_status()


@router.get("/projects")
async def list_projects(current_user: User = Depends(get_current_user)):
    projects = app_builder_service.list_projects()
    if current_user.role not in ADMIN_ROLES:
        projects = [p for p in projects if p.get("owner_user_id") in (None, current_user.id)]
    return {"projects": projects}


@router.post("/generate")
async def generate_app(req: GenerateRequest, current_user: User = Depends(get_current_user)):
    try:
        return await app_builder_service.create_project(req.prompt, owner_user_id=current_user.id)
    except Exception as exc:
        raise _handle(exc)


@router.post("/{project_id}/iterate")
async def iterate_app(project_id: str, req: IterateRequest, current_user: User = Depends(get_current_user)):
    _authorize_project(project_id, current_user)
    try:
        return await app_builder_service.iterate_project(project_id, req.prompt)
    except Exception as exc:
        raise _handle(exc)


@router.post("/{project_id}/build")
async def build_app(project_id: str, current_user: User = Depends(get_current_user)):
    _authorize_project(project_id, current_user)
    try:
        return await app_builder_service.build_project(project_id)
    except Exception as exc:
        raise _handle(exc)


@router.get("/{project_id}/files")
async def project_files(project_id: str, current_user: User = Depends(get_current_user)):
    _authorize_project(project_id, current_user)
    try:
        return {"files": app_builder_service.list_files(project_id)}
    except Exception as exc:
        raise _handle(exc)


@router.get("/{project_id}/file")
async def project_file(project_id: str, path: str = Query(...), current_user: User = Depends(get_current_user)):
    _authorize_project(project_id, current_user)
    try:
        return app_builder_service.read_file(project_id, path)
    except Exception as exc:
        raise _handle(exc)


@router.get("/{project_id}/download")
async def download_app(project_id: str, current_user: User = Depends(get_current_user)):
    _authorize_project(project_id, current_user)
    try:
        filename, payload = app_builder_service.download_project(project_id)
    except Exception as exc:
        raise _handle(exc)
    return StreamingResponse(
        iter([payload.getvalue()]),
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/{project_id}/preview/start")
async def start_preview(project_id: str, request: Request, current_user: User = Depends(get_current_user)):
    _authorize_project(project_id, current_user)
    try:
        return await app_builder_service.start_preview(project_id, _preview_host(request))
    except Exception as exc:
        raise _handle(exc)


@router.post("/{project_id}/preview/stop")
async def stop_preview(project_id: str, current_user: User = Depends(get_current_user)):
    _authorize_project(project_id, current_user)
    try:
        return await app_builder_service.stop_preview(project_id)
    except Exception as exc:
        raise _handle(exc)


@router.post("/{project_id}/preview/restart")
async def restart_preview(project_id: str, request: Request, current_user: User = Depends(get_current_user)):
    _authorize_project(project_id, current_user)
    try:
        return await app_builder_service.restart_preview(project_id, _preview_host(request))
    except Exception as exc:
        raise _handle(exc)


@router.post("/{project_id}/rename")
async def rename_project(project_id: str, req: RenameRequest, current_user: User = Depends(get_current_user)):
    _authorize_project(project_id, current_user)
    try:
        return app_builder_service.rename_project(project_id, req.name)
    except Exception as exc:
        raise _handle(exc)


@router.post("/{project_id}/duplicate")
async def duplicate_project(project_id: str, req: DuplicateRequest, current_user: User = Depends(get_current_user)):
    _authorize_project(project_id, current_user)
    try:
        return await app_builder_service.duplicate_project(project_id, req.name, owner_user_id=current_user.id)
    except Exception as exc:
        raise _handle(exc)


@router.delete("/{project_id}")
async def delete_project(project_id: str, current_user: User = Depends(get_current_user)):
    _authorize_project(project_id, current_user)
    try:
        return await app_builder_service.delete_project(project_id)
    except Exception as exc:
        raise _handle(exc)


@router.post("/{project_id}/repair")
async def repair_project(project_id: str, req: RepairRequest, current_user: User = Depends(get_current_user)):
    _authorize_project(project_id, current_user)
    try:
        return await app_builder_service.repair_project(project_id, req.errors)
    except Exception as exc:
        raise _handle(exc)