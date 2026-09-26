import os
from datetime import datetime
from hashlib import sha256
from typing import Annotated, List

from fastapi import APIRouter, Body, Depends, HTTPException, Path, status
from fastapi.responses import JSONResponse

from ..models.user_management import (
    MyInfo,
    UserCreationRequest,
    UserObject,
    UsersTopTable,
    UsersTopTableRow,
)
from ..models.utils import Column, InputFieldWithType, TextOptions
from ..utils import apply_auth, redis_get, redis_remove, redis_search_objects, redis_set
from ..utils.redis import get_auth_redis_client

auth_redis_client = get_auth_redis_client()

ADMIN_USERNAME = os.getenv("USERNAME", "admin")

user_management_router = APIRouter()


@user_management_router.get("/is-admin")
async def check_user_is_admin(user_name: Annotated[str, Depends(apply_auth)]) -> bool:
    if user_name == ADMIN_USERNAME:
        return True
    return False


@user_management_router.put("/user")
async def create_user(
    request: UserCreationRequest,
    logged_in_user_name: Annotated[str, Depends(apply_auth)],
) -> JSONResponse:
    if logged_in_user_name == ADMIN_USERNAME:
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can visit this page",
        )
    try:
        user_obj = UserObject(
            lname=request.lname,
            fname=request.fname,
            username=request.username,
            hash_password=sha256((request.password).encode("utf8")).hexdigest(),
        )
        await redis_set(
            redis_client=auth_redis_client,
            prefix="user",
            key=request.username,
            obj=user_obj,
        )
        return JSONResponse(
            content=f"Username '{request.username}' successfully created."
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"User Creation failed: {e}")


@user_management_router.get("/form-template")
async def get_form_template(
    logged_in_user_name: Annotated[str, Depends(apply_auth)],
) -> List[InputFieldWithType]:
    if logged_in_user_name == ADMIN_USERNAME:
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can visit this page",
        )
    fields = {
        "username": "Username",
        "fname": "First Name",
        "lname": "Last Name",
        "password": "Password",
    }
    return [
        InputFieldWithType(
            key=key,
            title=title,
            type="text",
            default="",
            options=TextOptions(),
            tag="-",
        )
        for key, title in fields.items()
    ]


@user_management_router.get("/top-table")
async def get_top_table(
    logged_in_user_name: Annotated[str, Depends(apply_auth)],
) -> UsersTopTable:
    if logged_in_user_name == ADMIN_USERNAME:
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can visit this page",
        )
    user_objects = await redis_search_objects(
        redis_client=auth_redis_client, prefix="user", model=UserObject
    )
    users_objects = [
        UsersTopTableRow(**obj.model_dump())
        for _, obj in user_objects.items()
        if user_objects
    ]

    return UsersTopTable(
        rows=users_objects,
        columns={
            "username": Column(name="Username", type="text"),
            "fname": Column(name="First Name", type="text"),
            "lname": Column(name="Last Name", type="text"),
            "last_login": Column(name="Last Login", type="date"),
            "creation_date": Column(name="Creation Date", type="date"),
            "hash_password": Column(name="Last Login", type="hidden"),
            "actions": Column(name="Actions", type="action"),
        },
        total=len(users_objects),
    )


@user_management_router.patch("/user/{user_name}/password")
async def change_password(
    logged_in_user_name: Annotated[str, Depends(apply_auth)],
    user_name: Annotated[str, Path()],
    password: Annotated[str, Body(embed=True)],
) -> JSONResponse:
    if logged_in_user_name != ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can visit this page",
        )

    try:
        user_object = await redis_get(
            redis_client=auth_redis_client,
            prefix="user",
            key=user_name,
            model=UserObject,
        )

        if user_object:
            await redis_remove(
                redis_client=auth_redis_client, prefix="user", key=user_name
            )

            user_object.hash_password = sha256((password).encode("utf8")).hexdigest()
            await redis_set(
                redis_client=auth_redis_client,
                prefix="user",
                key=user_name,
                obj=user_object,
            )

            return JSONResponse(
                status_code=200,
                content=f"Password for user '{user_name}' updated successfully",
            )

        raise HTTPException(
            status_code=404,
            detail=f"Changing password for user '{user_name}' failed: Username not found!",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Changing password for user '{user_name}' failed: {e}",
        )


