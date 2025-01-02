#!/bin/bash

# Wait for schema registry to be ready
until curl --silent --output /dev/null --fail http://schema-registry:8081; do
  echo "Waiting for schema registry..."
  sleep 1
done

# Register each schema
for schema in product-created product-updated product-deleted; do
  curl -X POST -H "Content-Type: application/vnd.schemaregistry.v1+json" \
    --data "{\"schema\": $(cat ../../schemas/${schema}.avsc)}" \
    http://schema-registry:8081/subjects/${schema}/versions
done
