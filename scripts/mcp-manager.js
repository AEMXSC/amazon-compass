/**
 * mcp-manager.js — MCP Connection Manager panel
 *
 * Slide-in panel listing all 31 Adobe MCP servers + custom 3rd-party servers.
 * Shows real-time auth state, lets users connect/authenticate/disconnect each server,
 * and supports adding custom servers by URL.
 */

import { signInMcpOAuth } from './ims.js';

// Escape user-controlled strings before injecting into innerHTML
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── MCP Catalog ──────────────────────────────────────────────────────────────
// authType:
//   'ims'       → ew-ims-token (product IMS token via worker)
//   'mcp-oauth' → ew-mcp-token (AEM Cloud OAuth via aem-connect or popup)
//   'user-ims'  → user's personal IMS token (getUserToken)
//   'api-key'   → server-side API key (worker injects it — no user action needed)
//   'oauth'     → per-service OAuth token (e.g. ew-semrush-token)

const MCP_CATALOG = [
  // ── AEM & Content ──────────────────────────────────────────────────────────
  { id: 'da', name: 'AEM DA', category: 'AEM & Content', authType: 'ims', description: 'Document Authoring — create and edit pages in DA Live' },
  { id: 'content', name: 'AEM Content', category: 'AEM & Content', authType: 'ims', description: 'Read and write AEM content, launches, and publishing' },
  { id: 'content-readonly', name: 'AEM Read-Only', category: 'AEM & Content', authType: 'ims', description: 'Read-only access to AEM pages and content' },
  { id: 'content-updater', name: 'AEM Updater', category: 'AEM & Content', authType: 'ims', description: 'Bulk content updates and page migrations' },
  { id: 'aem', name: 'AEM Unified', category: 'AEM & Content', authType: 'ims', description: 'Unified AEM — page management, assets, and admin' },
  { id: 'cloudmanager', name: 'Cloud Manager', category: 'AEM & Content', authType: 'ims', description: 'Pipeline and environment management for AEM Cloud' },

  // ── Governance & Discovery ─────────────────────────────────────────────────
  { id: 'experience-governance', name: 'Experience Governance', category: 'Governance & Discovery', authType: 'user-ims', description: 'Brand compliance — evaluate text, images, and pages against brand rules (17 tools)', badge: '17 tools' },
  { id: 'discovery', name: 'AEM Discovery', category: 'Governance & Discovery', authType: 'ims', description: 'Discover AEM sites, pages, and content structure' },
  { id: 'sites-optimizer', name: 'Sites Optimizer', category: 'Governance & Discovery', authType: 'user-ims', description: 'LLM-powered site optimization and content recommendations' },

  // ── Experience Production ──────────────────────────────────────────────────
  { id: 'experience-production', name: 'Experience Production', category: 'Experience Production', authType: 'ims', description: 'AI page generation, content iteration, and launch promotion (EPA)', badge: '4 tools' },
  { id: 'content-gen', name: 'Content Generation', category: 'Experience Production', authType: 'ims', description: 'AI-powered content generation and rewriting skills' },
  { id: 'content-qa', name: 'Content QA', category: 'Experience Production', authType: 'ims', description: 'Automated content quality assessment and validation' },

  // ── Creative ──────────────────────────────────────────────────────────────
  { id: 'firefly', name: 'Firefly', category: 'Creative', authType: 'user-ims', description: 'Generate and edit images with Adobe Firefly AI' },
  { id: 'express', name: 'Adobe Express', category: 'Creative', authType: 'ims', description: 'Create social graphics, templates, and quick designs' },
  { id: 'acrobat', name: 'Acrobat', category: 'Creative', authType: 'ims', description: 'PDF creation, editing, and document intelligence' },

  // ── Analytics & Insights ──────────────────────────────────────────────────
  { id: 'cja', name: 'Customer Journey Analytics', category: 'Analytics & Insights', authType: 'ims', description: 'Cross-channel analytics, workspace reports, and calculated metrics' },
  { id: 'adobe-analytics', name: 'Adobe Analytics', category: 'Analytics & Insights', authType: 'ims', description: 'Web and mobile analytics, segments, and conversion data' },
  { id: 'cx-enterprise', name: 'CX Enterprise', category: 'Analytics & Insights', authType: 'ims', description: '390+ tools across AA, AEP, AJO, CJA, RTCDP, and Marketo', badge: '390+ tools' },
  { id: 'rtcdp', name: 'Real-Time CDP', category: 'Analytics & Insights', authType: 'ims', description: 'Real-time customer data, audiences, and segment activation' },
  { id: 'aep', name: 'AEP', category: 'Analytics & Insights', authType: 'ims', description: 'Adobe Experience Platform — unified profiles, schemas, and datasets' },
  { id: 'target', name: 'Adobe Target', category: 'Analytics & Insights', authType: 'ims', description: 'A/B testing, personalization, and recommendations' },
  { id: 'marketing-agent', name: 'Marketing Agent', category: 'Analytics & Insights', authType: 'ims', description: 'AI marketing intelligence and campaign optimization' },

  // ── Journeys & Campaigns ──────────────────────────────────────────────────
  { id: 'ajo', name: 'Journey Optimizer', category: 'Journeys & Campaigns', authType: 'ims', description: 'Customer journey orchestration, messaging, and triggers' },
  { id: 'ajo-prod', name: 'Journey Optimizer (Prod)', category: 'Journeys & Campaigns', authType: 'ims', description: 'AJO production endpoint for live campaign management' },
  { id: 'acpc', name: 'Campaign (ACPC)', category: 'Journeys & Campaigns', authType: 'ims', description: 'Adobe Campaign personalization and campaign management' },

  // ── Development & Ops ─────────────────────────────────────────────────────
  { id: 'experience-league', name: 'Experience League', category: 'Development & Ops', authType: 'ims', description: 'Adobe documentation, tutorials, and community resources' },
  { id: 'cdn-readonly', name: 'CDN (Read-Only)', category: 'Development & Ops', authType: 'ims', description: 'CDN configuration and cache status (read-only)' },
  { id: 'development', name: 'AEM Development', category: 'Development & Ops', authType: 'ims', description: 'AEM developer tools and component scaffolding' },
  { id: 'odin', name: 'AEM Odin', category: 'Development & Ops', authType: 'ims', description: 'Cloud Manager automation and pipeline control' },

  // ── 3rd Party ─────────────────────────────────────────────────────────────
  { id: 'workfront', name: 'Workfront', category: '3rd Party', authType: 'api-key', description: 'Work management, tasks, creative briefs, and approvals' },
  { id: 'semrush', name: 'Semrush', category: '3rd Party', authType: 'oauth', tokenKey: 'ew-semrush-token', description: 'SEO research, keyword analysis, and competitive intelligence' },
];

