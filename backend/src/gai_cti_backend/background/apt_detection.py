import asyncio
from collections import defaultdict
from typing import Dict, Set

from ..apt_detection import detect, get_adversary_profiles
from ..elastic_client.rule import get_all_rules
from ..models.adversary import (
    AdversaryDetectionResults,
    AdversaryName,
    AdversarySideBarCache,
    AdversarySideBarItem,
    RulePerAdversary,
)
from ..models.home import IntrusionSets2IoCCache
from ..models.rule import Rule
from ..utils import redis_get, redis_set
from ..utils.ti import get_adversary_specificity
from .celery_worker import celery_task


async def update_adversary_side_bar_async():

    detectable = {
        adv: sum(spec_dict.values()) > 0
        for adv, spec_dict in (await get_adversary_specificity()).items()
    }

    confidence_per_adv = {}
    if detection_results := await redis_get(
        prefix="adv",
        key="adversary_detection_results",
        model=AdversaryDetectionResults,
    ):
        for adv_name, result in detection_results.sig_based_results.items():
            confidence_per_adv[adv_name] = int(result.confidence * 100)

    # when AdversaryDetectionRun/Results is not present in redis
    mitre_adversaries = [
        AdversarySideBarItem(
            id=profile["id"],
            opencti_ref=None,
            name=profile["name"],
            sources=["M"],
            warn_sign=False,
            is_important=profile["name"].startswith("APT"),
            confidence=confidence_per_adv.get(profile["name"], -1),
        )
        for profile in await get_adversary_profiles()
        if detectable.get(profile["name"], False)
    ]

    mitre_adv_by_name = {adv.name: adv for adv in mitre_adversaries}

    ti_adversaries = []
    if intrusion_to_ioc := await redis_get(
        key="intrusion2ioc",
        prefix="home:intrusion",
        model=IntrusionSets2IoCCache,
    ):
        profile_with_count = [
            (len(profile.relational_iocs), profile.id)
            for profile in intrusion_to_ioc.data
        ]
        sorted(profile_with_count)
        important_profiles = set(id for _, id in profile_with_count[-10:])

        for profile in intrusion_to_ioc.data:
            if len(profile.relational_iocs) == 0:
                continue

            if profile.name in mitre_adv_by_name:
                adversary = mitre_adv_by_name[profile.name]
                adversary.opencti_ref = profile.id
                adversary.sources.append("TI")
                if profile.id in important_profiles:
                    adversary.is_important = True
            else:
                warn_sign = (
                    True
                    if (profile.name in detection_results.ioc_based_results)
                    and (
                        len(
                            detection_results.ioc_based_results[
                                profile.name
                            ].detected_iocs
                        )
                        > 0
                    )
                    else False
                )
                is_important = (
                    warn_sign if warn_sign else profile.id in important_profiles
                )

                ti_adversaries.append(
                    AdversarySideBarItem(
                        id=profile.id,
                        opencti_ref=profile.id,
                        name=profile.name,
                        sources=["TI"],
                        warn_sign=warn_sign,
                        is_important=is_important,
                        confidence=confidence_per_adv.get(profile.name, -1),
                    )
                )

    adversaries = mitre_adversaries + ti_adversaries
    await redis_set(
        key="side_bar_cache",
        obj=AdversarySideBarCache(data=adversaries),
        prefix="adv",
    )


async def update_rule_per_adversary_async():
    rules_per_ttp = defaultdict(list)
    for json_response in await get_all_rules():
        for rule in json_response["data"]:
            ttps = []
            for obj in rule["threat"]:
                for technique in obj["technique"]:
                    ttps.append(f"""{obj["tactic"]["id"]}/{technique["id"]}""")
            for ttp in ttps:
                rules_per_ttp[ttp].append(
                    Rule(
                        id=rule["id"],
                        rule_id=rule["rule_id"],
                        name=rule["name"],
                        tags=tuple(rule.get("tags")),
                        type=rule["type"],
                        enabled=rule["enabled"],
                        ttps=tuple(ttps),
                    )
                )

    rule_per_adversary: Dict[AdversaryName, Set[Rule]] = defaultdict(set)
    for adv_name, spec_per_ttp in (await get_adversary_specificity()).items():
        for ttp, specificity in spec_per_ttp.items():
            if specificity > 0:
                rule_per_adversary[adv_name].update(rules_per_ttp[ttp])

    await redis_set(
        key="rule_per_adversary",
        obj=RulePerAdversary(root=rule_per_adversary),
        prefix="adv",
    )


@celery_task(soft_time_limit=10_000, time_limit=10_005)
def update_adversary_side_bar():
    asyncio.run(update_adversary_side_bar_async())


@celery_task(soft_time_limit=10_000, time_limit=10_005)
def update_rule_per_adversary():
    asyncio.run(update_rule_per_adversary_async())


@celery_task(soft_time_limit=10_000, time_limit=10_005)
def run_apt_detection():
    async def helper():
        await detect()
        await update_adversary_side_bar_async()

    asyncio.run(helper())
