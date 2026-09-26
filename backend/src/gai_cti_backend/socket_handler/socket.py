from typing import Any, Dict, Optional

import socketio
from socketio.exceptions import ConnectionRefusedError
from starlette.requests import Request

from ..conf import redis_conn_info
from ..utils.auth import apply_auth, security

mgr = socketio.AsyncRedisManager(
    f"redis://{redis_conn_info['host']}:{redis_conn_info['port']}/{redis_conn_info['db']}"
)

sio = socketio.AsyncServer(
    client_manager=mgr,
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)


@sio.event
async def connect(sid: str, environ: Any, auth: Optional[Dict[str, str]]):
    if auth is None or "token" not in auth:
        raise ConnectionRefusedError("No credentials are provided for authentication")

    try:
        credentials = await security(
            request=Request(
                {
                    "type": "http",
                    "headers": [(b"authorization", auth["token"].encode())],
                }
            )
        )
        assert credentials is not None
        username = await apply_auth(credentials)

    except:
        raise ConnectionRefusedError("Not authenticated, credentials are not valid.")

    await sio.emit(f"welcome", f"{username}, Welcome to the server!")


@sio.event
async def disconnect(sid):
    pass