const CUSTOM_SERVERS_KEY = 'ew-custom-mcp-servers';
const TOKEN_KEYS = {
  ims: 'ew-ims-token',
  'mcp-oauth': 'ew-mcp-token',
  'oauth-semrush': 'ew-semrush-token',
};

// ── State ────────────────────────────────────────────────────────────────────
let panelOpen = false;
let searchQuery = '';

// ── Token helpers ─────────────────────────────────────────────────────────────
function hasToken(mcp) {
  if (mcp.authType === 'api-key') return true;
  if (mcp.authType === 'ims') return !!localStorage.getItem(TOKEN_KEYS.ims);
  if (mcp.authType === 'mcp-oauth') return !!localStorage.getItem(TOKEN_KEYS['mcp-oauth']);
  if (mcp.authType === 'user-ims') {
    try { return !!(window.adobeIMS?.getAccessToken()?.token); } catch { return false; }
  }
  if (mcp.authType === 'oauth') return !!(mcp.tokenKey && localStorage.getItem(mcp.tokenKey));
  return false;
}

function getStatus(mcp) {
  if (mcp.authType === 'api-key') return 'auto';
  return hasToken(mcp) ? 'ready' : 'disconnected';
}

function getCustomServers() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_SERVERS_KEY) || '[]'); } catch { return []; }
}

function saveCustomServers(servers) {
  localStorage.setItem(CUSTOM_SERVERS_KEY, JSON.stringify(servers));
}

// ── Auth handler ──────────────────────────────────────────────────────────────
async function handleConnect(mcpId, authType, tokenKey) {
  if (authType === 'api-key') return;

  if (authType === 'mcp-oauth') {
    const btn = document.querySelector(`[data-mcp-connect="${mcpId}"]`);
    if (btn) { btn.textContent = 'Connecting…'; btn.disabled = true; }
    try {
      const fresh = await signInMcpOAuth();
      if (fresh) localStorage.setItem(TOKEN_KEYS['mcp-oauth'], fresh);
    } finally {
      renderMcpList();
    }
    return;
  }

  if (authType === 'ims' || authType === 'user-ims') {
    // Trigger IMS sign-in via the existing app sign-in button
    const signInBtn = document.getElementById('signInBtn') || document.querySelector('.auth-btn');
    if (signInBtn) {
      signInBtn.click();
    } else {
      window.dispatchEvent(new CustomEvent('ew-mcp-server-missing'));
    }
    return;
  }

  if (authType === 'oauth' && tokenKey) {
    // For 3rd party OAuth — dispatch event for UI to handle
    window.dispatchEvent(new CustomEvent('ew-mcp-oauth-required', { detail: { mcpId, tokenKey } }));
    return;
  }
}

