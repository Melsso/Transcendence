FROM --platform=$BUILDPLATFORM python:3.10-alpine AS builder
EXPOSE 8000
WORKDIR /app

RUN apk update
RUN apk add \
    pkgconfig \
    gcc \
    musl-dev \
    bash

COPY requirements.txt /app

RUN python -m pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

RUN python3 app/manage.py migrate

CMD ["python", "app/manage.py", "runserver", "0.0.0.0:8000"]