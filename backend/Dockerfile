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
    build-base

COPY requirements.txt /app

RUN python -m pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

CMD sh -c "cd api && daphne -b 0.0.0.0 -p 8000 api.asgi:application"