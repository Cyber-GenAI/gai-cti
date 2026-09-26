from itertools import chain, groupby
from statistics import mean
from typing import Dict, List, Set, Tuple

from ..elastic_client.alert import get_all_alert_as_concise_obj
from ..models.adversary import (
    AdversaryDetectionIoCBaseResult,
    AdversaryDetectionResults,
    AdversaryDetectionSigBaseResult,
    IocSpec,
    SpecificityScore,
)
from ..models.alert import AlertConcise
from ..models.home import IntrusionSets2IoCCache
from ..models.ti import TTP
from ..opencti.indicator import get_indicators_by_id_bulk
from ..utils import get_adversary_specificity
from ..utils.redis import redis_get, redis_set

type AlertID = str
type RuleID = str

type IoCStixId = str
type AlertConciseIndexInAllAlertsList = int


def get_specificity_per_rule_id(
    all_alerts: List[AlertConcise],
    specificities: Dict[TTP, SpecificityScore],
) -> Dict[RuleID, SpecificityScore]:
    specificity_per_rule_id = {}
    for rule_id, alerts in groupby(all_alerts, lambda x: x.rule_id):
        alert = next(alerts)  # get a sample
        specificity_per_rule_id[rule_id] = (
            max(specificities.get(ttp, 0) for _, _, ttp in alert.mitre_tag)
            if alert.mitre_tag
            else 0
        )
    return specificity_per_rule_id


def calculate_confidence(
    all_alerts: List[AlertConcise],
    specificities: Dict[TTP, SpecificityScore],
) -> float:
    max_confidence = (
        sum(specificities.values()) if sum(specificities.values()) > 0 else 1
    )

    active_ttps = set()
    for rule_id, alerts in groupby(all_alerts, lambda x: x.rule_id):
        alert = next(alerts)  # get a sample
        for _, _, ttp in alert.mitre_tag:
            active_ttps.add(ttp)
    if not active_ttps:
        return -0.01

    acc = 0
    for ttp in active_ttps:
        acc += specificities[ttp]

    confidence = acc / max_confidence

    return confidence


