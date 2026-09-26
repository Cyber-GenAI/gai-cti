import json

from langchain_core.tools import tool

from .....models.ti import TITableRequest
from .....opencti.indicator import get_indicator_by_id
from .....opencti.malware import get_malware_info
from .....routes.ti import get_ti_table
from ....data_processors import process_ti_response


# TI tools
@tool(
    "get_ioc_info",
    description="Retrieve detailed Threat Intelligence (TI) data about a specific indicator (e.g., hash, domain, IP, URL) from Elasticsearch using its TI ID.",
)
async def get_ioc_info_tool(ti_id):
    indicator_data = await get_indicator_by_id(ti_id)
    return indicator_data


@tool(
    "get_malware_info",
    description="Retrieve detailed Threat Intelligence (TI) data about a specific Malware from Elasticsearch using its TI ID.",
)
async def get_malware_info_tool(malware_id: str):
    malware_data = await get_malware_info(malware_id)
    return malware_data


@tool(
    "",
    description="""
    Query the Threat Intelligence (TI) indicators table with optional filters.
    
    This tool retrieves threat intelligence data including indicators, their types,
    scores, confidence levels, and associated metadata.
    
    Use this tool when you need to:
    - Find threat indicators (IPs, domains, malware, etc.)
    - Filter indicators by type, score, confidence, labels, or feed source
    - Get paginated results of threat intelligence data
    - Search for specific indicators by name
    
    Args:
        page_size: Number of results per page (default 25)
        cursor: Pagination cursor for next page (optional)
        filters: List of filters with field, values, and operator
    
    Returns:
        A formatted string with indicator details including name, type, score, 
        confidence, reliability, labels, and feed source.
    """,
)
async def get_ti_table_with_filter_tool(request: TITableRequest) -> str:
    result = await get_ti_table(request)
    processed_data = process_ti_response(result)

    return json.dumps(processed_data, indent=2)
