import asyncio
from contextlib import asynccontextmanager
from logging import getLogger

from celery import Task
from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware

from .background.celery_worker import get_active_tasks
from .elastic_client.rule import get_all_rules
from .routes.adversary import adversary_router
from .routes.alert import alert_router
from .routes.feeds import feeds_router
from .routes.home import home_router
from .routes.logs import logs_router
from .routes.management import management_router
from .routes.rules import rules_router
from .routes.ti import ti_router
from .routes.user_management import user_management_router
from .routes.utils import CACHE_KEYS, utils_router
from .socket_handler import get_socketio_app
from .utils import get_redis_client
from .utils.auth import apply_auth

logger = getLogger(__name__)


async def init_cache():
    while True:
        redis_client = get_redis_client()
        active_tasks = set(get_active_tasks())
        finished = True
        for key, func in CACHE_KEYS.items():
            assert isinstance(func, Task)
            if not func.__name__ in active_tasks and not await redis_client.exists(key):
                finished = False
                func.delay()
                print(f"Task {func} successfully sent")
                logger.info(f"Task {func} successfully sent")

        print("active_tasks:", get_active_tasks())

        if finished:
            return

        await asyncio.sleep(10)


@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(init_cache())
    yield


app = FastAPI(
    lifespan=lifespan,
    docs_url="/docs",
    root_path="/api",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def remove_www_authenticate_header(request: Request, call_next):
    response = await call_next(request)
    if response.headers.get("WWW-Authenticate"):
        del response.headers["WWW-Authenticate"]
    return response


app.include_router(
    utils_router,
    prefix="/utils",
    tags=["utilities"],
)
app.include_router(
    ti_router,
    prefix="/ti",
    tags=["threat intelligence"],
    dependencies=[Depends(apply_auth)],
)
app.include_router(
    feeds_router,
    prefix="/feeds",
    tags=["feeds table"],
    dependencies=[Depends(apply_auth)],
)
app.include_router(
    logs_router,
    prefix="/logs",
    tags=["logs"],
    dependencies=[Depends(apply_auth)],
)
app.include_router(
    rules_router,
    prefix="/rules",
    tags=["rules"],
    dependencies=[Depends(apply_auth)],
)
app.include_router(
    management_router,
    prefix="/mng",
    tags=["management"],
    dependencies=[Depends(apply_auth)],
)
app.include_router(
    alert_router,
    prefix="/alert",
    tags=["alert"],
    dependencies=[Depends(apply_auth)],
)
app.include_router(
    adversary_router,
    prefix="/adversary",
    tags=["adversary"],
    dependencies=[Depends(apply_auth)],
)
app.include_router(
    home_router,
    prefix="/home",
    tags=["home"],
    dependencies=[Depends(apply_auth)],
)
app.include_router(
    user_management_router,
    prefix="/user-management",
    tags=["user management"],
)  # apply_auth for '/user-management' endpoints, in its specific file
app.mount(
    "/socket.io",
    get_socketio_app(app),
    name="socketio",
)


@app.exception_handler(Exception)
async def internal_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error, Reason: {repr(exc)}"},
    )
