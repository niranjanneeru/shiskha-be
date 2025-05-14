from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
import qrcode
from io import BytesIO
from PIL import Image
import uuid
from datetime import date
from PyPDF2 import PdfReader, PdfWriter

import boto3

from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy import select, and_

from core.db.session import session_factory
from core.fastapi.dependencies.permission import IsAuthenticated, PermissionDependency
from app.learning.domain.models import Course, user_courses_association, Certificate
from core.config import config
from app.user.domain.entity.user import User


S3_BUCKET_NAME = config.AWS_S3_BUCKET_NAME

s3 = boto3.client(
    's3',
    region_name=config.AWS_S3_REGION,
    aws_access_key_id=config.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=config.AWS_SECRET_ACCESS_KEY,
    endpoint_url=config.AWS_S3_ENDPOINT_URL
)

router = APIRouter()

def generate_upload_certificate(user: User, course: Course, completion_status_row: tuple):
    certificate_id = f"{user.id}-{course.id}"
    
    reader = PdfReader("/home/niranjan/Downloads/c.pdf")
    first_page = reader.pages[0]
    width = float(first_page.mediabox.width)
    height = float(first_page.mediabox.height)

    # 2) Create an in-memory PDF for overlays
    overlay_buffer = BytesIO()
    c = canvas.Canvas(overlay_buffer, pagesize=(width, height))

    # 3) Draw course name
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(width/2, height - 250, user.nickname)

    # 4) Draw student name
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(width/2, height - 350, course.name)

    # 5) Generate and draw the QR code
    qr = qrcode.make(f"https://localhost:5173/verify?code={certificate_id}")
    qr_buffer = BytesIO()
    qr.save(qr_buffer)
    qr_buffer.seek(0)
    qr_size = 100
    with open(f"/home/niranjan/Downloads/{certificate_id}.png", "wb") as qr_file:
        qr_file.write(qr_buffer.getvalue())
    c.drawImage(f"/home/niranjan/Downloads/{certificate_id}.png", width - qr_size - 50, 50, qr_size, qr_size)

    # 6) Finish overlay
    c.save()
    overlay_buffer.seek(0)

    # 7) Merge overlay onto the template
    overlay_pdf = PdfReader(overlay_buffer)
    base_page = reader.pages[0]
    base_page.merge_page(overlay_pdf.pages[0])

    # 8) Write out the new PDF locally
    writer = PdfWriter()
    writer.add_page(base_page)
    with open(f"/home/niranjan/Downloads/{certificate_id}.pdf", "wb") as out_f:
        writer.write(out_f)

    with open(f"/home/niranjan/Downloads/{certificate_id}.pdf", "rb") as pdf_file:
        s3.upload_fileobj(
            Fileobj=pdf_file,
        Bucket=S3_BUCKET_NAME,
        Key=f"certificates/{certificate_id}.pdf",
        ExtraArgs={"ContentType": "application/pdf"}
        )

    presigned_url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": S3_BUCKET_NAME, "Key": f"certificates/{certificate_id}.pdf"},
        ExpiresIn=3600  # link valid for 1 hour
    )
    print("Presigned URL (1h):", presigned_url)
    return presigned_url


@router.post("/course/{course_id}",
            response_model=dict,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(PermissionDependency([IsAuthenticated]))],
    summary="Create Certificate for a Course",
    tags=["Learning - Certificate"],
    )
async def create_certificate(course_id: int, request: Request):
    user: User = request.user
    user_id = user.id
    async with session_factory() as session:
        user = await session.get(User, user_id)
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

@router.get("/verify/{course_id}/{user_id}",
            response_model=dict,
            status_code=status.HTTP_200_OK,
            tags=["Learning - Certificate"],
            )
async def get_certificate(course_id: int, user_id: int):
    async with session_factory() as session:
        certificate_query = select(Certificate).where(
            and_(
                Certificate.course_id == course_id,
                Certificate.user_id == user_id
            )
        )
        certificate_result = await session.execute(certificate_query)
        certificate = certificate_result.scalars().first()
        if not certificate:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found.")

        return {
            "id": certificate.id,
            "user_id": certificate.user_id,
            "course_id": certificate.course_id,
            "issue_date": certificate.issue_date,
            "certificate_url": certificate.certificate_url
        }