function handleDisconnect(mcpId, authType, tokenKey) {
  if (authType === 'ims') localStorage.removeItem(TOKEN_KEYS.ims);
  else if (authType === 'mcp-oauth') localStorage.removeItem(TOKEN_KEYS['mcp-oauth']);
  else if (authType === 'oauth' && tokenKey) localStorage.removeItem(tokenKey);
  renderMcpList();
}

// ── Rendering ─────────────────────────────────────────────────────────────────
function statusDot(status) {
  const map = { ready: 'mcp-dot-ready', auto: 'mcp-dot-auto', disconnected: 'mcp-dot-off', error: 'mcp-dot-error' };
  return `<span class="mcp-dot ${map[status] || 'mcp-dot-off'}" aria-label="${status}"></span>`;
}

function actionButton(mcp, status) {
  if (status === 'auto') {
    return `<span class="mcp-tag mcp-tag-auto">Auto</span>`;
  }
  if (status === 'ready') {
    if (mcp.authType === 'user-ims') {
      // Token managed by IMS sign-in — sign out via the header menu, not per-server
      return `<span class="mcp-tag mcp-tag-auto">Via IMS</span>`;
    }
    return `<button class="mcp-btn mcp-btn-disconnect" data-mcp-disconnect="${mcp.id}" data-auth="${mcp.authType}" data-key="${mcp.tokenKey || ''}" title="Disconnect">Disconnect</button>`;
  }
  return `<button class="mcp-btn mcp-btn-connect" data-mcp-connect="${mcp.id}" data-auth="${mcp.authType}" data-key="${mcp.tokenKey || ''}">Connect</button>`;
}

function renderMcpList() {
  const body = document.getElementById('mcpPanelBody');
  if (!body) return;

  const catalog = MCP_CATALOG;
  const custom = getCustomServers();
  const q = searchQuery.toLowerCase();

  const filtered = q
    ? catalog.filter((m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.category.toLowerCase().includes(q))
    : catalog;

  // Group by category
  const groups = {};
  for (const mcp of filtered) {
    if (!groups[mcp.category]) groups[mcp.category] = [];
    groups[mcp.category].push(mcp);
  }

  // Add custom servers
  const filteredCustom = q ? custom.filter((c) => c.name.toLowerCase().includes(q) || (c.url || '').toLowerCase().includes(q)) : custom;

  let html = '';

  // Summary counts
  const totalReady = catalog.filter((m) => getStatus(m) === 'ready' || getStatus(m) === 'auto').length
    + custom.filter((c) => !!c.token).length;

  html += `
    <div class="mcp-summary">
      <span class="mcp-summary-count">${totalReady}</span>
      <span class="mcp-summary-label"> of ${catalog.length + custom.length} connected</span>
    </div>`;

  for (const [category, mcps] of Object.entries(groups)) {
    html += `<div class="mcp-category">
      <div class="mcp-category-header">${category}</div>
      <div class="mcp-category-list">`;

    for (const mcp of mcps) {
      const status = getStatus(mcp);
      html += `
        <div class="mcp-row" data-status="${status}">
          <div class="mcp-row-left">
            ${statusDot(status)}
            <div class="mcp-row-info">
              <div class="mcp-row-name">
                ${escHtml(mcp.name)}
                ${mcp.badge ? `<span class="mcp-badge">${escHtml(mcp.badge)}</span>` : ''}
              </div>
              <div class="mcp-row-desc">${escHtml(mcp.description)}</div>
            </div>
          </div>
          <div class="mcp-row-action">${actionButton(mcp, status)}</div>
        </div>`;
    }

    html += `</div></div>`;
  }

  // Custom servers section
  if (filteredCustom.length > 0) {
    html += `<div class="mcp-category">
      <div class="mcp-category-header">Custom Servers</div>
      <div class="mcp-category-list">`;
    for (const cs of filteredCustom) {
      const csStatus = cs.token ? 'ready' : 'disconnected';
      html += `
        <div class="mcp-row" data-status="${csStatus}">
          <div class="mcp-row-left">
            ${statusDot(csStatus)}
            <div class="mcp-row-info">
              <div class="mcp-row-name">${escHtml(cs.name)}</div>
              <div class="mcp-row-desc">${escHtml(cs.url)}</div>
            </div>
          </div>
          <div class="mcp-row-action">
            <button class="mcp-btn mcp-btn-disconnect mcp-btn-remove" data-remove-custom="${cs.id}" title="Remove">Remove</button>
          </div>
        </div>`;
    }
    html += `</div></div>`;
  }

  if (!html.includes('mcp-row')) {
    html += `<div class="mcp-empty">No servers match your search.</div>`;
  }

  body.innerHTML = html;

  // Attach event handlers
  body.querySelectorAll('[data-mcp-connect]').forEach((btn) => {
    btn.addEventListener('click', () => handleConnect(btn.dataset.mcpConnect, btn.dataset.auth, btn.dataset.key));
  });
  body.querySelectorAll('[data-mcp-disconnect]').forEach((btn) => {
    btn.addEventListener('click', () => handleDisconnect(btn.dataset.mcpDisconnect, btn.dataset.auth, btn.dataset.key));
  });
  body.querySelectorAll('[data-remove-custom]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const servers = getCustomServers().filter((s) => s.id !== btn.dataset.removeCustom);
      saveCustomServers(servers);
      renderMcpList();
    });
  });
}

