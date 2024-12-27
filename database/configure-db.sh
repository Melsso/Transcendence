#!/bin/bash

# Set Vault URL and token
export VAULT_ADDR='http://vault:8200'  # Ensure this points to the correct Vault address
export VAULT_TOKEN='root'

Wait for Vault to be ready
echo "Waiting for Vault to be ready..."
until curl --silent --fail $VAULT_ADDR/v1/sys/health; do
  sleep 1
done
echo "Vault is ready!"

fetch_secret() {
  local secret_path=$1
  local key=$2
  local value=""
  
  until [[ -n "$value" ]]; do
    response=$(curl --silent --write-out "%{http_code}" --header "X-Vault-Token: $VAULT_TOKEN" "$VAULT_ADDR$secret_path")
    http_code=$(echo "$response" | tail -n 1)
    response_body=$(echo "$response" | head -n -1)

    if [[ "$http_code" == "200" ]]; then
      value=$(echo "$response_body" | jq -r ".data.data.$key")

      if [[ "$value" == "null" || -z "$value" ]]; then
        value=""
        sleep 1
      fi
    else
      sleep 1
    fi
  done
  echo "$value"
}

POSTGRES_DB=$(fetch_secret "/v1/secret/data/myapp" "POSTGRES_DB")
POSTGRES_USER=$(fetch_secret "/v1/secret/data/myapp" "POSTGRES_USER")
POSTGRES_PASSWORD=$(fetch_secret "/v1/secret/data/myapp" "POSTGRES_PASSWORD")
POSTGRES_HOST=$(fetch_secret "/v1/secret/data/myapp" "POSTGRES_HOST")
POSTGRES_PORT=$(fetch_secret "/v1/secret/data/myapp" "POSTGRES_PORT")

export POSTGRES_DB
export POSTGRES_USER
export POSTGRES_PASSWORD
export POSTGRES_HOST
export POSTGRES_PORT

echo "PostgreSQL database: $POSTGRES_DB"
echo "PostgreSQL user: $POSTGRES_USER"
echo "PostgreSQL password: $POSTGRES_PASSWORD"
echo "PostgreSQL host: $POSTGRES_HOST"
echo "PostgreSQL port: $POSTGRES_PORT"

exec docker-entrypoint.sh postgres
