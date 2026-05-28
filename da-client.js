/*
 * DA (Document Authoring) API Client
 * Routes content operations through DA MCP (mcp.adobeaemcloud.com)
 * Falls back to direct admin.da.live calls if MCP is unavailable.
 *
 * Preview/Publish still go through admin.hlx.page (not in MCP scope).
 * Configurable via configure() — call from app.js with AEM_ORG values.
 */

import { fetchWithToken, getToken, getUserToken } from './ims.js';
import * as mcp from './da-mcp-client.js';

const DA_ADMIN = 'https://admin.da.live';
let DA_ORG = '';
let DA_REPO = '';
let DA_BRANCH = 'main';

/* MCP availability flag — starts null (unknown), set on first attempt */
let mcpAvailable = null;

export function configure({ org, repo, branch } = {}) {
  // Guard: reject values that look like URL artifacts (e.g. "https:" from bad parsing)
  const safe = /^[\w][\w.-]*$/;
  if (org && safe.test(org)) DA_ORG = org;
  if (repo && safe.test(repo)) DA_REPO = repo;
  if (branch && safe.test(branch)) DA_BRANCH = branch;
}

export function getOrg() { return DA_ORG; }
export function getRepo() { return DA_REPO; }
export function getBranch() { return DA_BRANCH; }

export function getBasePath() {
  return `${DA_ADMIN}/source/${DA_ORG}/${DA_REPO}`;
}

/** Throw immediately if no site is connected — prevents writes to empty paths */
function requireSite() {
  if (!DA_ORG || !DA_REPO) throw new Error('No site connected. Connect a site first before reading or writing content.');
}

/**
 * Check if MCP is available. Caches the result after first probe.
 */
async function checkMcp() {
  if (mcpAvailable !== null) return mcpAvailable;
  try {
    mcpAvailable = await mcp.isAvailable();
    console.log(`[DA] MCP ${mcpAvailable ? 'available' : 'unavailable'} — using ${mcpAvailable ? 'MCP' : 'direct API'}`);
  } catch {
    mcpAvailable = false;
    console.log('[DA] MCP unavailable — using direct API');
  }
  return mcpAvailable;
}

/* ─── Content operations — MCP first, fallback to direct ─── */

export async function listPages(path = '/') {
  requireSite();
  const url = `${getBasePath()}${path}`;
  console.log(`[DA] Direct list: GET ${url}`);
  const resp = await fetchWithToken(url);
  if (!resp.ok) throw new Error(`DA list failed: ${resp.status}`);
  return resp.json();
}

export async function getPage(path) {
  requireSite();
  const url = `${getBasePath()}${path}`;
  console.log(`[DA] Direct read: GET ${url}`);
  const resp = await fetchWithToken(url);
  if (!resp.ok) throw new Error(`DA get failed: ${resp.status}`);
  const contentType = resp.headers.get('content-type');
  if (contentType?.includes('text/html')) return resp.text();
  return resp.json();
}

export async function createPage(path, html) {
  requireSite();
  // Direct PUT to DA Admin API — same approach as Experience Workspace.
  // This is the most reliable write path. MCP adds latency and failure modes.
  return directWrite(path, html);
}

export async function updatePage(path, html) {
  requireSite();
  // Direct PUT to DA Admin API — upsert (creates or overwrites).
  return directWrite(path, html);
}

/** Direct PUT to admin.da.live/source — the reliable write path. */
async function directWrite(path, html) {
  const url = `${getBasePath()}${path}`;
  const blob = new Blob([html], { type: 'text/html' });
  const formData = new FormData();
  formData.append('data', blob, path.split('/').pop());

  console.log(`[DA] Direct write: PUT ${url} (${html.length} chars)`);
  const resp = await fetchWithToken(url, {
    method: 'PUT',
    body: formData,
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`DA write failed: ${resp.status} ${errText.slice(0, 200)}`);
  }
  console.log(`[DA] Direct write succeeded: ${resp.status}`);
  return resp;
}

export async function deletePage(path) {
  requireSite();
  const url = `${getBasePath()}${path}`;
  console.log(`[DA] Direct delete: DELETE ${url}`);
  const resp = await fetchWithToken(url, { method: 'DELETE' });
  if (!resp.ok) throw new Error(`DA delete failed: ${resp.status}`);
  return resp;
}

