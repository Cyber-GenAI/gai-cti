from langchain_core.tools import tool

from .....routes.feeds import get_help_for_connector, organization


# Feed tools
@tool(
    "get_organization_info_tool",
    description="Retrieve detailed information about an organization by its ID. ",
)
async def get_organization_info_tool(org_id: str):
    try:
        org__obj = await organization(org_id)
        org_data_text = ", ".join([f"{field.key}: {field.value}" for field in org__obj])
        return org_data_text
    except:
        return "No Organization found by this name"


@tool(
    "get_help_for_connector_tool",
    description="Retrieve a help for a feed source (connector) by its connector help url path. "
    "Includes config parameters and installation guide, name, description about the connector.",
)
async def get_help_for_connector_tool(conn_help_path: str):
    conn_name = conn_help_path.split("/")[3]
    conn_help = await get_help_for_connector(conn_name)
    return conn_help
