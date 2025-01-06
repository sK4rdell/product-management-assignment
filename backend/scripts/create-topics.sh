#!/bin/sh

set -e

# Define topics as space-separated string
TOPICS="product-events.created.v1 product-events.updated.v1 product-events.deleted.v1"
PARTITIONS=2
REPLICATION=1

for topic in $TOPICS; do
  echo "Creating/verifying topic: $topic"
  kafka-topics.sh --create \
    --if-not-exists \
    --bootstrap-server kafka_b:9094 \
    --topic "$topic" \
    --partitions $PARTITIONS \
    --replication-factor $REPLICATION || {
      echo "Failed to create topic ${topic}"
      exit 1
    }
  echo "Topic ${topic} created/verified successfully"
done
