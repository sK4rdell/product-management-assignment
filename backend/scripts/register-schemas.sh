#!/bin/bash

set -e

# Wait for schema registry to be ready
until curl --silent --output /dev/null --fail http://localhost:8081; do
  echo "Waiting for schema registry..."
  sleep 1
done

# Register each schema
for schema in product-created product-updated product-deleted; do
  echo "Registering schema: ${schema}"
  schema_content=$(cat ../schemas/${schema}.avsc | tr -d '\n' | sed 's/"/\\"/g')
  curl -X POST -H "Content-Type: application/vnd.schemaregistry.v1+json" \
    --data "{\"schema\": \"${schema_content}\"}" \
    http://localhost:8081/subjects/${schema}-value/versions || {
      echo "Failed to register schema ${schema}"
      exit 1
    }
  echo -e "\nSchema ${schema} registered successfully"
done