async def detect():
    all_alerts = await get_all_alert_as_concise_obj()
    all_alerts = sorted(all_alerts, key=lambda x: x.rule_id)

    detected_adversaries_names: Set[str] = set()

    sig_based_results: Dict[str, AdversaryDetectionSigBaseResult] = {}
    for adv_name, specificities in (await get_adversary_specificity()).items():

        specificity_per_rule_id = get_specificity_per_rule_id(all_alerts, specificities)
        confidence = calculate_confidence(all_alerts, specificities)

        related_alerts = [
            alert
            for alert in all_alerts
            if specificity_per_rule_id.get(alert.rule_id, 0) > 0
        ]

        # Add detected adversaries from their signatures to detected_adversaries_names
        if confidence > 0.5:
            detected_adversaries_names.add(adv_name)

        alert_rule_name = []
        alert_rule_id = []
        alert_log_ids = []
        alert_log_indenes = []
        alert_timestamps = []

        for alert in related_alerts:
            alert_rule_name.append(alert.rule_name)
            alert_rule_id.append(alert.rule_id)
            alert_log_ids.append(alert.log_ids)
            alert_log_indenes.append(alert.log_indenes)
            alert_timestamps.append(alert.time)

        result = AdversaryDetectionSigBaseResult(
            id=adv_name,
            name=adv_name,
            confidence=confidence,
            ai_insights="",
            fired_rule_ids=list(specificity_per_rule_id.keys()),
            alert_rule_name=alert_rule_name,
            alert_rule_id=alert_rule_id,
            alert_log_ids=alert_log_ids,
            alert_log_indenes=alert_log_indenes,
            alert_timestamps=alert_timestamps,
        )
        sig_based_results[adv_name] = result

    all_ti_alerts: Dict[IoCStixId, AlertConciseIndexInAllAlertsList] = {}
    all_ti_alerts = {
        alert.matched_ioc["id"]: all_alerts.index(alert)
        for alert in all_alerts
        if alert.matched_ioc
    }

    ioc_based_results: Dict[str, AdversaryDetectionIoCBaseResult] = {}

    intrusions_with_related_iocs = await redis_get(
        prefix="home:intrusion", key="intrusion2ioc", model=IntrusionSets2IoCCache
    )
    assert intrusions_with_related_iocs is not None

    for adversary in intrusions_with_related_iocs.data:
        adversary_name = adversary.name

        all_related_iocs = [ioc for ioc in adversary.relational_iocs]

        detected_related_iocs = []
        undetected_related_iocs = []

        for ioc in all_related_iocs:
            if ioc["id"] in all_ti_alerts.keys():
                detected_related_iocs.append(ioc)
            else:
                undetected_related_iocs.append(ioc)

        if len(detected_related_iocs) > 0:
            detected_adversaries_names.add(adversary_name)

        undetected_related_ioc_specs = []
        detected_related_ioc_specs = []

        if undetected_related_iocs:
            undetected_related_ioc_specs = [
                IocSpec(
                    value=ioc["name"],
                    id=ioc["id"],
                    indicator_pattern=ioc["indicator_pattern"],
                    author=ioc["createdBy"],
                    x_opencti_score=ioc["x_opencti_score"],
                    indicator_type=ioc["indicator_type"],
                    timestamp=ioc["timestamp"],
                )
                for ioc in undetected_related_iocs
            ]

        if detected_related_iocs:
            detected_related_ioc_specs = [
                IocSpec(
                    value=ioc["name"],
                    id=ioc["id"],
                    indicator_pattern=ioc["indicator_pattern"],
                    author=ioc["createdBy"],
                    x_opencti_score=ioc["x_opencti_score"],
                    indicator_type=ioc["indicator_type"],
                    timestamp=ioc["timestamp"],
                )
                for ioc in detected_related_iocs
            ]

        alert_rule_name = []
        alert_rule_id = []
        alert_ioc_value = []
        alert_ioc_id = []
        alert_log_ids = []
        alert_log_indenes = []
        alert_timestamps = []
        fired_rule_ids = set()

        for ioc in detected_related_ioc_specs:
            alert_index = all_ti_alerts[ioc.id]
            ti_alert_object = all_alerts[alert_index]

            fired_rule_ids.add(ti_alert_object.rule_id)

            alert_rule_name.append(ti_alert_object.rule_name)
            alert_rule_id.append(ti_alert_object.rule_id)
            alert_ioc_value.append(ioc.value)
            alert_ioc_id.append(ioc.id)
            alert_log_ids.append(ti_alert_object.log_ids)
            alert_log_indenes.append(ti_alert_object.log_indenes)
            alert_timestamps.append(ti_alert_object.time)

        result = AdversaryDetectionIoCBaseResult(
            id=adversary_name,
            name=adversary_name,
            undetected_related_iocs=undetected_related_ioc_specs,
            detected_iocs=detected_related_ioc_specs,
            fired_rule_ids=list(fired_rule_ids),
            alert_rule_name=alert_rule_name,
            alert_rule_id=alert_rule_id,
            alert_ioc_value=alert_ioc_value,
            alert_ioc_id=alert_ioc_id,
            alert_log_ids=alert_log_ids,
            alert_log_indenes=alert_log_indenes,
            alert_timestamps=alert_timestamps,
        )
        ioc_based_results[adversary_name] = result

    await redis_set(
        prefix="adv",
        key="adversary_detection_results",
        obj=AdversaryDetectionResults(
            sig_based_results=sig_based_results,
            ioc_based_results=ioc_based_results,
            detected_adversaries_names=detected_adversaries_names,
            detected_adversaries_count=len(detected_adversaries_names),
        ),
    )
