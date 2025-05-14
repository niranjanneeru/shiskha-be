from fastapi import APIRouter

from app.learning.adapter.input.api.v1.specification import router as specification_v1_router
from app.learning.adapter.input.api.v1.course import router as course_v1_router
from app.learning.adapter.input.api.v1.content import router as content_v1_router
from app.learning.adapter.input.api.v1.certificate import router as certificate_v1_router
router = APIRouter()
router.include_router(
    specification_v1_router, prefix="/api/v1/learning/specialisations", tags=["Learning - Specialisations"]
)
router.include_router(course_v1_router, prefix="/api/v1/learning/courses", tags=["Learning - Courses"])
router.include_router(content_v1_router, prefix="/api/v1/learning/contents", tags=["Learning - Contents"])
router.include_router(certificate_v1_router, prefix="/api/v1/learning/certificates", tags=["Learning - Certificates"])

__all__ = ["router"]
