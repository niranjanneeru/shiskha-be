from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, composite, relationship

from app.user.domain.vo.location import Location
from core.db import Base
from core.db.mixins import TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    nickname: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    is_admin: Mapped[bool] = mapped_column(default=False)
    location: Mapped[Location] = composite(mapped_column("lat"), mapped_column("lng"))

    courses_taken = relationship(
        "Course", # Use string "Course"
        secondary="user_courses", # Name of the association table
        back_populates="enrolled_users" # Matches 'enrolled_users' on Course model
    )

    specialisations_taken = relationship(
        "Specialisation", # Use string "Specialisation"
        secondary="user_specialisations", # Name of the association table
        back_populates="subscribed_users" # Matches 'subscribed_users' on Specialisation model
    )

    certificates = relationship("Certificate", back_populates="user")

    @classmethod
    def create(
        cls, *, email: str, password: str, nickname: str, location: Location
    ) -> "User":
        return cls(
            email=email,
            password=password,
            nickname=nickname,
            is_admin=False,
            location=location,
        )


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., title="USER ID")
    email: str = Field(..., title="Email")
    nickname: str = Field(..., title="Nickname")
