from typing import Dict

from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langgraph.graph import StateGraph
from pydantic import BaseModel

from ...llm_agent.data_processors import get_rule_text_for_llm_by_id
from ...models.utils import Markdown
from ..utils import load_llm

llm = load_llm()


class RuleState(BaseModel):
    rule_data: str
    explanation: Markdown = ""


async def generate_explanation_rules(state: RuleState) -> RuleState:
    """
    Generates a professional explanation for a given security detection rule.
    """

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a senior cybersecurity detection engineer and threat intelligence analyst.",
            ),
            (
                "user",
                """
You are an expert in cybersecurity detection engineering, threat intelligence, and MITRE ATT&CK.

Below is the **full raw detection rule data** :

{rule_data}

Your task:
- Read and analyze the raw rule data.
- Write a **clear, concise, and expert-level explanation**.

**Output format** must be markdown.


                """,
            ),
        ]
    )

    chain = prompt | llm | StrOutputParser()

    try:
        explanation_text = await chain.ainvoke({"rule_data": state.rule_data})
        return RuleState(rule_data=state.rule_data, explanation=explanation_text)
    except Exception as e:
        return RuleState(
            rule_data=state.rule_data, explanation=f"Error generating explanation: {e}"
        )


async def build_rule_graph():
    graph = StateGraph(RuleState)
    graph.add_node("generate_explanation_rules", generate_explanation_rules)
    graph.set_entry_point("generate_explanation_rules")
    return graph.compile()


async def build_rule_graph_and_run(rule_id: str) -> Dict[str, Markdown]:
    rule_info = await get_rule_text_for_llm_by_id(rule_id)
    initial_state = RuleState(
        rule_data=rule_info["rule_text"],
    )
    graph = await build_rule_graph()
    result = await graph.ainvoke(initial_state)
    return result


# initial_state = RuleState(rule_data=
#                           {'id': 'ddae8d12-eb04-4697-9cdc-365e822f0fd6', 'updated_at': '2025-08-06T05:36:14.963Z', 'updated_by': 'elastic', 'created_at': '2025-08-06T05:36:14.963Z', 'created_by': 'elastic', 'name': 'Threat Intel IP Address Indicator Match', 'tags': ['OS: Windows', 'Data Source: Elastic Endgame', 'Rule Type: Threat Match', 'Resources: Investigation Guide', 'Type: GAI_CTI_TI'], 'interval': '12h', 'enabled': True, 'revision': 0, 'description': 'This rule is triggered when an IP address indicator from the Threat Intel Filebeat module or integrations has a match against a network event.', 'risk_score': 99, 'severity': 'critical', 'output_index': '', 'meta': {'from': '120h'}, 'author': ['GAI-CTI'], 'false_positives': [], 'from': 'now-475200s', 'rule_id': '0c41e478-5263-4c69-8f9e-7dfd2c22da64', 'max_signals': 100, 'risk_score_mapping': [], 'severity_mapping': [], 'threat': [], 'to': 'now', 'references': [], 'version': 8, 'exceptions_list': [], 'immutable': False, 'rule_source': {'type': 'internal'}, 'related_integrations': [], 'required_fields': [{'name': 'destination.ip', 'type': 'text', 'ecs': False}, {'name': 'source.ip', 'type': 'text', 'ecs': False}], 'setup': '', 'type': 'threat_match', 'language': 'kuery', 'index': ['log*', '*packetbeat*'], 'query': '*:*', 'threat_query': '*:*', 'threat_mapping': [{'entries': [{'field': 'source.ip', 'type': 'mapping', 'value': 'threatintel.indicator.ip.keyword'}]}, {'entries': [{'field': 'destination.ip', 'type': 'mapping', 'value': 'threatintel.indicator.ip.keyword'}]}], 'threat_language': 'kuery', 'threat_index': ['opencti*'], 'threat_indicator_path': 'threat.indicator', 'actions': [], 'execution_summary': {'last_execution': {'date': '2025-08-10T05:36:19.589Z', 'status': 'succeeded', 'status_order': 0, 'message': 'Rule execution completed successfully', 'metrics': {'total_indexing_duration_ms': 8, 'total_search_duration_ms': 19}}}}, explanation=""
#                           )


# async def call_graph():
#     graph = await build_graph()
#     result = await graph.ainvoke(initial_state)

#     print("explanation:", result["explanation"])

#     return result["explanation"]


# if __name__ == "__main__":
#     asyncio.run(call_graph())
