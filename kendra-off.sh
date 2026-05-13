#!/usr/bin/env bash
# Deletes Kendra index to stop charges — run after your demo

source ~/.bashrc

REGION="us-east-2"

INDEX_ID=$(aws kendra list-indices --region "$REGION" --query "IndexConfigurationSummaryItems[?Name=='amazon-compass'].Id" --output text)

if [ -z "$INDEX_ID" ]; then
  echo "No active amazon-compass index found."
  exit 0
fi

echo "Deleting Kendra index: $INDEX_ID"
aws kendra delete-index --id "$INDEX_ID" --region "$REGION"
echo "Done. Charges stopped."
