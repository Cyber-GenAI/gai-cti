from typing import Annotated, Dict

from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers.string import StrOutputParser
from langgraph.channels import LastValue
from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel, Field

from ...models.utils import Markdown
from ..data_processors import get_alert_info_for_llm_by_id
from ..utils import load_llm

llm = load_llm()


class AlertState(BaseModel):
    rule_text: str
    logs_text: str
    ti_text: str = Field(default="No TI Data")

    summary: Annotated[Markdown, LastValue(Markdown)] = ""
    recommendation: Annotated[Markdown, LastValue(Markdown)] = ""
    confidence: Annotated[Markdown, LastValue(Markdown)] = ""


prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a cybersecurity analyst."),
        (
            "user",
            """\
A rule in SIEM system fired following the alert:

## Detection Rule:
{rule_text}

## Log Entries:
{logs_text}

## TI IoC: (it may be 'No TI Data' based on type of rule)
{ti_text}
your task is to generate only the {task}.
""",
        ),
    ]
)

chain = prompt_template | llm | StrOutputParser()


async def generate_summary(state: AlertState):
    inputs = {
        "rule_text": state.rule_text,
        "logs_text": state.logs_text,
        "ti_text": state.ti_text,
        "task": "summary of what happened",
    }
    summary = await chain.ainvoke(inputs)
    return {"summary": summary}


async def generate_recommendation(state: AlertState):
    inputs = {
        "rule_text": state.rule_text,
        "logs_text": state.logs_text,
        "ti_text": state.ti_text,
        "task": "recommendation to mitigate this threat",
    }
    recommendation = await chain.ainvoke(inputs)
    return {"recommendation": recommendation}


async def generate_confidence(state: AlertState):
    inputs = {
        "rule_text": state.rule_text,
        "logs_text": state.logs_text,
        "ti_text": state.ti_text,
        "task": "investigate whether this alert is false positive or not, if you are not sure provide steps for user to investigate more",
    }
    confidence = await chain.ainvoke(inputs)
    return {"confidence": confidence}


async def build_alert_graph():
    builder = StateGraph(AlertState)

    builder.add_node("generate_summary", generate_summary)
    builder.add_node("generate_recommendation", generate_recommendation)
    builder.add_node("generate_confidence", generate_confidence)

    builder.add_edge(START, "generate_summary")
    builder.add_edge(START, "generate_recommendation")
    builder.add_edge(START, "generate_confidence")

    builder.add_edge("generate_summary", END)
    builder.add_edge("generate_recommendation", END)
    builder.add_edge("generate_confidence", END)

    return builder.compile()


async def build_alert_graph_and_run(alert_id: str) -> Dict[str, Markdown]:
    concise_data = await get_alert_info_for_llm_by_id(alert_id)
    initial_state = AlertState(
        rule_text=concise_data["rule_text"],
        logs_text=concise_data["logs_text"],
        ti_text=concise_data["ti_text"],
    )
    graph = await build_alert_graph()
    result = await graph.ainvoke(initial_state)
    return result


# def gen_graph_image(graph):
#     png = graph.get_graph(xray=True).draw_mermaid_png()
#     with open("alert_graph.png", "wb") as f:
#         f.write(png)


# initial_state = AlertState(
#     rule_text=AlertState.rule_text,
#     logs_text=AlertState.logs_text,
# )


# async def call_graph():
#     graph = await build_graph()
#     result = await graph.ainvoke(initial_state)

#     print("Summary:", result["summary"])
#     print("Recommendation:", result["recommendation"])
#     print("Confidence:", result["confidence"])

#     return result["summary"], result["recommendation"], result["confidence"]


# if __name__ == "__main__":
#     asyncio.run(call_graph())
