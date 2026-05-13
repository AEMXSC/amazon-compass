#!/usr/bin/env bash
# Creates Kendra index and sets the secret in Cloudflare Worker
# Takes ~30 min to become ACTIVE — run before your demo

source ~/.bashrc

ROLE_ARN="arn:aws:iam::880884391254:role/AmazonKendra-us-east-2-amazon-compass-kendra"
REGION="us-east-2"

echo "Creating Kendra index..."
INDEX_ID=$(aws kendra create-index \
  --name amazon-compass \
  --edition DEVELOPER_EDITION \
  --role-arn "$ROLE_ARN" \
  --region "$REGION" \
  --query "Id" \
  --output text)

echo "Index ID: $INDEX_ID"
echo "Saving to Cloudflare Worker..."
echo "$INDEX_ID" | npx wrangler secret put KENDRA_INDEX_ID --cwd "$(dirname "$0")/worker"

echo ""
echo "Done. Index is CREATING — takes ~30 min to become ACTIVE."
echo "Check status: aws kendra describe-index --id $INDEX_ID --region $REGION --query 'Status'"
