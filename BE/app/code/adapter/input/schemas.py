from pydantic import BaseModel, Field

class CodeSubmissionRequest(BaseModel):
    file_name: str = Field(..., description="Name of the file, e.g., main.py")
    file_content: str = Field(..., description="The actual content of the code file")
    language: str = Field(..., description="The programming language of the code") 