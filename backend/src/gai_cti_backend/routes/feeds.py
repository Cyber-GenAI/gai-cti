import os
import uuid
from collections import defaultdict
from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

import yaml
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import JSONResponse
from humanize import metric, naturalsize

from ..background.feed import update_map_organizations2connectors_async
from ..conf import opencti_admin_token, opencti_gql_url
from ..models.feed import (
    AllConnectorObjects,
    Column,
    ConfigRequest,
    Connector,
    ConnectorDirNameToConnectorName,
    FeedConnectorRow,
    FeedConnectorTable,
    FeedOrganizationRow,
    FeedOrganizationTable,
    OrganizationToConnectorMapCache,
    TopDashboardCache,
)
from ..models.utils import FieldWithType, InputFieldWithType, Markdown, TextOptions
from ..models.visual import (
    BarValue,
    BarVisual,
    HeatmapData,
    HeatmapVisual,
    MetricVisual,
    PieSlice,
    PieVisual,
    VisualResponse,
)
from ..opencti.feed import (
    change_feed_confidence_level_by_id,
    change_feed_reliability_by_id,
    delete_inactive_feed,
    get_all_deactivated_feeds,
    get_all_external_connectors,
    get_all_organizations,
    get_organization_by_id,
)
from ..utils.miscellaneous import humanize
from ..utils.redis import redis_get

feeds_router = APIRouter()


def parse_env_var(env: str, tag: str) -> InputFieldWithType | None:
    """Parse a single environment variable string into an InputFieldWithType."""
    if "=" not in env:
        print(f"Invalid env format: {env}")
        return None

    name, value = env.split("=", 1)  # only split on the first '='

    match name:
        case "OPENCTI_URL":
            default = opencti_gql_url.replace("/graphql", "")
        case "OPENCTI_TOKEN":
            default = opencti_admin_token
        case "CONNECTOR_ID":
            default = str(uuid.uuid5(uuid.NAMESPACE_URL, name + tag))

        case _:
            default = (
                None
                if (value.lower() == "changeme")
                or (value.lower() == "change_me")
                or value.startswith("${")
                else value
            )

    return InputFieldWithType(
        key=name,
        title=humanize(name),
        type="text",
        default=default,
        options=TextOptions(required=default != ""),
        tag=tag,
    )


def get_input_fields(envs: List[str], tag: str) -> List[InputFieldWithType]:
    """Convert environment variable strings into InputFieldWithType objects."""
    return [field for env in envs if (field := parse_env_var(env, tag))]


async def load_configurable_fields() -> List[InputFieldWithType]:
    """Extract configurable fields from the connectors directory."""
    result: List[InputFieldWithType] = []
    opencti_external_imports_path = "./artifacts/opencti-external-import"

    connector_dir2connector_name = (
        await redis_get(
            key="connector_dir_name_to_connector_name",
            prefix="feed",
            model=ConnectorDirNameToConnectorName,
        )
    ).root

    try:
        for connector_dir in connector_dir2connector_name:
            connector_path = f"{opencti_external_imports_path}/{connector_dir}"
            file_names = os.listdir(connector_path)
            compose_file_name = next(
                f for f in file_names if f.startswith("docker-compose")
            )

            with open(
                f"{opencti_external_imports_path}/{connector_dir}/{compose_file_name}"
            ) as f:
                config = yaml.safe_load(f)

            service_data = next(iter(config["services"].values()))

            expected_keys = {"image", "environment", "restart"}
            if set(service_data.keys()) == expected_keys:
                result.extend(
                    get_input_fields(
                        service_data["environment"],
                        connector_dir,
                    )
                )

    except Exception as e:
        print(f"Error reading config files: {e}")

    return result


def load_compose_config_for_connector(connector_dir_name: str) -> Optional[dict]:
    """Extract compose configuration for a specific connectors directory."""
    opencti_external_imports_path = "./artifacts/opencti-external-import"

    connector_path = f"{opencti_external_imports_path}/{connector_dir_name}"
    file_names = os.listdir(connector_path)
    compose_file_name = next(f for f in file_names if f.startswith("docker-compose"))

    target_compose_path = f"{connector_path}/{compose_file_name}"

    with open(target_compose_path, "rt") as f:
        config = yaml.safe_load(f)

    try:

        if not config or "services" not in config:
            return None

        # Return the service configuration for this connector
        if connector_dir_name in config["services"]:
            return config["services"][connector_dir_name]

        elif "connector-" + connector_dir_name in config["services"]:
            return config["services"]["connector-" + connector_dir_name]

    except Exception as e:
        print(f"Error loading compose config for {connector_dir_name}: {e}")
        return None

    return None


