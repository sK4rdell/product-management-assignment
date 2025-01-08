#!/bin/bash

set -e

# Wait for schema registry to be ready
until curl --silent --output /dev/null --fail http://localhost:8081; do
  echo "Waiting for schema registry..."
  sleep 1
done

# Register the Product schema first
echo "Registering schema: product"
product_schema_content=$(cat ../schemas/product.avsc | tr -d '\n' | sed 's/"/\\"/g')
curl -X POST -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  --data "{\"schema\": \"${product_schema_content}\"}" \
  http://localhost:8081/subjects/product-value/versions || {
    echo "Failed to register schema product"
    exit 1
  }
echo -e "\nSchema product registered successfully"

# Register the other schemas with references
for schema in product-created product-updated product-deleted; do
  echo "Registering schema: ${schema}"
  schema_content=$(cat ../schemas/${schema}.avsc | tr -d '\n' | sed 's/"/\\"/g')
  if [[ "${schema}" == "product-created" || "${schema}" == "product-updated" ]]; then
    curl -X POST -H "Content-Type: application/vnd.schemaregistry.v1+json" \
      --data "{\"schema\": \"${schema_content}\", \"references\": [{\"name\": \"Product\", \"subject\": \"product-value\", \"version\": 1}]}" \
      http://localhost:8081/subjects/${schema}-value/versions || {
        echo "Failed to register schema ${schema}"
        exit 1
      }
  else
    curl -X POST -H "Content-Type: application/vnd.schemaregistry.v1+json" \
      --data "{\"schema\": \"${schema_content}\"}" \
      http://localhost:8081/subjects/${schema}-value/versions || {
        echo "Failed to register schema ${schema}"
        exit 1
      }
  fi
  echo -e "\nSchema ${schema} registered successfully"
done