/* ─── Admin API — admin.hlx.page ─── */

/**
 * Send a request to admin.hlx.page using the best available IMS token.
 * getUserToken() scans localStorage for any valid IMS token (including aem-extension-builder
 * which carries the AEM authoring scopes that admin.hlx.page requires for DA sites).
 * Falls back to the darkalley/S2S token if no AEM token is present.
 */
async function fetchHlxAdmin(url, opts = {}) {
  const token = getUserToken() || getToken();
  if (!token) throw new Error('Not authenticated');
  return fetch(url, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, ...opts.headers },
  });
}

export async function previewPage(path) {
  requireSite();
  const url = `https://admin.hlx.page/preview/${DA_ORG}/${DA_REPO}/${DA_BRANCH}${path}`;
  return fetchHlxAdmin(url, { method: 'POST' });
}

export async function publishPage(path) {
  requireSite();
  const url = `https://admin.hlx.page/live/${DA_ORG}/${DA_REPO}/${DA_BRANCH}${path}`;
  return fetchHlxAdmin(url, { method: 'POST' });
}

/**
 * Get resource status from admin.hlx.page — requires IMS auth on DA-backed sites.
 */
export async function getStatus(path) {
  requireSite();
  const url = `https://admin.hlx.page/status/${DA_ORG}/${DA_REPO}/${DA_BRANCH}${path}`;
  const resp = await fetchHlxAdmin(url);
  if (!resp.ok) throw new Error(`Status check failed: ${resp.status}`);
  return resp.json();
}

/** Unpublish from preview (.aem.page) */
export async function unpublishPreview(path) {
  requireSite();
  const url = `https://admin.hlx.page/preview/${DA_ORG}/${DA_REPO}/${DA_BRANCH}${path}`;
  return fetchHlxAdmin(url, { method: 'DELETE' });
}

/** Unpublish from live (.aem.live) */
export async function unpublishLive(path) {
  requireSite();
  const url = `https://admin.hlx.page/live/${DA_ORG}/${DA_REPO}/${DA_BRANCH}${path}`;
  return fetchHlxAdmin(url, { method: 'DELETE' });
}

/** Purge CDN cache for a path */
export async function purgeCache(path) {
  requireSite();
  const url = `https://admin.hlx.page/cache/${DA_ORG}/${DA_REPO}/${DA_BRANCH}${path}`;
  return fetchHlxAdmin(url, { method: 'POST' });
}

/** Sync code from GitHub to CDN */
export async function syncCode() {
  requireSite();
  const url = `https://admin.hlx.page/code/${DA_ORG}/${DA_REPO}/${DA_BRANCH}`;
  return fetchHlxAdmin(url, { method: 'POST' });
}

/** Bulk preview — preview all pages under a path (use "/*" for entire site) */
export async function bulkPreview(paths) {
  requireSite();
  const url = `https://admin.hlx.page/preview/${DA_ORG}/${DA_REPO}/${DA_BRANCH}/*`;
  return fetchHlxAdmin(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paths }),
  });
}

/** Bulk publish — publish all pages under a path */
export async function bulkPublish(paths) {
  requireSite();
  const url = `https://admin.hlx.page/live/${DA_ORG}/${DA_REPO}/${DA_BRANCH}/*`;
  return fetchHlxAdmin(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paths }),
  });
}

/** Re-index a path (updates query-index) */
export async function reindex(path) {
  const url = `https://admin.hlx.page/index/${DA_ORG}/${DA_REPO}/${DA_BRANCH}${path}`;
  return fetchHlxAdmin(url, { method: 'POST' });
}

/* ─── URL helpers ─── */

export function getPreviewUrl(path) {
  return `https://${DA_BRANCH}--${DA_REPO.toLowerCase()}--${DA_ORG.toLowerCase()}.aem.page${path}`;
}

export function getLiveUrl(path) {
  return `https://${DA_BRANCH}--${DA_REPO.toLowerCase()}--${DA_ORG.toLowerCase()}.aem.live${path}`;
}

export function isAuthenticated() {
  return !!getToken();
}

/**
 * Force MCP re-check (e.g. after sign-in).
 */
export function resetMcpState() {
  mcpAvailable = null;
  mcp.resetSession();
}
