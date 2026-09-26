FROM docker.arvancloud.ir/python:3.13.2-slim-bookworm

ARG PIP_MIRROR_HOST

ENV PIP_MIRROR_HOST=$PIP_MIRROR_HOST \
    PIP_MIRROR_INDEX_URL=$PIP_MIRROR_HOST/simple 

RUN pip install \
    --trusted-host $PIP_MIRROR_HOST \
    --index-url $PIP_MIRROR_INDEX_URL \ 
    --no-cache-dir \
    poetry

WORKDIR /app

COPY pyproject.toml ./

RUN poetry source add --priority=primary \
    primary \
    $PIP_MIRROR_INDEX_URL
    
RUN poetry install --no-root
