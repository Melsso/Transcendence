#!/bin/bash

export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_DEV_ROOT_TOKEN_ID='root'  # Set your root token here
export VAULT_DEV_LISTEN_ADDRESS='0.0.0.0:8200'

vault server -dev -dev-root-token-id="$VAULT_DEV_ROOT_TOKEN_ID" -dev-listen-address="$VAULT_DEV_LISTEN_ADDRESS" &

echo "Waiting for Vault to be ready..."
until curl --silent --fail $VAULT_ADDR/v1/sys/health; do
  sleep 1
done

echo "Vault is ready!"

sh /docker-entrypoint-initdb.d/configure-vault.sh

echo "Vault is running in development mode."
wait
