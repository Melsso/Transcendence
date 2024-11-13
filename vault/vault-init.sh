#!/bin/bash

VAULT_ADDR="http://localhost:8200"
VAULT_TOKEN="root"

# Ensure that Vault is initialized
status=$(curl --silent $VAULT_ADDR/v1/sys/health | jq -r .initialized)

if [ "$status" != "true" ]; then
    echo "Vault is not initialized. Initializing Vault..."
    init_response=$(curl --silent --request POST --data '{"secret_shares": 1, "secret_threshold": 1}' $VAULT_ADDR/v1/sys/init)

    # Capture the unseal keys and root token from the response
    UNSEAL_KEY=$(echo $init_response | jq -r '.unseal_keys_b64[0]')
    ROOT_TOKEN=$(echo $init_response | jq -r '.root_token')

    # Set the unseal key in the environment (for use later)
    export VAULT_UNSEAL_KEY=$UNSEAL_KEY
    export VAULT_ROOT_TOKEN=$ROOT_TOKEN

    echo "Vault initialized. Unseal key and root token are generated."
else
    echo "Vault is already initialized."
    export VAULT_ROOT_TOKEN=$ROOT_TOKEN
fi

# Unseal Vault
echo "Unsealing Vault..."
curl --silent --request POST --data "{\"key\": \"$VAULT_UNSEAL_KEY\"}" $VAULT_ADDR/v1/sys/unseal

# Now proceed with setting secrets
echo "Setting secrets in Vault..."

check_and_set_secret() {
    SECRET_PATH=$1
    SECRET_KEY=$2
    SECRET_VALUE=$3

    SECRET_EXIST=$(curl --silent --header "X-Vault-Token: $VAULT_ROOT_TOKEN" \
        --request GET \
        $VAULT_ADDR/v1/$SECRET_PATH)

    if [[ $SECRET_EXIST == *"errors"* ]]; then
        echo "Setting secret $SECRET_PATH/$SECRET_KEY"
        curl --silent --header "X-Vault-Token: $VAULT_ROOT_TOKEN" \
            --request POST \
            --data "{\"data\": {\"$SECRET_KEY\": \"$SECRET_VALUE\"}}" \
            $VAULT_ADDR/v1/$SECRET_PATH
    else
        echo "Secret $SECRET_PATH already exists. Skipping."
    fi
}

check_and_set_secret "secret/database" "POSTGRES_DB" "$POSTGRES_DB"
check_and_set_secret "secret/database" "POSTGRES_USER" "$POSTGRES_USER"
check_and_set_secret "secret/database" "POSTGRES_PASSWORD" "$POSTGRES_PASSWORD"
check_and_set_secret "secret/database" "POSTGRES_HOST" "$POSTGRES_HOST"
check_and_set_secret "secret/database" "POSTGRES_PORT" "$POSTGRES_PORT"

check_and_set_secret "secret/email" "EMAIL_HOST_USER" "$EMAIL_HOST_USER"
check_and_set_secret "secret/email" "EMAIL_HOST_PASSWORD" "$EMAIL_HOST_PASSWORD"

echo "Vault initialization and secret setup complete."
exit 0
