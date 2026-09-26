import json
from typing import Dict

from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langgraph.graph import StateGraph
from pydantic import BaseModel

from ...models.utils import Markdown
from ...opencti.indicator import get_indicator_by_id
from ..utils import load_llm

llm = load_llm()


class TIState(BaseModel):
    ti_data: str
    explanation: Markdown = ""


async def generate_explanation_TI(state: TIState) -> TIState:
    """
    Generates a professional explanation for a given security detection ti.
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

Below is the **full raw detection ti data** :

{ti_data}

Your task:
- Read and analyze the raw ti data.
- Write a **clear, concise, and expert-level explanation**.

**Output format** must be markdown.


                """,
            ),
        ]
    )

    chain = prompt | llm | StrOutputParser()

    try:
        explanation_text = await chain.ainvoke({"ti_data": state.ti_data})
        return TIState(ti_data=state.ti_data, explanation=explanation_text)
    except Exception as e:
        return TIState(
            ti_data=state.ti_data, explanation=f"Error generating explanation: {e}"
        )


async def build_TI_graph():
    graph = StateGraph(TIState)
    graph.add_node("generate_explanation_TI", generate_explanation_TI)
    graph.set_entry_point("generate_explanation_TI")
    return graph.compile()


async def build_TI_graph_and_run(ti_id):
    indicator_data = await get_indicator_by_id(ti_id)
    initial_state = TIState(
        ti_data=str(indicator_data),
    )
    graph = await build_TI_graph()
    result = await graph.ainvoke(initial_state)
    return result
