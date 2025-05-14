from pydantic import BaseModel, ConfigDict


class SpecialisationBase(BaseModel):
    name: str
    description: str | None = None

class SpecialisationRead(SpecialisationBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
