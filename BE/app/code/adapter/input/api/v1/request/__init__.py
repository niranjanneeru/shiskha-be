from pydantic import BaseModel, Field

class CodeSubmissionRequest(BaseModel):
    language: str = Field(..., description="The programming language to use")
    file_name: str = Field(..., description="The name of the file to create")
    file_content: str = Field(..., description="The content of the file to create")
    stdin: str = Field("", description="The input to the program")
    args: list[str] = Field([], description="The arguments to pass to the program")
