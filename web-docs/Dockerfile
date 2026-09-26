FROM docker.arvancloud.ir/node:22-alpine3.21

WORKDIR /app

COPY package*.json ./
RUN npm --registry=https://mirror-npm.runflare.com ci

ARG BASE=/
ARG SITE_URL=https://gai-cti-docs-gai-cti-docs-project.apps.okd.mamnafzar.ir
ARG VIDEO_BASE_URL=https://amn-gai-cti-docs.s3.ir-thr-at1.arvanstorage.ir

ENV BASE=${BASE}
ENV SITE_URL=${SITE_URL}
ENV VIDEO_BASE_URL=${VIDEO_BASE_URL}

COPY . .

RUN npm run build

CMD ["npm", "run", "serve", "--", "--build", "--port", "8080", "--host", "0.0.0.0"]