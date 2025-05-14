from typing import List
import requests
from fastapi import APIRouter, Depends, Response, status, HTTPException

from core.config import config
from core.fastapi.dependencies.permission import IsAuthenticated, PermissionDependency

from app.code.adapter.input.api.v1.request import CodeSubmissionRequest

router = APIRouter()

@router.get(
    "",
    response_model=List[str],
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(PermissionDependency([IsAuthenticated]))],
)
async def get_available_languages():
    """
    Returns a list of available programming languages from Piston API.
    Requires authentication.
    """
    response = requests.get(f"{config.PISTON_API}/api/v2/runtimes", timeout=100)
    runtimes_data = response.json()

    languages = [runtime.get("language") for runtime in runtimes_data if runtime.get("language")]
    return languages

@router.post(
    "",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(PermissionDependency([IsAuthenticated]))],
)
async def submit_code(payload: CodeSubmissionRequest):
    """
    Accepts code submission (file name, content, language) and returns a message.
    Requires authentication.
    In a real scenario, this endpoint would process/execute the code.
    """
    response = requests.get(f"{config.PISTON_API}/api/v2/runtimes", timeout=100)
    runtimes_data = response.json()

    runtime = next((runtime for runtime in runtimes_data if runtime.get("language") == payload.language), None)

    if not runtime:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid language")

    payload = {
        "language": runtime.get("language"),
        "version": runtime.get("version"),
        "files": [
        {
            "name": payload.file_name,
            "content": payload.file_content
        }
        ],
        "stdin": payload.stdin,
        "args": payload.args,
        "compile_timeout": 10000,
        "run_timeout": 3000,
        "compile_cpu_time": 10000,
        "run_cpu_time": 3000,
        "compile_memory_limit": -1,
        "run_memory_limit": -1
    }

    response = requests.post(f"{config.PISTON_API}/api/v2/execute", json=payload, timeout=100000)

    return response.json()
