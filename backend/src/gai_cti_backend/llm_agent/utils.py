import os

from langchain_openai import ChatOpenAI
from pydantic import SecretStr

from ..conf import available_llms, ollama_url

avalai_api_key = os.getenv("AVALAI_API_KEY")


def load_llm(llm_model: str = "gpt-5-mini"):
    assert llm_model in available_llms

    if llm_model.startswith("gpt"):

        llm = ChatOpenAI(
            model=llm_model,
            api_key=SecretStr(str(avalai_api_key)),
            base_url="https://api.avalai.ir/v1",
            temperature=0.0,
        )

    else:
        if not ollama_url:
            raise ValueError("OLLAMA_URL is not set")

        llm = ChatOpenAI(
            model=llm_model,
            api_key=SecretStr("ollama"),  # Ollama ignores it but required by interface
            base_url=f"{ollama_url}/v1",
            temperature=0.0,
        )

    return llm
