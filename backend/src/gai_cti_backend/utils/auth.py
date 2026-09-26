from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from .user_management import check_user_pass

security = HTTPBasic()


async def apply_auth(
    credentials: Annotated[HTTPBasicCredentials, Depends(security)],
) -> str:
    user_pass_is_valid = await check_user_pass(
        credentials.username, credentials.password
    )

    if not user_pass_is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )

    return credentials.username
