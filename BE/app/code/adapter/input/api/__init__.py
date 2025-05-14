from fastapi import APIRouter

from app.code.adapter.input.api.v1.code import router as code_v1_router

router = APIRouter()
router.include_router(code_v1_router, prefix="/api/v1/code", tags=["Code"])


__all__ = ["router"]
