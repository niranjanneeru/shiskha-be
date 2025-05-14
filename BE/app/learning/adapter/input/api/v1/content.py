from fastapi import APIRouter, Depends, status, Request
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.learning.domain.models import CourseContents, Course
from app.user.domain.entity.user import User
from core.db.session import session_factory
from core.fastapi.dependencies.permission import IsAuthenticated, PermissionDependency
from fastapi import HTTPException

router = APIRouter()


@router.get(
    "/{course_id}",
    response_model=list[dict],
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(PermissionDependency([IsAuthenticated]))],
    summary="List all Course Contents",
    tags=["Learning - Course Contents"],
)
async def get_course_contents(course_id: int, request: Request):
    query = select(CourseContents).where(CourseContents.course_id == course_id)
    async with session_factory() as read_session:
        user = select(User).options(selectinload(User.courses_taken)).where(User.id == request.user.id)
        user_result = await read_session.execute(user)
        user = user_result.scalars().first()
        if course_id not in [course.id for course in user.courses_taken]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not enrolled in this course")
        result = await read_session.execute(query)

    return [
        {
            "id": content.id,
            "course_id": content.course_id,
            "content_type": content.content_type,
            "content_url": content.content_url,
            "content_data": content.content_data,
            "content_text": content.content_text,
        }
        for content in result.scalars().all()
    ]
