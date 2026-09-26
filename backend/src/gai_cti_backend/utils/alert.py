from typing import Optional

from elastic_transport import ObjectApiResponse

from ..elastic_client.utils import get_es
from ..opencti.indicator import get_indicator_by_id, get_indicator_id_by_stix_id


async def get_alert(alert_id: str) -> ObjectApiResponse:
    elastic_client = get_es()
    index_name = ".internal.alerts-security.alerts-default-*"
    body = {"query": {"ids": {"values": [alert_id]}}}
    response = await elastic_client.search(index=index_name, body=body)
    await elastic_client.close()

    return response


async def extract_opencti_id_from_elasticsearch_event_id(
    es_index_name: str, es_event_id: str
):
    es = get_es()
    index_name = f"{es_index_name}*"
    body = {"query": {"ids": {"values": [es_event_id]}}}
    response = await es.search(index=index_name, body=body)
    await es.close()

    return response["hits"]["hits"][0]["_source"]["threatintel"]["opencti"][
        "internal_id"
    ]


async def get_alert_ti_info(alert_id: str) -> Optional[dict]:
    ti_opencti_indicator_id = None
    try:
        response = await get_alert(alert_id)
        rule = response["hits"]["hits"][0]
        if rule["_source"]["kibana.alert.rule.parameters"]["type"] == "threat_match":
            assert "threat" in rule["_source"], "related rule does not have `threat`"

            ti_elasticsearch_event_id = rule["_source"]["threat"]["enrichments"][0][
                "matched"
            ]["id"]
            ti_elasticsearch_event_index_name = rule["_source"]["threat"][
                "enrichments"
            ][0]["matched"]["index"]
            ti_opencti_indicator_id = (
                await extract_opencti_id_from_elasticsearch_event_id(
                    ti_elasticsearch_event_index_name, ti_elasticsearch_event_id
                )
            )
            return await get_indicator_by_id(ti_opencti_indicator_id)
    except Exception as e:
        print(
            f"ERROR: ti id is not in opencti, {alert_id}, {ti_opencti_indicator_id=}, reason: {str(e)}"
        )

    return None
