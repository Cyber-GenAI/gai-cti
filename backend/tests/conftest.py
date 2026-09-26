from typing import Any, AsyncGenerator, Generator

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from httpx._transports.asgi import ASGITransport

# Adjust this import based on your project structure
from src.gai_cti_backend.app import app


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture()
def client() -> Generator:
    yield TestClient(app)


# @pytest.fixture()
# async def async_client(client) -> Generator:
#     async with AsyncClient(app=ASGITransport(app), base_url=client.base_url) as ac:
#         yield ac