// ── Add Custom Server ─────────────────────────────────────────────────────────
function showAddCustom() {
  const modal = document.getElementById('mcpCustomModal');
  if (modal) modal.classList.add('visible');
}

function hideAddCustom() {
  const modal = document.getElementById('mcpCustomModal');
  if (modal) {
    modal.classList.remove('visible');
    document.getElementById('customMcpName').value = '';
    document.getElementById('customMcpUrl').value = '';
    document.getElementById('customMcpAuth').value = 'none';
    document.getElementById('customMcpToken').value = '';
    document.getElementById('customMcpAuthValue').style.display = 'none';
  }
}

async function saveCustomServer() {
  const name = document.getElementById('customMcpName').value.trim();
  const url = document.getElementById('customMcpUrl').value.trim();
  const authType = document.getElementById('customMcpAuth').value;
  const token = document.getElementById('customMcpToken').value.trim();

  if (!name || !url) {
    document.getElementById('customMcpError').textContent = 'Name and URL are required.';
    return;
  }

  const saveBtn = document.getElementById('customMcpSave');
  saveBtn.textContent = 'Testing…';
  saveBtn.disabled = true;
  document.getElementById('customMcpError').textContent = '';

  // Test connection
  try {
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'compass', version: '1.0' } } }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!resp.ok && resp.status !== 401) throw new Error(`Server returned ${resp.status}`);
  } catch (err) {
    console.warn('[MCP] Custom server connection test failed:', err);
    document.getElementById('customMcpError').textContent = err.name === 'AbortError'
      ? 'Connection timed out — check the URL and try again.'
      : 'Could not reach the server. Check the URL and any firewall or CORS settings.';
    saveBtn.textContent = 'Connect & Test';
    saveBtn.disabled = false;
    return;
  }

  const server = { id: `custom-${Date.now()}`, name, url, authType, token: token || null };
  const servers = getCustomServers();
  servers.push(server);
  saveCustomServers(servers);

  hideAddCustom();
  renderMcpList();
  saveBtn.textContent = 'Connect & Test';
  saveBtn.disabled = false;
}

// ── Panel toggle ──────────────────────────────────────────────────────────────
function openPanel() {
  panelOpen = true;
  const panel = document.getElementById('mcpPanel');
  const btn = document.getElementById('mcpManagerBtn');
  if (panel) panel.classList.add('visible');
  if (btn) btn.classList.add('active');
  renderMcpList();
}

function closePanel() {
  panelOpen = false;
  const panel = document.getElementById('mcpPanel');
  const btn = document.getElementById('mcpManagerBtn');
  if (panel) panel.classList.remove('visible');
  if (btn) btn.classList.remove('active');
}

function togglePanel() {
  if (panelOpen) closePanel(); else openPanel();
}

// ── Init ──────────────────────────────────────────────────────────────────────
export function initMcpManager() {
  const btn = document.getElementById('mcpManagerBtn');
  if (btn) btn.addEventListener('click', togglePanel);

  const closeBtn = document.getElementById('mcpPanelClose');
  if (closeBtn) closeBtn.addEventListener('click', closePanel);

  const searchInput = document.getElementById('mcpSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderMcpList();
    });
  }

  const addCustomBtn = document.getElementById('mcpAddCustom');
  if (addCustomBtn) addCustomBtn.addEventListener('click', showAddCustom);

  // Custom modal
  const customModal = document.getElementById('mcpCustomModal');
  if (customModal) {
    customModal.addEventListener('click', (e) => { if (e.target === customModal) hideAddCustom(); });
    document.getElementById('customMcpCancel')?.addEventListener('click', hideAddCustom);
    document.getElementById('customMcpClose')?.addEventListener('click', hideAddCustom);
    document.getElementById('customMcpSave')?.addEventListener('click', saveCustomServer);

    document.getElementById('customMcpAuth')?.addEventListener('change', (e) => {
      const wrap = document.getElementById('customMcpAuthValue');
      const label = document.getElementById('customMcpAuthLabel');
      wrap.style.display = e.target.value === 'none' ? 'none' : 'block';
      label.textContent = e.target.value === 'api-key' ? 'API Key' : 'Bearer Token';
    });
  }

  // Close panel when clicking main content
  document.querySelector('.main')?.addEventListener('click', () => {
    if (panelOpen) closePanel();
  });
}