def gen_environment_part_of_connector(
    connector_config: Dict[str, Any],
) -> List[str]:
    """
    Generate environment variables list from connector config.
    Filters out None values and formats them as key=value strings.
    """
    env_vars = []
    for key, value in connector_config.items():
        match value:
            case bool():
                env_vars.append(f"{key}={str(value).lower()}")
            case str():
                if " " in value:
                    env_vars.append(f'"{key}={value}"')
                else:
                    env_vars.append(f"{key}={value}")
            case None:
                env_vars.append(f"{key}=${{{key}}}")
            case _:
                env_vars.append(f"{key}={value}")

    return env_vars


@feeds_router.get("/top-dashboard", response_model=Dict[str, VisualResponse])
async def get_top_dashboard() -> Dict[str, VisualResponse]:
    installed_connectors = await get_all_external_connectors()

    all_connectors_objects = await redis_get(
        prefix="feed", key="all_connector_objects", model=AllConnectorObjects
    )
    assert all_connectors_objects is not None

    actives_opencti = [feed["name"] for feed in installed_connectors if feed["active"]]

    active_connectors = []
    inactive_connectors = []

    for connector_obj in all_connectors_objects.root:
        if connector_obj.title in actives_opencti:
            active_connectors.append(connector_obj)
        else:
            inactive_connectors.append(connector_obj)

    feed_distribution_pie_slices: List[PieSlice] = [
        PieSlice(
            name="Active Commercial",
            percent=len([c for c in active_connectors if not c.is_free]),
        ),
        PieSlice(
            name="Active None-Commercial",
            percent=len([c for c in active_connectors if c.is_free]),
        ),
        PieSlice(
            name="Inactive Commercial",
            percent=len([c for c in inactive_connectors if not c.is_free]),
        ),
        PieSlice(
            name="Inactive None-Commercial",
            percent=len([c for c in inactive_connectors if c.is_free]),
        ),
    ]

    top_dashboard_data = await redis_get(
        key="top_dashboard", prefix="feed", model=TopDashboardCache
    )
    assert top_dashboard_data is not None

    visuals = {
        "total": MetricVisual(
            title="Total Supported Connectors",
            description="",
            value=str(len(all_connectors_objects.root)),
        ),
        "active": MetricVisual(
            title="Active Connectors",
            description="",
            value=str(len(actives_opencti)),
        ),
        "distribution-pie": PieVisual(
            title="Connector Distribution",
            description="",
            value=feed_distribution_pie_slices,
        ),
        "ioc-count": BarVisual(
            title="Collected Indicators per Organization",
            description="",
            value=BarValue(
                x_title="Organization",
                y_title=" IoC Count",
                x_accessor="feed",
                y_accessors=["count"],
                data=top_dashboard_data.ioc_count_per_feed_data,
            ),
        ),
        "ioc-count-over-time": HeatmapVisual(
            title="Collected Indicators over Time Per Organization",
            description="",
            value=HeatmapData(
                data=top_dashboard_data.ioc_count_over_time_per_feed_data,
                domain=(
                    0,
                    max(
                        [
                            hmap_point.y
                            for hmap_row in top_dashboard_data.ioc_count_over_time_per_feed_data
                            for hmap_point in hmap_row.data
                        ]
                    ),
                ),
            ),
        ),
    }

    return {
        k: VisualResponse(
            type=v.__class__.__name__,  # pyright: ignore[reportArgumentType]
            data=v,
        )
        for k, v in visuals.items()
    }


@feeds_router.get("/top-dashboard/ioc-heatmap", response_model=VisualResponse)
async def get_ioc_heatmap_filtered(
    from_ts: str = Query(
        ..., alias="from", description="Start timestamp in ISO format"
    ),
    to_ts: str = Query(..., alias="to", description="End timestamp in ISO format"),
):
    """
    Returns IoC count over time per organization, filtered by `from` and `to` timestamps.
    """

    # Parse timestamps
    try:
        from_dt = datetime.fromisoformat(from_ts)
        to_dt = datetime.fromisoformat(to_ts)
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Invalid timestamp format. Use ISO format."
        )

    if from_dt > to_dt:
        raise HTTPException(status_code=400, detail="`from` must be before `to`.")

    # Load cached top dashboard data
    top_dashboard_data = await redis_get(
        key="top_dashboard", prefix="feed", model=TopDashboardCache
    )
    assert top_dashboard_data is not None

    filtered_hmap_data: List = [
        hmap_row.model_copy(
            update={
                "data": [
                    hmap_point
                    for hmap_point in hmap_row.data
                    if from_dt <= datetime.fromisoformat(hmap_point.x) <= to_dt
                ]
            }
        )
        for hmap_row in top_dashboard_data.ioc_count_over_time_per_feed_data
    ]

    heatmap_visual = HeatmapVisual(
        title="Collected Indicators over Time Per Organization",
        description="",
        value=HeatmapData(
            data=filtered_hmap_data,
            domain=(
                0,
                max(
                    [
                        hmap_point.y
                        for hmap_row in filtered_hmap_data
                        for hmap_point in hmap_row.data
                    ]
                ),
            ),
        ),
    )

    return VisualResponse(type="HeatmapVisual", data=heatmap_visual)


