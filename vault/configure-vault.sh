#!/bin/bash

until vault status > /dev/null 2>&1; do
  echo "Waiting for Vault to be ready..."
  sleep 2
done

vault login root

vault secrets enable -path=secret kv || echo "Secrets engine already enabled"

POSTGRES_DB=${POSTGRES_DB:-"generated_pong_db"}
POSTGRES_USER=${POSTGRES_USER:-"generated_admin_$(openssl rand -hex 4)"}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-$(openssl rand -base64 16)}

POSTGRES_HOST="pong-database-container"
POSTGRES_PORT="5432"
EMAIL_HOST_USER=${EMAIL_HOST_USER}
EMAIL_HOST_PASSWORD=${EMAIL_HOST_PASSWORD}

vault kv put secret/myapp \
    POSTGRES_DB="$POSTGRES_DB" \
    POSTGRES_USER="$POSTGRES_USER" \
    POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
    POSTGRES_HOST="$POSTGRES_HOST" \
    POSTGRES_PORT="$POSTGRES_PORT" \
    EMAIL_HOST_USER="$EMAIL_HOST_USER" \
    EMAIL_HOST_PASSWORD="$EMAIL_HOST_PASSWORD"

vault kv get secret/myapp