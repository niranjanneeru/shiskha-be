from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
import qrcode
from io import BytesIO
from PIL import Image
import uuid
from datetime import date

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
    # 1) Generate QR code
    qr = qrcode.make(f"https://localhost:5173/verify?code={certificate_id}")
    qr_buffer = BytesIO()
    qr.save(qr_buffer)
    qr_buffer.seek(0)
    qr_img = Image.open(qr_buffer)

    # 2) Prepare PDF canvas
    pdf_buffer = BytesIO()
    c = canvas.Canvas(pdf_buffer, pagesize=A4)
    width, height = A4

    # 3) Draw outer decorative border
    c.setLineWidth(4)
    c.setStrokeColor(colors.darkblue)
    c.rect(30, 30, width - 60, height - 60, stroke=1, fill=0)
    # Inner border
    c.setLineWidth(2)
    c.setStrokeColor(colors.lightblue)
    c.rect(40, 40, width - 80, height - 80, stroke=1, fill=0)

    # 4) Draw faint watermark
    c.saveState()
    c.setFont("Helvetica-Bold", 72)
    c.setFillColorRGB(0.85, 0.85, 0.85)
    c.translate(width/2, height/2)
    c.rotate(45)
    c.drawCentredString(0, 0, "CERTIFIED")
    c.restoreState()

    # 5) (Optional) Draw organization logo at top-left
    #    Replace 'assets/logo.png' with your actual logo path or buffer
    try:
        logo = Image.open("assets/logo.png")
        logo_buffer = BytesIO()
        logo.save(logo_buffer, format="PNG")
        logo_buffer.seek(0)
        c.drawInlineImage(logo_buffer, 50, height - 120, 100, 100)
    except FileNotFoundError:
        pass  # no logo, skip

    # 6) Title
    c.setFont("Helvetica-Bold", 28)
    c.setFillColor(colors.darkblue)
    c.drawCentredString(width/2, height - 100, "Certificate of Completion")

    # 7) User & Course details
    c.setFont("Helvetica", 14)
    c.setFillColor(colors.black)
    c.drawCentredString(width/2, height - 150, f"Awarded to: {user.nickname}")
    c.drawCentredString(width/2, height - 170, f"For successfully completing: {course.name}")

    # 8) Issued date & code
    c.drawCentredString(width/2, height - 210, f"Issued on: {date.today().isoformat()}")
    c.drawCentredString(width/2, height - 230, f"Certificate ID: {uuid.uuid4()}")

    # 9) Decorative seal (gold circle with text)
    seal_radius = 40
    seal_x, seal_y = 150, 150
    c.setLineWidth(3)
    c.setStrokeColor(colors.gold)
    c.circle(seal_x, seal_y, seal_radius, stroke=1, fill=0)
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(colors.gold)
    c.drawCentredString(seal_x, seal_y, "Seal of Excellence")

    # 10) Signature line
    sig_x, sig_y = width - 250, 120
    c.setStrokeColor(colors.black)
    c.setLineWidth(1)
    c.line(sig_x, sig_y, sig_x + 200, sig_y)
    c.setFont("Helvetica-Oblique", 12)
    c.drawString(sig_x, sig_y - 15, "Director Signature")

    # 11) QR code in bottom-right
    c.drawInlineImage(qr_img, width - 150, 50, 100, 100)

    # finalize
    c.showPage()
    c.save()
    pdf_buffer.seek(0)

    pdf_buffer.seek(0)
    s3.upload_fileobj(
        Fileobj=pdf_buffer,
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
