import random
from typing import Any, Dict

from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langgraph.graph import END, StateGraph
from pydantic import BaseModel

from ...apt_detection.utils import get_adversary_profile
from ...models.adversary import (
    AdversaryDetectionResults,
    IoCRow,
    RulePerAdversary,
    Section,
)
from ...models.utils import Markdown
from ...utils.miscellaneous import clean_markdown_text
from ...utils.redis import redis_get
from ..data_processors import (
    get_ioc_info_for_llm_by_ioc_row_obj,
    get_rule_text_for_llm_from_obj,
)
from ..utils import load_llm

llm = load_llm()


class AdversariesExplainState(BaseModel):
    id: str
    profile: Dict[str, Any]
    data: Markdown = ""


async def get_adversary_aggregated_data(profile):
    count_related_iocs: int = 0
    count_detected_related_iocs: int = 0
    count_related_rules: int = 0
    count_fired_related_rules: int = 0

    fired_rule_ids = set()
    fired_related_rules = set()

    detection_results = await redis_get(
        prefix="adv",
        key="adversary_detection_results",
        model=AdversaryDetectionResults,
    )
    assert detection_results is not None

    if sig_result := detection_results.sig_based_results.get(profile["name"]):
        confidence = sig_result.confidence
        fired_rule_ids.update(sig_result.fired_rule_ids)

    rule_per_adversary = await redis_get(
        prefix="adv",
        key="rule_per_adversary",
        model=RulePerAdversary,
    )
    assert rule_per_adversary is not None

    for rule in rule_per_adversary.root.get(profile["name"], []):
        if rule.id in fired_rule_ids:
            fired_related_rules.add(rule)

    non_detected_ioc_rows = []
    detected_ioc_rows = []

    if adversary_object := detection_results.ioc_based_results.get(profile["name"]):
        for ioc in adversary_object.undetected_related_iocs:
            non_detected_ioc_rows.append(
                IoCRow(
                    # id=ioc.id,
                    value=ioc.value,
                    # indicator_pattern=ioc.indicator_pattern,
                    is_detected=False,
                    path={"IDK": f"IDK/{ioc.value}"},
                    indicator_type=ioc.indicator_type,
                    author=ioc.author,
                    timestamp=ioc.timestamp,
                    x_opencti_score=ioc.x_opencti_score,
                )
            )

        for ioc in adversary_object.detected_iocs:
            detected_ioc_rows.append(
                IoCRow(
                    # id=ioc.id,
                    value=ioc.value,
                    # indicator_pattern=ioc.indicator_pattern,
                    is_detected=True,
                    path={"IDK": f"IDK/{ioc.value}"},
                    indicator_type=ioc.indicator_type,
                    author=ioc.author,
                    timestamp=ioc.timestamp,
                    x_opencti_score=ioc.x_opencti_score,
                )
            )

    count_related_iocs = len(detected_ioc_rows) + len(non_detected_ioc_rows)
    count_detected_related_iocs = len(detected_ioc_rows)

    count_related_rules = len(rule_per_adversary.root.get(profile["name"], []))
    count_fired_related_rules = len(fired_related_rules)

    sample_of_related_iocs = []
    sample_of_related_iocs += detected_ioc_rows

    if count_iocs := len(sample_of_related_iocs) >= 16:
        sample_of_related_iocs = random.choices(
            detected_ioc_rows, k=min(15, len(detected_ioc_rows))
        )

    elif count_iocs := len(sample_of_related_iocs) < 15:
        sample_of_related_iocs += random.choices(
            non_detected_ioc_rows, k=min(15 - count_iocs, len(non_detected_ioc_rows))
        )

    detected_related_rules_text = (
        ",\n".join(
            [
                get_rule_text_for_llm_from_obj(rule_obj)["rule_text"]
                for rule_obj in fired_related_rules
            ]
        )
        if fired_related_rules
        else "No Fired Rule Found"
    )
    sample_related_iocs_text = ",\n".join(
        [
            get_ioc_info_for_llm_by_ioc_row_obj(ioc_row)["ioc_text"]
            for ioc_row in sample_of_related_iocs
        ]
        if sample_of_related_iocs
        else "No Related IoC Found"
    )

    result = {
        "detected_related_rules_text": detected_related_rules_text,
        "sample_related_iocs_text": sample_related_iocs_text,
        "count_related_iocs": count_related_iocs,
        "count_detected_related_iocs": count_detected_related_iocs,
        "count_related_rules": count_related_rules,
        "count_fired_related_rules": count_fired_related_rules,
        "adversary_confidence": confidence,
    }

    return result


