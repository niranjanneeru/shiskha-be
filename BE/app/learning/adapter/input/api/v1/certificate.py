from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy import select, and_
from core.db.session import session_factory
from core.fastapi.dependencies.permission import IsAuthenticated, PermissionDependency
from app.learning.domain.models import Course, user_courses_association, Certificate
from app.user.domain.entity.user import User
from core.config import config

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
import qrcode
from io import BytesIO

import boto3

S3_BUCKET_NAME = getattr(config, "AWS_S3_BUCKET_NAME", "certificates")
AWS_S3_REGION = getattr(config, "AWS_S3_REGION", "ap-south-1") 
AWS_ACCESS_KEY_ID = getattr(config, "AWS_ACCESS_KEY_ID", "525c3f1dea614d7053863fe064726e1c")
AWS_SECRET_ACCESS_KEY = getattr(config, "AWS_SECRET_ACCESS_KEY", "0b12d15532faf9a2d61fbe2de31107616c6aac4521bf02797387195a5bccf16d")

s3_client_instance = boto3.client(
    's3',
    region_name=AWS_S3_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)

router = APIRouter()

def generate_upload_certificate(user: User, course: Course, completion_status_row: tuple):
    qr = qrcode.make(f"https://yourdomain.com/verify?code={completion_status_row.id}")
    qr_buffer = BytesIO()
    qr.save(qr_buffer)
    qr_buffer.seek(0)

    # 2) setup PDF
    pdf_buffer = BytesIO()
    c = canvas.Canvas(pdf_buffer, pagesize=A4)
    width, height = A4

    # Title
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width/2, height - 100, "Certificate of Completion")

    # User & Course
    c.setFont("Helvetica", 14)
    c.drawCentredString(width/2, height - 150, f"Awarded to: {user.nickname}")
    c.drawCentredString(width/2, height - 170, f"For successfully completing: {course.name}")

    # Issued date & code
    from datetime import date
    c.drawCentredString(width/2, height - 210, f"Issued on: {date.today().isoformat()}")
    c.drawCentredString(width/2, height - 230, f"Certificate ID: {completion_status_row.id}")

    # QR code
    c.drawInlineImage(qr_buffer, width - 150, 50, 100, 100)
    c.showPage()
    c.save()

    pdf_buffer.seek(0)
    return pdf_buffer.getvalue()


@router.post("/course/{course_id}",
            response_model=list[dict],
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(PermissionDependency([IsAuthenticated]))],
    summary="Create Certificate for a Course",
    tags=["Learning - Certificate"],
    )
async def create_certificate(course_id: int, request: Request):
    user: User = request.user
    user_id = user.id
    async with session_factory() as session:
        course_exists_query = select(Course).where(Course.id == course_id)
        course_result = await session.execute(course_exists_query)
        target_course = course_result.scalars().first()
        if not target_course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

        existing_cert_query = select(Certificate).where(
            and_(
                Certificate.user_id == user_id,
                Certificate.course_id == course_id
            )
        )
        existing_cert_result = await session.execute(existing_cert_query)
        existing_certificate = existing_cert_result.scalars().first()

        if existing_certificate:
            return {
                "id": existing_certificate.id,
                "user_id": existing_certificate.user_id,
                "course_id": existing_certificate.course_id,
                "issue_date": existing_certificate.issue_date,
                "certificate_url": existing_certificate.certificate_url
            }

        completion_query = select(user_courses_association.c.completed).where(
            and_(
                user_courses_association.c.user_id == user_id,
                user_courses_association.c.course_id == course_id
            )
        )
        completion_status_result = await session.execute(completion_query)
        completion_status_row = completion_status_result.fetchone()

        if not completion_status_row:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You are not enrolled in this course."
            )
        
        if not completion_status_row.completed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have not yet completed this course."
            )

        url = generate_upload_certificate(user, target_course, completion_status_row)

        certificate = Certificate(
            user_id=user_id,
            course_id=course_id,
            certificate_url=url
        )
        session.add(certificate)
        await session.commit()
        await session.refresh(certificate)

        return {
            "id": certificate.id,
            "user_id": certificate.user_id,
            "course_id": certificate.course_id,
            "issue_date": certificate.issue_date,
            "certificate_url": certificate.certificate_url
        }