@feeds_router.get("/main-table", response_model=FeedConnectorTable)
async def get_feeds_main_table() -> FeedConnectorTable:
    all_connector_objects = await redis_get(
        prefix="feed", key="all_connector_objects", model=AllConnectorObjects
    )
    assert all_connector_objects is not None
    title2name = {item.title: item.key for item in all_connector_objects.root}

    installed_connectors = await get_all_external_connectors()

    rows = []

    for connector in installed_connectors:
        name = connector["name"]
        if real_name := title2name.get(name):
            path = {"Show Help": f"/feeds/connector/{real_name}/help"}
            actions: List[Literal["Show Help"]] = ["Show Help"]
        else:
            path = {}
            actions = []

        rows.append(
            FeedConnectorRow(
                path=path,
                id=connector["id"],
                name=name,
                active=connector["active"],
                last_run=connector["connector_info"].get("last_run_datetime"),
                next_run=connector["connector_info"].get("next_run_datetime"),
                n_msg_in_queue=metric(
                    connector["connector_queue_details"].get("messages_number", -1)
                ),
                size_msg_in_queue=naturalsize(
                    connector["connector_queue_details"].get("messages_size", -1)
                ),
                actions=actions,
            )
        )

    return FeedConnectorTable(
        description=(
            "Table displaying all installed feed connectors from OpenCTI, "
            "including their status, last and next run times, and queue metrics."
        ),
        rows=rows,
        total=len(rows),
        columns={
            "path": Column(name="path", type="hidden"),
            "id": Column(name="ID", type="hidden"),
            "name": Column(name="Name", type="long_text"),
            "active": Column(name="Active", type="bool"),
            "last_run": Column(name="Last Run", type="date"),
            "next_run": Column(name="Next Run", type="date"),
            "n_msg_in_queue": Column(name="Queue Items Count", type="text"),
            "size_msg_in_queue": Column(name="Queue Size", type="text"),
            "actions": Column(name="Actions", type="action"),
        },
    )


@feeds_router.get("/second-table", response_model=FeedOrganizationTable)
async def get_feeds_second_table() -> FeedOrganizationTable:
    top_dashboard_data = await redis_get(
        key="top_dashboard", prefix="feed", model=TopDashboardCache
    )
    assert top_dashboard_data is not None

    ioc_count_per_org = {
        item["feed"]: item["count"]
        for item in top_dashboard_data.ioc_count_per_feed_data
    }

    orgs = await get_all_organizations()
    rows = []

    for org in orgs:
        name = org["name"]
        if total_count := ioc_count_per_org.get(name):
            rows.append(
                FeedOrganizationRow(
                    id=org["id"],
                    name=org["name"],
                    total_ioc_count=metric(int(total_count)),
                    confidence_level=org["confidence"],
                    reliability_level=org["x_opencti_reliability"],
                )
            )

    return FeedOrganizationTable(
        description=(
            "Table displaying organizations that have created one or more IoCs, "
            "including their confidence and reliability levels."
        ),
        rows=rows,
        total=len(rows),
        columns={
            "id": Column(name="ID", type="hidden"),
            "name": Column(name="Name", type="long_text"),
            "total_count": Column(name="Total IoC Count", type="text"),
            "reliability_level": Column(name="Reliability Level", type="text"),
            "confidence_level": Column(name="Confidence Level", type="number"),
        },
    )


@feeds_router.get("/connector", response_model=List[Connector])
async def get_connectors() -> List[Connector]:
    all_connector_objects = await redis_get(
        prefix="feed", key="all_connector_objects", model=AllConnectorObjects
    )
    assert all_connector_objects is not None
    return all_connector_objects.root


@feeds_router.get("/connector/organizations-map", response_model=List[FieldWithType])
async def get_connector_to_organizations_map() -> List[FieldWithType]:
    organization2connector_data = await redis_get(
        key="organizations2connectors",
        prefix="feed",
        model=OrganizationToConnectorMapCache,
    )
    assert organization2connector_data is not None

    conn2orgs = defaultdict(list)

    for item in organization2connector_data.maps:
        conn2orgs[item["connector"]["name"]].append(item["organization"]["name"])

    data = [
        FieldWithType(key=conn, value=orgs, type="labels")
        for conn, orgs in conn2orgs.items()
    ]

    return [
        FieldWithType(
            key="Connector Name", value="**Related Organizations**", type="text"
        ),
        *data,
    ]