async def generate_explanation_for_adversary(
    state: AdversariesExplainState,
) -> AdversariesExplainState:
    profile = state.profile
    adv_agg_data = await get_adversary_aggregated_data(profile)

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                f"""
# Role and Core Function
You are an expert cybersecurity AI assistant specializing in threat intelligence and adversary analysis. Your primary mission is to identify advanced persistent threat (APT) activity by analyzing security alerts through the lens of known adversary tradecraft.

# Current Analysis Context
**Adversary Profile: {profile["name"]}**

{clean_markdown_text(profile["description"])}

**Sample Related IoCs**
{adv_agg_data["sample_related_iocs_text"]}

**Fired Related Rules**
{adv_agg_data["detected_related_rules_text"]}

- Number of related IoCs: {adv_agg_data["count_related_iocs"]}
- Number of detected related IoCs: {adv_agg_data["count_detected_related_iocs"]}
- Number of related Rules: {adv_agg_data["count_related_rules"]}
- Number of fired related Rules: {adv_agg_data["count_fired_related_rules"]}
- Adversary confidence: {adv_agg_data["adversary_confidence"]}

# Your Analytical Capabilities

## 1. Alert Analysis & TTPs Mapping
- Analyze detected Sigma rule alerts and map them to MITRE ATT&CK techniques
- Identify which techniques align with {profile["name"]}'s known tradecraft
- Recognize deviations from typical patterns that may indicate evolved TTPs

## 2. Cross-Event Correlation
- Correlate events across time windows to identify attack chains
- Link activities across multiple systems and network segments
- Detect patterns indicating coordinated, multi-stage operations
- Identify relationships between seemingly isolated events

## 3. Confidence Assessment
- Calculate confidence scores (0-100) for threat attribution
- Weight scores based on:
  - Number of matching TTPs with adversary profile
  - Temporal proximity of related events
  - Contextual signals (geolocation, targeting patterns, tools used)
  - Quality and uniqueness of indicators
- Clearly explain the factors contributing to each confidence score

## 4. Narrative Construction
- Synthesize findings into coherent threat narratives
- Describe the likely attack progression and objectives
- Explain how observed activity aligns with the adversary's historical campaigns
- Highlight critical moments in the attack timeline

## 5. Actionable Recommendations
- Prioritize investigation steps based on threat severity and confidence
- Suggest specific log sources and artifacts to examine
- Recommend containment and mitigation actions
- Identify gaps in visibility that may hide additional adversary activity

# Output Format

Structure your analysis as follows:

**Executive Summary**: Brief overview of findings and risk level

**Matching TTPs**: List MITRE ATT&CK techniques with evidence from alerts

**Confidence Assessment**: Score with detailed justification

**Attack Narrative**: Chronological reconstruction of adversary activity

**Investigation Priorities**: Ranked next steps with specific queries or actions

**Defensive Recommendations**: Immediate containment and long-term hardening measures

# Analysis Principles

- Base conclusions on evidence from alerts and known adversary behavior
- Clearly distinguish between high-confidence findings and hypotheses
- Consider alternative explanations for ambiguous indicators
- Focus on actionable intelligence that enables decisive response
- Maintain awareness that absence of evidence is not evidence of absence

Analyze the provided alerts with these capabilities and deliver insights that enable security teams to understand and respond to sophisticated threats effectively.
""",
            ),
        ]
    )

    # print(prompt.to_json())
    chain = prompt | llm | StrOutputParser()
    try:
        apt_description = await chain.ainvoke({"profile": state.profile})
        return AdversariesExplainState(
            id=state.id, profile=state.profile, data=apt_description
        )
    except Exception as e:
        return AdversariesExplainState(
            id=state.id,
            profile=state.profile,
            data=f"Error generating APT explanation: {e}",
        )


async def build_adv_graph():
    graph = StateGraph(AdversariesExplainState)
    graph.add_node("generate_apt_description", generate_explanation_for_adversary)
    graph.set_entry_point("generate_apt_description")
    graph.add_edge("generate_apt_description", END)
    return graph.compile()


async def build_adv_graph_and_run(adv_id: str):
    profile = await get_adversary_profile(adv_id)
    initial_state = AdversariesExplainState(
        id=adv_id,
        profile=profile,
    )
    graph = await build_adv_graph()
    result = await graph.ainvoke(initial_state)
    return result
