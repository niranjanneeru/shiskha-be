from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
    Table,
    CheckConstraint,
    JSON,
    BigInteger,
    Boolean,
)
from sqlalchemy.orm import relationship
from sqlalchemy import func

from core.db import Base
from core.db.mixins import TimestampMixin


user_courses_association = Table(
    "user_courses",
    Base.metadata,
    Column("user_id", BigInteger, ForeignKey("user.id", ondelete="CASCADE"), primary_key=True),
    Column("course_id", Integer, ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True),
    Column("completed", Boolean, default=False),
    Column("completed_at", DateTime, default=None),
    Column("is_audit", Boolean, default=False),
    Column("enrolled_at", DateTime, default=func.now()),
)


user_specialisations_association = Table(
    "user_specialisations",
    Base.metadata,
    Column("user_id", BigInteger, ForeignKey("user.id", ondelete="CASCADE"), primary_key=True),
    Column("specialisation_id", Integer, ForeignKey("specialisations.id", ondelete="CASCADE"), primary_key=True),
    Column("completed", Boolean, default=False),
    Column("completed_at", DateTime, default=None),
    Column("is_audit", Boolean, default=False),
    Column("enrolled_at", DateTime, default=func.now()),
)


class Specialisation(Base, TimestampMixin):
    __tablename__ = "specialisations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    data = Column(JSON, nullable=True)

    courses = relationship("Course", back_populates="specialisation")

    subscribed_users = relationship(
        "User", secondary=user_specialisations_association, back_populates="specialisations_taken"
    )

    certificates = relationship("Certificate", back_populates="specialisation")

    def __repr__(self):
        return f"<Specialisation(name='{self.name}')>"


class Course(Base, TimestampMixin):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=True)
    data = Column(JSON, nullable=True)

    contents = relationship("CourseContents", back_populates="course")

    specialisation_id = Column(Integer, ForeignKey("specialisations.id"), nullable=False)
    specialisation = relationship("Specialisation", back_populates="courses")

    enrolled_users = relationship("User", secondary=user_courses_association, back_populates="courses_taken")

    certificates = relationship("Certificate", back_populates="course")

    def __repr__(self):
        return f"<Course(name='{self.name}')>"


class Certificate(Base, TimestampMixin):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    issue_date = Column(DateTime, default=func.now(), nullable=False)
    certificate_url = Column(String(255), unique=True, nullable=True)  # e.g., link to a PDF

    user_id = Column(
        BigInteger, ForeignKey("user.id", ondelete="CASCADE"), nullable=False
    )
    user = relationship("User", back_populates="certificates")

    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    course = relationship("Course", back_populates="certificates")

    specialisation_id = Column(Integer, ForeignKey("specialisations.id"), nullable=True)
    specialisation = relationship("Specialisation", back_populates="certificates")

    __table_args__ = (
        CheckConstraint(
            "(course_id IS NOT NULL AND specialisation_id IS NULL) OR (course_id IS NULL AND specialisation_id IS NOT NULL)",
            name="ck_certificate_target_not_null_exclusive",
        ),
    )

    def __repr__(self):
        target_type = "Course" if self.course_id else "Specialisation"
        target_id = self.course_id if self.course_id else self.specialisation_id
        return f"<Certificate(user_id={self.user_id}, target='{target_type} {target_id}')>"

class CourseContents(Base, TimestampMixin):
    __tablename__ = "course_contents"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    course = relationship("Course", back_populates="contents")

    content_type = Column(String(255), nullable=False)
    content_url = Column(String(255), nullable=False)
    content_data = Column(JSON, nullable=True)
    content_text = Column(Text, nullable=True)

    def __repr__(self):
        return f"<CourseContents(course_id={self.course_id}, content_type='{self.content_type}')>"
