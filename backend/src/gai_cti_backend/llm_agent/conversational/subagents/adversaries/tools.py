from typing import Any, Dict, cast

from langchain.tools import tool
from langchain_core.tools import tool

from .....models.visual import HeatmapVisual
from .....routes.adversary import get_adversary_data, get_top_dashboard


# Adv tools
@tool(
    "get_adversary_info_tool",
    description=(
        "Retrieve detailed information about a specific adversary by ID. "
        "Includes profile, confidence, related rules, logs, indicators of compromise (IoCs), "
        "and structured sections for analyst use."
    ),
)
async def get_adversary_info_tool(adversary_id: str):
    try:
        adversary_data = await get_adversary_data(adversary_id)

        id = adversary_data.id
        name = adversary_data.name
        description = adversary_data.description
        confidence = adversary_data.confidence
        sections = [
            {
                "title": section.title,
                "description": section.description,
                "information": [
                    {"key": f.key, "value": f.value, "type": f.type}
                    for f in section.information
                ],
                "data": getattr(
                    section.data, "model_dump", lambda: str(section.data)
                )(),
            }
            for section in adversary_data.sections
        ]

        return {
            "id": id,
            "name": name,
            "description": description,
            "confidence": confidence,
            "sections": sections,
        }
    except Exception as e:
        raise RuntimeError(
            f"Failed extraction data of Adversary with ID {adversary_id}. Error: {e}"
        )


@tool(
    "get_specificity_data",
    description="""
    Extract specificity heatmap values between adversaries and TTPs from GAI-CTI dashboard.
    """,
)
async def get_specificity_data() -> str:

    dashboard = await get_top_dashboard()

    specificity_data = cast(HeatmapVisual, dashboard["specificity"].data)

    specificity = "\n".join(
        f"{row.id}: " + ", ".join(f"{point.x}={point.y}" for point in row.data)
        for row in specificity_data.value.data
    )

    return f"Specificity between Adversaries and TTPs:\n{specificity}"


# @tool(
#     "get_all_apt",
#     description=(
#         "Retrieve all adversaries (APTs) from the sidebar cache. "
#         "The tool returns a list of dictionaries where each dictionary "
#         "contains the APT's ID, name, sources, importance flag, and confidence score."
#     ),
# )
# async def get_all_apt():
#     try:
#         adv_data = await get_adversaries()
#         all_APT_data = []

#         for apt in adv_data:
#             apt = apt.model_dump()

#             APT = {
#                 "APT_id": apt["id"],
#                 "APT_name": apt["name"],
#                 "APT_sources ": apt["sources"],
#                 "APT_is_important": apt["is_important"],
#                 "APT_confidence ": apt["confidence"],
#             }

#         all_APT_data.append(APT)
#         return all_APT_data

#     except Exception as e:
#         raise RuntimeError(
#             f"Retrieving all Adversaries Failed. Error: {e}"
#         )
