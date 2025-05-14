from fastapi import APIRouter, status, HTTPException, Depends, Request
from sqlalchemy import select, insert
from sqlalchemy.orm import selectinload

import razorpay
from pydantic import BaseModel

from app.user.domain.entity.user import User
from app.learning.domain.models import (
    Specialisation,
    Course,
    user_specialisations_association,
    user_courses_association,
)
from core.db.session import session_factory
from core.fastapi.dependencies.permission import IsAuthenticated, PermissionDependency
from core.config import config

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


class PaymentVerificationRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    # Add any other fields you might send from your frontend if not using webhooks directly


@router.get(
    "",
    response_model=list[dict],
    status_code=status.HTTP_200_OK,
    summary="List all Specialisations",
    tags=["Learning - Specialisations"],
)
async def list_specialisations():
    """
    Retrieves a list of all specialisations with pagination.
    - **skip**: Number of specialisations to skip.
    - **limit**: Maximum number of specialisations to return.
    """
    query = select(Specialisation)
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
    "/enrolled",
    response_model=list[dict],
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(PermissionDependency([IsAuthenticated]))],
    summary="List all Enrolled Specialisations",
    tags=["Learning - Specialisations"],
)
async def list_enrolled_specialisations(request: Request):
    """
    Retrieves a list of all enrolled specialisations.
    - **skip**: Number of enrolled specialisations to skip.
    - **limit**: Maximum number of enrolled specialisations to return.
    """
    user_id = request.user.id

    async with session_factory() as session:
        # Fetch the user
        user_query = select(User).options(selectinload(User.specialisations_taken)).where(User.id == user_id)
        user_result = await session.execute(user_query)
        user = user_result.scalars().first()

        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        if not user.specialisations_taken:
            return []

    return [
        {
            "id": specialisation.id,
            "name": specialisation.name,
            "description": specialisation.description,
            "data": specialisation.data,
        }
        for specialisation in user.specialisations_taken
    ]


@router.get(
    "/{specialisation_id}",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    # dependencies=[Depends(PermissionDependency([IsAuthenticated]))], # Add auth if needed
    summary="Get a Specialisation by ID",
    tags=["Learning - Specialisations"],
)
async def get_specialisation_by_id(
    specialisation_id: int,
):
    query = (
        select(Specialisation)
        .options(selectinload(Specialisation.courses))
        .where(Specialisation.id == specialisation_id)
    )
    async with session_factory() as read_session:
        result = await read_session.execute(query)

    specialisations = result.scalars().all()

    if not specialisations:
        raise HTTPException(status_code=404, detail="Specialisation not found")

    specialisation = specialisations[0]

    return {
        "id": specialisation.id,
        "name": specialisation.name,
        "description": specialisation.description,
        "data": specialisation.data,
        "courses": [
            {
                "id": course.id,
                "name": course.name,
                "description": course.description,
                "data": course.data,
            }
            for course in specialisation.courses
        ],
    }


@router.post(
    "/register/{specialisation_id}",
    response_model=RazorpayOrderResponse,  # Define a response model
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(PermissionDependency([IsAuthenticated]))],
    summary="Register for a Specialisation and Create Razorpay Order",
    tags=["Learning - Specialisations"],
)
async def register_for_specialisation(specialisation_id: int, request: Request):
    """
    Allows an authenticated user to register for a specific specialisation.
    This endpoint initiates the payment process by creating a Razorpay order.
    """
    if not razorpay_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay client is not configured or SDK not installed.",
        )

    user_id = request.user.id
    async with session_factory() as session:
        user_query = select(User).options(selectinload(User.specialisations_taken)).where(User.id == user_id)
        user_result = await session.execute(user_query)
        user = user_result.scalars().first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        specialisation_query = select(Specialisation).where(Specialisation.id == specialisation_id)
        specialisation_result = await session.execute(specialisation_query)
        specialisation = specialisation_result.scalars().first()
        if not specialisation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specialisation not found")

        if len(user.specialisations_taken) == 0:
            user.specialisations_taken = []

        if specialisation_id in [specialisation.id for specialisation in user.specialisations_taken]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already enrolled in this specialisation",
            )

        amount_in_paise = specialisation.data["price"] * 100
        currency = "USD"

        # 5. Create Razorpay Order
        order_data = {
            "amount": amount_in_paise,
            "currency": currency,
            "receipt": f"receipt_user_{user_id}_spec_{specialisation_id}",  # Unique receipt ID
            "notes": {
                "user_id": str(user_id),
                "specialisation_id": str(specialisation_id),
                "specialisation_name": specialisation.name,
            },
        }

        try:
            order = razorpay_client.order.create(data=order_data)
        except Exception as e:
            # Log the error ideally
            print(f"Error creating Razorpay order: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not create Razorpay order.",
            ) from e

        # 6. Return order details to the frontend
        # The frontend will use this info + the Key ID to open the Razorpay checkout
        return RazorpayOrderResponse(
            order_id=order["id"],
            amount=order["amount"],
            currency=order["currency"],
            razorpay_key_id=config.RAZORPAY_KEY_ID,  # Send Key ID to frontend
        )


