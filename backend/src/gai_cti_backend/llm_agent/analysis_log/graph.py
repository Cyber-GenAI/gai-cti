import json
from typing import Dict

from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langgraph.graph import StateGraph
from pydantic import BaseModel

from ...elastic_client.log import get_log_info_for_llm
from ...models.utils import Markdown
from ..utils import load_llm

llm = load_llm()


class LogState(BaseModel):
    log_data: str
    explanation: Markdown = ""


async def generate_explanation_log(state: LogState) -> LogState:
    """
    Generates a professional explanation for a given security detection log.
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

Below is the **full raw detection log data** :

{log_data}

Your task:
- Read and analyze the raw log data.
- Write a **clear, concise, and expert-level explanation**.

**Output format** must be markdown.


                """,
            ),
        ]
    )

    chain = prompt | llm | StrOutputParser()

    try:
        explanation_text = await chain.ainvoke({"log_data": state.log_data})
        return LogState(log_data=state.log_data, explanation=explanation_text)
    except Exception as e:
        return LogState(
            log_data=state.log_data, explanation=f"Error generating explanation: {e}"
        )


async def build_log_graph():
    graph = StateGraph(LogState)
    graph.add_node("generate_explanation_log", generate_explanation_log)
    graph.set_entry_point("generate_explanation_log")
    return graph.compile()


async def build_log_graph_and_run(index_pattern, log_id):
    log_info = await get_log_info_for_llm(index_pattern, log_id)

    initial_state = LogState(
        log_data=log_info["logs_text"],
    )
    graph = await build_log_graph()
    result = await graph.ainvoke(initial_state)
    return result
