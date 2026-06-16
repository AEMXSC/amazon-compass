import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { RekognitionClient, DetectLabelsCommand } from '@aws-sdk/client-rekognition';
import { KendraClient, QueryCommand } from '@aws-sdk/client-kendra';

const REGION = process.env.AWS_REGION || 'us-east-1';
const KENDRA_INDEX_ID = process.env.KENDRA_INDEX_ID;

const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

function json(statusCode, body) {
  return { statusCode, headers: CORS, body: JSON.stringify(body) };
}

function isSafeHttpsUrl(url) {
  try { return new URL(url).protocol === 'https:'; } catch { return false; }
}

export const handler = async (event) => {
  const method = event.requestContext?.http?.method || 'POST';
  const path = event.requestContext?.http?.path || event.rawPath || '/';

  if (method === 'OPTIONS') return { statusCode: 204, headers: {}, body: '' };

  let body = {};
  try { body = event.body ? JSON.parse(event.body) : {}; } catch { return json(400, { error: 'Invalid JSON' }); }

  try {
    if (path === '/bedrock/invoke') return await handleBedrock(body);
    if (path === '/rekognition-analyze') return await handleRekognition(body);
    if (path === '/kendra-search') return await handleKendra(body);
    if (path === '/nova-canvas') return await handleNovaCanvas(body);
    return json(404, { error: 'Not found' });
  } catch (err) {
    console.error('[compass-amazon-proxy] error:', err);
    return json(500, { error: 'Internal server error' });
  }
};

async function handleBedrock(body) {
  const { model = 'us.anthropic.claude-opus-4-6-v1', stream, ...bedrockBody } = body;
  const finalBody = model.includes('anthropic')
    ? { anthropic_version: 'bedrock-2023-05-31', ...bedrockBody }
    : bedrockBody;
  const client = new BedrockRuntimeClient({ region: REGION });
  try {
    const resp = await client.send(new InvokeModelCommand({
      modelId: model, contentType: 'application/json', accept: 'application/json',
      body: JSON.stringify(finalBody),
    }));
    const result = JSON.parse(new TextDecoder().decode(resp.body));
    return { statusCode: 200, headers: CORS, body: JSON.stringify(result) };
  } catch (err) {
    console.error('[Bedrock] error:', err);
    return json(502, { error: 'Bedrock request failed', detail: err.message });
  }
}

async function handleRekognition(body) {
  const { imageUrl } = body;
  if (!imageUrl) return json(400, { error: 'imageUrl required' });
  if (!isSafeHttpsUrl(imageUrl)) return json(400, { error: 'imageUrl must be an https URL' });
  try {
    const imgResp = await fetch(imageUrl);
    const imgBytes = Buffer.from(await imgResp.arrayBuffer());
    const client = new RekognitionClient({ region: REGION });
    const resp = await client.send(new DetectLabelsCommand({ Image: { Bytes: imgBytes }, MaxLabels: 20, MinConfidence: 70 }));
    return json(200, resp);
  } catch (err) {
    console.error('[Rekognition] error:', err);
    return json(502, { error: 'Rekognition request failed' });
  }
}

async function handleNovaCanvas(body) {
  const { prompt, negativePrompt = '', width = 1280, height = 720 } = body;
  if (!prompt) return json(400, { error: 'prompt required' });
  const payload = {
    taskType: 'TEXT_IMAGE',
    textToImageParams: { text: prompt, ...(negativePrompt ? { negativeText: negativePrompt } : {}) },
    imageGenerationConfig: { numberOfImages: 1, width, height, cfgScale: 8.0, seed: Math.floor(Math.random() * 2147483647) },
  };
  const client = new BedrockRuntimeClient({ region: REGION });
  try {
    const resp = await client.send(new InvokeModelCommand({
      modelId: 'amazon.nova-canvas-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    }));
    const result = JSON.parse(new TextDecoder().decode(resp.body));
    const imageBase64 = result.images?.[0];
    if (!imageBase64) return json(502, { error: 'Nova Canvas returned no image' });
    return json(200, { imageBase64, model: 'amazon.nova-canvas-v1:0' });
  } catch (err) {
    console.error('[Nova Canvas] error:', err);
    return json(502, { error: 'Nova Canvas request failed', detail: err.message });
  }
}

async function handleKendra(body) {
  if (!KENDRA_INDEX_ID) return json(500, { error: 'KENDRA_INDEX_ID not configured' });
  const { query } = body;
  if (!query) return json(400, { error: 'query required' });
  try {
    const client = new KendraClient({ region: REGION });
    const resp = await client.send(new QueryCommand({ IndexId: KENDRA_INDEX_ID, QueryText: query, PageSize: 10 }));
    return json(200, resp);
  } catch (err) {
    console.error('[Kendra] error:', err);
    return json(502, { error: 'Kendra request failed' });
  }
}
