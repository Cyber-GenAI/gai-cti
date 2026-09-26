FROM docker.arvancloud.ir/python:3.13.2-bookworm

ARG PIP_MIRROR_HOST

ENV PIP_MIRROR_HOST=$PIP_MIRROR_HOST \
    PIP_MIRROR_INDEX_URL=$PIP_MIRROR_HOST/simple \
    TZ=Asia/Tehran

WORKDIR /app

COPY ./requirements.txt .

RUN pip install \
    --trusted-host $PIP_MIRROR_HOST \
    --index-url $PIP_MIRROR_INDEX_URL \
    -r requirements.txt \
    --no-cache-dir

COPY . .