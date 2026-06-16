import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { RekognitionClient, DetectLabelsCommand } from '@aws-sdk/client-rekognition';
import { KendraClient, QueryCommand } from '@aws-sdk/client-kendra';

const REGION = process.env.AWS_REGION || 'us-east-1';
const KENDRA_INDEX_ID = process.env.KENDRA_INDEX_ID;

const ALLOWED_ORIGINS = [
  'https://main--amazon-compass--aemxsc.aem.page',
  'https://main--amazon-compass--aemxsc.aem.live',
  'http://localhost:3000',
  'http://localhost:3001',
];

function getCorsHeaders(origin) {
  if (!ALLOWED_ORIGINS.includes(origin)) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

function json(statusCode, body, cors) {
  return { statusCode, headers: { 'Content-Type': 'application/json', ...cors }, body: JSON.stringify(body) };
}

function isSafeHttpsUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const method = event.requestContext?.http?.method || 'POST';
  const path = event.requestContext?.http?.path || event.rawPath || '/';

  // Unified preflight + origin guard
  const cors = getCorsHeaders(origin);
  if (method === 'OPTIONS') {
    if (!cors) return { statusCode: 403, headers: {}, body: 'Forbidden' };
    return { statusCode: 204, headers: cors, body: '' };
  }
  if (!cors) return { statusCode: 403, headers: {}, body: 'Forbidden' };

  let body = {};
  try { body = event.body ? JSON.parse(event.body) : {}; } catch { return json(400, { error: 'Invalid JSON' }, cors); }

  try {
    if (path === '/bedrock/invoke') return await handleBedrock(body, cors);
    if (path === '/rekognition-analyze') return await handleRekognition(body, cors);
    if (path === '/kendra-search') return await handleKendra(body, cors);
    return json(404, { error: 'Not found' }, cors);
  } catch (err) {
    console.error('[compass-amazon-proxy] Unhandled error:', err);
    return json(500, { error: 'Internal server error' }, cors);
  }
};

async function handleBedrock(body, cors) {
  const { model = 'us.anthropic.claude-opus-4-6-v1', ...bedrockBody } = body;
  // Bedrock Claude models require anthropic_version in the body
  const finalBody = model.includes('anthropic')
    ? { anthropic_version: 'bedrock-2023-05-31', ...bedrockBody }
    : bedrockBody;
  const client = new BedrockRuntimeClient({ region: REGION });
  try {
    const resp = await client.send(new InvokeModelCommand({
      modelId: model,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(finalBody),
    }));
    const result = JSON.parse(new TextDecoder().decode(resp.body));
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...cors }, body: JSON.stringify(result) };
  } catch (err) {
    console.error('[Bedrock] InvokeModel error:', err);
    return json(502, { error: 'Bedrock request failed' }, cors);
  }
}

async function handleRekognition(body, cors) {
  const { imageUrl } = body;
  if (!imageUrl) return json(400, { error: 'imageUrl required' }, cors);
  // SSRF guard — only fetch https:// URLs
  if (!isSafeHttpsUrl(imageUrl)) return json(400, { error: 'imageUrl must be an https URL' }, cors);
  try {
    const imgResp = await fetch(imageUrl);
    const imgBytes = Buffer.from(await imgResp.arrayBuffer());
    const client = new RekognitionClient({ region: REGION });
    const resp = await client.send(new DetectLabelsCommand({ Image: { Bytes: imgBytes }, MaxLabels: 20, MinConfidence: 70 }));
    return json(200, resp, cors);
  } catch (err) {
    console.error('[Rekognition] DetectLabels error:', err);
    return json(502, { error: 'Rekognition request failed' }, cors);
  }
}

async function handleKendra(body, cors) {
  if (!KENDRA_INDEX_ID) return json(500, { error: 'KENDRA_INDEX_ID not configured' }, cors);
  const { query } = body;
  if (!query) return json(400, { error: 'query required' }, cors);
  try {
    const client = new KendraClient({ region: REGION });
    const resp = await client.send(new QueryCommand({ IndexId: KENDRA_INDEX_ID, QueryText: query, PageSize: 10 }));
    return json(200, resp, cors);
  } catch (err) {
    console.error('[Kendra] Query error:', err);
    return json(502, { error: 'Kendra request failed' }, cors);
  }
}