@feeds_router.get(
    "/connector/configurable-fields", response_model=List[InputFieldWithType]
)
async def get_configurable_fields(conn_names: str) -> List[InputFieldWithType]:
    """API endpoint to fetch configurable fields."""
    conn_names_set = set(conn_names.split(","))
    return [
        item for item in await load_configurable_fields() if item.tag in conn_names_set
    ]


@feeds_router.post("/connector/delete-inactive")
async def cleanup_inactive_connectors():
    try:
        deactivated_feeds_ids = [
            feed["id"] for feed in (await get_all_deactivated_feeds())
        ]
        for id in deactivated_feeds_ids:
            await delete_inactive_feed(id)

        return JSONResponse(
            status_code=202,
            content={"message": f"Deletion process Successfully started"},
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Deletion of inactive feeds Failed: {e}",
        )


@feeds_router.post("/connector/configuration", response_model=str)
async def generate_configuration_yaml_file(request: ConfigRequest) -> Markdown:
    """
    Generates a docker-compose.yml configuration based on provided connector settings.
    Returns the result in Markdown format.
    """
    config = {"services": {}}

    for service_name, connector_data in request.root.items():
        temp_service = load_compose_config_for_connector(service_name)
        assert temp_service is not None
        connector_data = request.root[service_name]
        del temp_service["environment"]
        image = temp_service.pop("image")
        service = {}
        service["environment"] = gen_environment_part_of_connector(connector_data)

        service["image"] = f"docker.arvancloud.ir/{image}"

        service["restart"] = "always"
        service["depends_on"] = {"opencti": {"condition": "service_healthy"}}
        service_name = "connector-" + service_name
        config["services"][service_name] = service

    yml_content = (
        yaml.safe_dump(config, sort_keys=False).replace("\"'", '"').replace("'\"", '"')
    )

    md = f"""# Configuration
Edit the `opencti/docker-compose.feeds.yml` file with the following content and restart the system.
```yml
{yml_content}
"""

    return md


@feeds_router.get("/connector/{conn_name}/help", response_model=Markdown)
async def get_help_for_connector(conn_name: str) -> Markdown:
    opencti_external_imports_path = "./artifacts/opencti-external-import"
    try:
        with open(f"{opencti_external_imports_path}/{conn_name}/README.md", "rb") as f:
            return f.read().decode("utf-8")
    except:
        pass

    return "Doc not found :("


@feeds_router.get("/organization/{id}", response_model=List[FieldWithType])
async def organization(id: str) -> List[FieldWithType]:

    org = await get_organization_by_id(id)

    top_dashboard_data = await redis_get(
        key="top_dashboard", prefix="feed", model=TopDashboardCache
    )
    assert top_dashboard_data is not None

    ioc_count_per_org = {
        item["feed"]: item["count"]
        for item in top_dashboard_data.ioc_count_per_feed_data
    }

    count = ioc_count_per_org.get(org["name"], 0)

    return [
        FieldWithType(key="id", value=org["id"], type="text"),
        FieldWithType(key="name", value=org["name"], type="text"),
        FieldWithType(key="description", value=str(org["description"]), type="text"),
        FieldWithType(key="total IoC count", value=metric(int(count)), type="text"),
        FieldWithType(
            key="confidence", value=str(org["confidence"]), type="editable_text"
        ),
        FieldWithType(
            key="reliability",
            value=str(org["x_opencti_reliability"]),
            type="editable_reliability",
        ),
    ]


@feeds_router.patch("/organization/{id}/confidence")
async def change_confidence_level(id: str, data: int = 80):
    try:
        await change_feed_confidence_level_by_id(id=id, conf_level=data)
        return JSONResponse(
            status_code=202,
            content={
                "message": f"Changing confidence level of Feed Source '{id}' to '{data}' Successfully done"
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Changing confidence level of Feed source '{id}' Failed: {e}",
        )


@feeds_router.patch("/organization/{id}/reliability")
async def change_reliability_level(
    id: str,
    data: Literal[
        "A - Completely reliable",
        "B - Usually reliable",
        "C - Fairly reliable",
        "D - Not usually reliable",
        "E - Unreliable",
        "F - Reliability cannot be judged",
    ] = "A - Completely reliable",
):
    try:
        await change_feed_reliability_by_id(id=id, reliability=data)
        return JSONResponse(
            status_code=202,
            content={
                "message": f"Changing reliability level of Feed Source '{id}' to '{data}' Successfully done"
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Changing reliability level of Feed source '{id}' Failed: {e}",
        )
