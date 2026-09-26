FROM docker.arvancloud.ir/node:22-alpine3.18 AS builder

WORKDIR /app

ARG YARN_REGISTRY_DOMAIN
ENV YARN_REGISTRY_DOMAIN=${YARN_REGISTRY_DOMAIN}
RUN yarn config set registry https://$YARN_REGISTRY_DOMAIN

COPY package.json yarn.lock ./
RUN sed -i.bak -E 's|(resolved ")([^"]*://)?[^"/]+(/[^"]+)|resolved "\2'"$YARN_REGISTRY_DOMAIN"'\3|' yarn.lock
RUN yarn install --verbose --frozen-lockfile

ARG VITE_API_ROOT
ARG VITE_KIBANA_API_ROOT
ARG VITE_ELASTIC_API_ROOT
ARG VITE_SOCKET_IO_ROOT

ENV VITE_API_ROOT=$VITE_API_ROOT
ENV VITE_KIBANA_API_ROOT=$VITE_KIBANA_API_ROOT
ENV VITE_ELASTIC_API_ROOT=$VITE_ELASTIC_API_ROOT
ENV VITE_SOCKET_IO_ROOT=$VITE_SOCKET_IO_ROOT

COPY . .

RUN yarn build

FROM docker.arvancloud.ir/node:22-alpine3.18

WORKDIR /app

ARG YARN_REGISTRY_DOMAIN
ENV YARN_REGISTRY_DOMAIN=${YARN_REGISTRY_DOMAIN}
RUN yarn config set registry https://$YARN_REGISTRY_DOMAIN

RUN yarn global add serve

COPY --from=builder /app/dist /app

CMD ["serve", "-s", ".", "-l", "5173"]
