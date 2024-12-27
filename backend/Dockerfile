FROM --platform=$BUILDPLATFORM python:3.10-alpine AS builder
WORKDIR /app

RUN apk update && apk add --no-cache \
    gcc \
    musl-dev \
    libpq \
    postgresql-dev \
    python3-dev \
    bash \
    make \
    build-base \
    jq \ 
    curl 
COPY requirements.txt /app

RUN python -m pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

RUN chmod +x /app/script.sh

ARG ACTIVE_HOST
ENV ACTIVE_HOST=${ACTIVE_HOST}

CMD sh -c "/app/script.sh"