@router.post(
    "/audit/{specialisation_id}",
    response_model=dict,  # Define a response model
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(PermissionDependency([IsAuthenticated]))],
    summary="Register for a Specialisation Audit",
    tags=["Learning - Specialisations"],
)
async def register_for_audit(specialisation_id: int, request: Request):
    """
    Allows an authenticated user to register for a specific specialisation audit.
    """
    user_id = request.user.id
    async with session_factory() as session:
        user_query = select(User).options(selectinload(User.specialisations_taken), selectinload(User.courses_taken)).where(User.id == user_id)
        user_result = await session.execute(user_query)
        user = user_result.scalars().first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        specialisation_query = select(Specialisation).where(Specialisation.id == specialisation_id)
        specialisation_result = await session.execute(specialisation_query)
        specialisation = specialisation_result.scalars().first()
        if not specialisation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specialisation not found")

        if len(user.specialisations_taken) == 0:
            user.specialisations_taken = []

        if specialisation_id in [specialisation.id for specialisation in user.specialisations_taken]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already enrolled in this specialisation",
            )

        stmt = insert(user_specialisations_association).values(
            user_id=user.id, specialisation_id=specialisation.id, is_audit=True
        )
        await session.execute(stmt)
        courses_result = await session.execute(select(Course).where(Course.specialisation_id == specialisation_id))
        courses = courses_result.scalars().all()
        for course in courses:
            if user.courses_taken is None:
                user.courses_taken = []
            if course.id not in [enrolled_course.id for enrolled_course in user.courses_taken]:
                user.courses_taken.append(course)

        session.add(user)
        await session.commit()

        return {"status": "success"}


@router.post("/webhook/", status_code=status.HTTP_200_OK, include_in_schema=False)  # exclude from OpenAPI docs
async def razorpay_webhook(request: Request):
    if not razorpay_client:
        print("CRITICAL: Razorpay client not configured for webhook.")
        raise HTTPException(status_code=503, detail="Razorpay client not configured.")

    payload = await request.json()
    event = payload.get("event")

    # 4. Handle the 'payment.captured' event (most common for success)
    if event == "payment.captured":
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment_entity.get("order_id")
        payment_id = payment_entity.get("id")
        status = payment_entity.get("status")
        notes = payment_entity.get("notes", {})
        user_id_str = notes.get("user_id")
        specialisation_id_str = notes.get("specialisation_id")
        course_id_str = notes.get("course_id")

        print(f"Received payment.captured event for order_id: {order_id}, payment_id: {payment_id}")

        if not all([order_id, payment_id, status == "captured", user_id_str, specialisation_id_str or course_id_str]):
            print(f"Webhook Error: Missing required data in payment.captured payload for order {order_id}.")
            # Return 200 OK to Razorpay to acknowledge receipt, but log the error
            return {"status": "error", "message": "Payload missing required data"}

        async with session_factory() as session:
            try:
                user_id = int(user_id_str)

                if specialisation_id_str:
                    user_result = await session.execute(
                        select(User)
                        .options(selectinload(User.specialisations_taken))
                        .options(selectinload(User.courses_taken))
                        .where(User.id == user_id)
                    )
                    user = user_result.scalars().first()

                    if not user:
                        print(f"Webhook Error: User {user_id} not found for order {order_id}.")
                        return {"status": "error", "message": "User not found"}
                    specialisation_id = int(specialisation_id_str)
                    if user.specialisations_taken is None:
                        user.specialisations_taken = []
                    if specialisation_id not in [specialisation.id for specialisation in user.specialisations_taken]:
                        specialisation_obj = await session.get(Specialisation, specialisation_id)
                        user.specialisations_taken.append(specialisation_obj)
                        # Store that user_specialsation is not audiit is_audit = True
                        courses_result = await session.execute(
                            select(Course).where(Course.specialisation_id == specialisation_id)
                        )
                        courses = courses_result.scalars().all()
                        for course in courses:
                            if course.id not in [course.id for course in user.courses_taken]:
                                user.courses_taken.append(course)

                    session.add(user)
                    await session.commit()
                else:
                    user_result = await session.execute(
                        select(User).options(selectinload(User.courses_taken)).where(User.id == user_id)
                    )
                    user = user_result.scalars().first()

                    if not user:
                        print(f"Webhook Error: User {user_id} not found for order {order_id}.")
                        # Return 200 OK to Razorpay, log error
                        return {"status": "error", "message": "User not found"}
                    course_id = int(course_id_str)
                    if len(user.courses_taken) == 0:
                        user.courses_taken = []
                    if course_id not in [course.id for course in user.courses_taken]:
                        course_obj = await session.get(Course, course_id)
                        user.courses_taken.append(course_obj)

                    session.add(user)
                    await session.commit()

                print(f"Webhook Success: User {user_id} enrolled via payment {payment_id}.")
                return {"status": "success"}

            except Exception as e:
                await session.rollback()
                print(
                    f"Webhook DB Error: Failed to update enrollment for user {user_id_str}, payment {payment_id}. Error: {e}"
                )
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Database update failed during webhook processing.",
                ) from e

    else:
        print(f"Received unhandled Razorpay event: {event}")
        return {"status": "event_unhandled"}
