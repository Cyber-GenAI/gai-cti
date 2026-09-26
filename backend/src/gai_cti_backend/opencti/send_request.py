from typing import Any, Dict

from gql import Client
from gql.transport.httpx import HTTPXAsyncTransport
from graphql import DocumentNode

from ..conf import opencti_admin_token, opencti_gql_url

# docs: https://gql.readthedocs.io/en/latest/transports/httpx_async.html


async def send(query: DocumentNode, variables: Dict[str, Any]) -> Dict[str, Any]:
    transport = HTTPXAsyncTransport(
        url=opencti_gql_url,
        headers={"Authorization": f"Bearer {opencti_admin_token}"},
        timeout=6000,
    )
    async with Client(
        transport=transport, fetch_schema_from_transport=True, execute_timeout=6000.0
    ) as session:
        return await session.execute(
            document=query,
            variable_values=variables,
        )