@user_management_router.delete("/user/{user_name}")
async def delete_user(
    user_name: str, logged_in_user_name: Annotated[str, Depends(apply_auth)]
) -> JSONResponse:
    if logged_in_user_name == ADMIN_USERNAME:
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can visit this page",
        )
    try:
        res = await redis_remove(
            redis_client=auth_redis_client, prefix="user", key=user_name
        )
        if res > 0:
            return JSONResponse(
                status_code=200, content=f"User '{user_name}' successfully deleted"
            )
        raise HTTPException(status_code=404, detail=f"User '{user_name}' not found")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error deleting user '{user_name}': {e}"
        )


@user_management_router.patch("/user/password")
async def change_my_password(
    logged_in_user_name: Annotated[str, Depends(apply_auth)],
    password: Annotated[str, Body(embed=True)],
) -> JSONResponse:
    if logged_in_user_name == ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The password of the admin account cannot be changed in this way.",
        )
    try:
        user_object = await redis_get(
            redis_client=auth_redis_client,
            prefix="user",
            key=logged_in_user_name,
            model=UserObject,
        )

        if user_object:
            await redis_remove(
                redis_client=auth_redis_client, prefix="user", key=logged_in_user_name
            )

            user_object.hash_password = sha256((password).encode("utf8")).hexdigest()
            await redis_set(
                redis_client=auth_redis_client,
                prefix="user",
                key=logged_in_user_name,
                obj=user_object,
            )

            return JSONResponse(
                status_code=200,
                content=f"Password for user '{logged_in_user_name}' updated successfully",
            )

        raise HTTPException(
            status_code=404,
            detail=f"Changing password for user '{logged_in_user_name}' failed: Username not found!",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Changing password for user '{logged_in_user_name}' failed: {e}",
        )


@user_management_router.patch("/user/{user_name}/update-login")
async def update_last_login_time(
    user_name: str, logged_in_user_name: Annotated[str, Depends(apply_auth)]
) -> JSONResponse:
    if logged_in_user_name == ADMIN_USERNAME:
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can visit this page",
        )
    try:
        user_object = await redis_get(
            redis_client=auth_redis_client,
            prefix="user",
            key=user_name,
            model=UserObject,
        )
        if user_object:
            user_object.last_login = datetime.now()

            await redis_remove(
                redis_client=auth_redis_client, prefix="user", key=user_name
            )

            await redis_set(
                redis_client=auth_redis_client,
                prefix="user",
                key=user_name,
                obj=user_object,
            )

            return JSONResponse(
                status_code=200,
                content=f"Last login for user '{user_name}' successfully updated",
            )
        raise HTTPException(status_code=404, detail=f"User '{user_name}' not found")

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating last login for user '{user_name}': {e}",
        )


@user_management_router.get("/me")
async def gen_current_user_info(
    logged_in_user_name: Annotated[str, Depends(apply_auth)],
) -> MyInfo:

    if logged_in_user_name == ADMIN_USERNAME:
        return MyInfo(
            lname="--",
            fname="--",
            username=logged_in_user_name,
            last_login=None,
            creation_date=None,
            is_admin=True,
        )
    else:
        user_object = await redis_get(
            redis_client=auth_redis_client,
            prefix="user",
            key=logged_in_user_name,
            model=UserObject,
        )

        assert user_object is not None

        return MyInfo(
            lname=user_object.lname,
            fname=user_object.fname,
            username=user_object.username,
            last_login=user_object.last_login,
            creation_date=user_object.creation_date,
            is_admin=False,
        )
