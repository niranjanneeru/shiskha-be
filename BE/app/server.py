from fastapi import Depends, FastAPI, Request
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.auth.adapter.input.api import router as auth_router
from app.container import Container
from app.user.adapter.input.api import router as user_router
from app.code.adapter.input.api import router as code_router
from app.learning.adapter.input.api import router as learning_router
from core.config import config
from core.exceptions import CustomException
from core.fastapi.dependencies import Logging
from core.fastapi.middlewares import (
    AuthBackend,
    AuthenticationMiddleware,
    ResponseLogMiddleware,
    SQLAlchemyMiddleware,
)
from core.helpers.cache import Cache, CustomKeyMaker, RedisBackend


def init_routers(app_: FastAPI) -> None:
    container = Container()
    user_router.container = container
    auth_router.container = container
    code_router.container = container
    learning_router.container = container
    app_.include_router(user_router)
    app_.include_router(auth_router)
    app_.include_router(code_router)
    app_.include_router(learning_router)


def init_listeners(app_: FastAPI) -> None:
    # Exception handler
    @app_.exception_handler(CustomException)
    async def custom_exception_handler(request: Request, exc: CustomException):
        return JSONResponse(
            status_code=exc.code,
            content={"error_code": exc.error_code, "message": exc.message},
        )


def on_auth_error(request: Request, exc: Exception):
    status_code, error_code, message = 401, None, str(exc)
    if isinstance(exc, CustomException):
        status_code = int(exc.code)
        error_code = exc.error_code
        message = exc.message

    return JSONResponse(
        status_code=status_code,
        content={"error_code": error_code, "message": message},
    )


def make_middleware() -> list[Middleware]:
    middleware = [
        Middleware(
            CORSMiddleware,
            allow_origins=["http://localhost:5173", "https://evident-upward-mudfish.ngrok-free.app"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        ),
        Middleware(
            AuthenticationMiddleware,
            backend=AuthBackend(),
            on_error=on_auth_error,
        ),
        Middleware(SQLAlchemyMiddleware),
        Middleware(ResponseLogMiddleware),
    ]
    return middleware


def init_cache() -> None:
    Cache.init(backend=RedisBackend(), key_maker=CustomKeyMaker())


def create_app() -> FastAPI:
    app_ = FastAPI(
        title="Hide",
        description="Hide API",
        version="1.0.0",
        docs_url=None if config.ENV == "production" else "/docs",
        redoc_url=None if config.ENV == "production" else "/redoc",
        dependencies=[Depends(Logging)],
        middleware=make_middleware(),
    )
    init_routers(app_=app_)
    init_listeners(app_=app_)
    init_cache()
    return app_


app = create_app()
