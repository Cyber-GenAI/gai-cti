from langchain_core.tools import tool

from .....elastic_client.rule import get_rules_by_tag as get_rules_by_tag_raw
from ....data_processors import get_rule_text_for_llm_by_id


# rule tools
@tool(
    "get_rules_by_tag_tool",
    description="""
    Retrieve a list of security rules from Elasticsearch filtered by a specific tag.
    Args:
        tag (str): The tag used to filter rules.
    Returns:
        str: A formatted list of rule IDs, names, and descriptions.
    Use this tool when the user asks to see all rules related to a particular tag or category.
    """,
)
async def get_rules_by_tag_tool(tag: str):
    try:
        s = ""
        sep = "-" * 5
        for rule_id, rule_name, rule_description in await get_rules_by_tag_raw(tag):
            s += f"{rule_id=}\n{rule_name=}\n{rule_description=}\n{sep}\n"
        return s

    except Exception as e:
        raise RuntimeError(f"Error extracting rules: {e}")


@tool(
    "get_rule_info_tool",
    description="""
    Retrieve detailed rule information from Elasticsearch.

    Args:
        rule_id (str): The unique identifier of the rule.

    Returns:
        str: A comprehensive text containing the full rule definition, detection logic, 
        and metadata.

    The returned information may include:
        - Core identifiers: id, rule_id, name, description, version, revision
        - Risk and severity: risk_score, severity
        - Status and lifecycle: enabled, immutable, created_at, updated_at, created_by, updated_by
        - Execution details: interval, from, to, max_signals, last_execution (date, status, metrics)
        - Rule type and logic:
            • query (if type="query")  
            • threat_match (fields: threat_query, threat_index, threat_language, threat_indicator_path, threat_mapping)
        - Additional metadata: tags, index, author, false_positives, references, language, type
        - Optional meta fields: meta.from
        - Performance metrics (if available): total_search_duration_ms and other execution metrics

    Use this tool when the user asks about the definition, detection logic, conditions, 
    or metadata of a specific rule.
    """,
)
async def get_rule_info_tool(rule_id: str):
    try:
        rule_info = await get_rule_text_for_llm_by_id(rule_id)
        return rule_info
    except Exception as e:
        raise KeyError(
            f"Rule with ID '{rule_id}' not found in ElasticSearch. Error: {e}"
        )
