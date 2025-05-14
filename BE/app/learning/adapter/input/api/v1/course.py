from fastapi import APIRouter, status, HTTPException, Depends
from fastapi import Request

from sqlalchemy import select, insert
from sqlalchemy.orm import selectinload
import razorpay
from pydantic import BaseModel

from app.user.domain.entity.user import User
from app.learning.domain.models import Course, user_courses_association
from core.db.session import session_factory
from core.config import config
from core.fastapi.dependencies.permission import IsAuthenticated, PermissionDependency

router = APIRouter()

razorpay_client = None
try:
    key_id = config.RAZORPAY_KEY_ID
    key_secret = config.RAZORPAY_KEY_SECRET
    if key_id and key_secret:
        razorpay_client = razorpay.Client(auth=(key_id, key_secret))
    else:
        print("Warning: Razorpay API keys not found in environment variables.")
except ImportError:
    print("Warning: Razorpay SDK not installed. Run 'pip install razorpay'.")


class RazorpayOrderResponse(BaseModel):
    order_id: str
    amount: int  # Amount in paise
    currency: str
    razorpay_key_id: str  # Send key_id to frontend


@router.get(
    "",
    response_model=list[dict],
    status_code=status.HTTP_200_OK,
    summary="List all Courses",
    tags=["Learning - Courses"],
)
async def list_courses():
    """
    Retrieves a list of all courses with pagination.
    - **skip**: Number of courses to skip.
    - **limit**: Maximum number of courses to return.
    """
    query = select(Course)
    async with session_factory() as read_session:
        result = await read_session.execute(query)

    return [
        {
            "id": specialisation.id,
            "name": specialisation.name,
            "description": specialisation.description,
            "data": specialisation.data,
        }
        for specialisation in result.scalars().all()
    ]


@router.get(
    "/specialisations/{specialisation_id}",
    response_model=list[dict],
    status_code=status.HTTP_200_OK,
    summary="List all Courses for a specific Specialisation",
    tags=["Learning - Courses"],
)
async def list_courses_by_specialisation(specialisation_id: int):
    """
    Retrieves a list of all courses for a specific specialisation.
    """
    query = select(Course).where(Course.specialisation_id == specialisation_id)
    async with session_factory() as read_session:
        result = await read_session.execute(query)

    return [
        {
            "id": course.id,
            "name": course.name,
            "description": course.description,
            "data": course.data,
        }
        for course in result.scalars().all()
    ]

@router.get(
    "/enrolled",
    response_model=list[dict],
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(PermissionDependency([IsAuthenticated]))],
    summary="List all Enrolled Courses",
    tags=["Learning - Courses"],
)
async def list_enrolled_courses(request: Request):
    """
    Retrieves a list of all enrolled courses.
    """
    user_id = request.user.id

    async with session_factory() as session:
        user_query = select(User).options(selectinload(User.courses_taken)).where(User.id == user_id)
        user_result = await session.execute(user_query)
        user = user_result.scalars().first()

        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        if not user.courses_taken:
            return []

    return [
        {
            "id": course.id,
            "name": course.name,
            "description": course.description,
            "data": course.data,
        }
        for course in user.courses_taken
    ]


@router.get(
    "/{course_id}",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    # dependencies=[Depends(PermissionDependency([IsAuthenticated]))], # Add auth if needed
    summary="Get a Course by ID",
    tags=["Learning - Courses"],
)
async def get_course_by_id(
    course_id: int,
):
    query = (
        select(Course)
        .options(selectinload(Course.specialisation))
        .where(Course.id == course_id)
    )
    async with session_factory() as read_session:
        result = await read_session.execute(query)

    courses = result.scalars().all()

    if not courses:
        raise HTTPException(status_code=404, detail="Course not found")

    course = courses[0]

    return {
        "id": course.id,
        "name": course.name,
        "description": course.description,
        "data": course.data,
        "specialisation": {
            "id": course.specialisation.id,
            "name": course.specialisation.name,
            "description": course.specialisation.description,
            "data": course.specialisation.data,
        },
    }


@router.post(
    "/register/{course_id}",
    response_model=RazorpayOrderResponse,  # Define a response model
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(PermissionDependency([IsAuthenticated]))],
    summary="Register for a Course and Create Razorpay Order",
    tags=["Learning - Courses"],
)
async def register_for_course(course_id: int, request: Request):
    """
    Allows an authenticated user to register for a specific course.
    This endpoint initiates the payment process by creating a Razorpay order.
    """
    if not razorpay_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay client is not configured or SDK not installed.",
        )

    user_id = request.user.id
    async with session_factory() as session:
        user_query = select(User).options(selectinload(User.courses_taken)).options(selectinload(User.specialisations_taken)).where(User.id == user_id)
        user_result = await session.execute(user_query)
        user = user_result.scalars().first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        course_query = select(Course).where(Course.id == course_id)
        course_result = await session.execute(course_query)
        course = course_result.scalars().first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

        if course_id in (user.courses_taken or []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already enrolled in this course",
            )

        if course.specialisation_id in (user.specialisations_taken or []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already enrolled in this specialisation",
            )

        amount_in_paise = course.data["price"] * 100
        currency = "USD"

        order_data = {
            "amount": amount_in_paise,
            "currency": currency,
            "receipt": f"receipt_user_{user_id}_course_{course_id}",  # Unique receipt ID
            "notes": {
                "user_id": str(user_id),
                "course_id": str(course_id),
                "course_name": course.name,
            },
        }

        try:
            order = razorpay_client.order.create(data=order_data)
        except Exception as e:
            print(f"Error creating Razorpay order: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not create Razorpay order.",
            ) from e

        return RazorpayOrderResponse(
            order_id=order["id"],
            amount=order["amount"],
            currency=order["currency"],
            razorpay_key_id=config.RAZORPAY_KEY_ID,  # Send Key ID to frontend
        )


@router.post(
    "/audit/{course_id}",
    response_model=dict,  # Define a response model
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(PermissionDependency([IsAuthenticated]))],
    summary="Register for a Course Audit",
    tags=["Learning - Courses"],
)
async def register_for_audit(course_id: int, request: Request):
    """
    Allows an authenticated user to register for a specific course audit.
    """
    user_id = request.user.id
    async with session_factory() as session:
        user_query = select(User).options(selectinload(User.courses_taken)).where(User.id == user_id)
        user_result = await session.execute(user_query)
        user = user_result.scalars().first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        course_query = select(Course).where(Course.id == course_id)
        course_result = await session.execute(course_query)
        course = course_result.scalars().first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

        if len(user.courses_taken) == 0:
            user.courses_taken = []

        if course_id in [course.id for course in user.courses_taken]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already enrolled in this course",
            )

        stmt = insert(user_courses_association).values(
            user_id=user.id, course_id=course.id, is_audit=True
        )
        await session.execute(stmt)
        await session.commit()

        return {"status": "success"}
