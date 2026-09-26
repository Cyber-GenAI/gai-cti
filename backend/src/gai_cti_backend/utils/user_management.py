import asyncio
import os
from hashlib import sha256

from ..models.user_management import (
    UserCreationRequest,
    UserObject,
    UsersTopTable,
    UsersTopTableRow,
)
from ..utils.redis import (
    get_auth_redis_client,
    redis_get,
    redis_remove,
    redis_search,
    redis_search_objects,
    redis_set,
)

auth_redis_client = get_auth_redis_client()


ADMIN_USERNAME = os.getenv("USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("PASSWORD", "admin")


async def check_user_pass(username: str, password: str) -> bool:
    if (username == ADMIN_USERNAME) and (password == ADMIN_PASSWORD):
        return True
    else:
        password_hex_digest = sha256((password).encode("utf8")).hexdigest()

        user_obj = await redis_get(
            redis_client=auth_redis_client,
            prefix="user",
            key=username,
            model=UserObject,
        )

        if not user_obj:
            return False

        else:
            if user_obj.hash_password == password_hex_digest:
                return True
            return False
