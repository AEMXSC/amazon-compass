/*
 * Business Profile System — Dynamic org-specific context injection
 *
 * Each profile contains everything the AI needs to act as a customer-specific agent:
 * brand voice, segment names, approval chains, legal SLAs, DAM taxonomy, etc.
 */

const STORAGE_KEY = 'ew-active-profile';

export const PROFILES = {

  /* ── Business Profiles ── */

  /* placeholder — add Amazon business unit profiles here */
  'amazon-retail': {
    id: 'amazon-retail',
    name: 'Amazon Retail',
    logoUrl: '/icons/amazon-icon.svg',
    orgId: 'amazon',
    repo: 'amazon-retail',
    branch: 'main',
    tier: 'AEM CS + EDS',
    env: 'Prod',
    services: ['EDS', 'Assets Content Hub', 'Sites'],
    vertical: 'Retail / eCommerce',

    brandVoice: {
      tone: 'Technical, confident, forward-looking',
      keywords: ['agentic', 'orchestration', 'content supply chain', 'experience production'],
      avoided: ['simple', 'easy', 'just'],
      style: 'Authoritative enterprise tech — short sentences, active voice, quantified claims',
    },

    segments: [
      { name: 'Enterprise AEM Customers', id: 'ent-aem', description: 'Existing AEM CS customers exploring EDS migration' },
      { name: 'Greenfield EDS', id: 'greenfield', description: 'New customers starting directly with Edge Delivery' },
      { name: 'Move-to-Cloud', id: 'mtc', description: 'AEM 6.5 customers migrating to Cloud Service' },
    ],

    approvalChain: [
      { role: 'Content Author', action: 'Create/edit content' },
      { role: 'Content Lead', action: 'Review & approve content' },
      { role: 'Brand Manager', action: 'Brand compliance sign-off' },
      { role: 'Legal', action: 'Legal review (if flagged)', sla: '48h' },
      { role: 'Publisher', action: 'Publish to .live' },
    ],

    legalSLA: { reviewTime: '48h', escalation: '72h', autoApprove: false },

    damTaxonomy: {
      root: '/content/dam/aem-xsc',
      folders: ['hero-images', 'icons', 'team-photos', 'logos'],
      namingConvention: 'kebab-case, descriptive, includes dimensions',
    },

    aepOrgId: '708E423B67F3C2050A495C27@AdobeOrg',
    aepSandbox: 'prod',

    /* ── Real MCP Connectors (matches Admin Console + discovered endpoints) ── */
    connectors: [
      { name: 'Acrobat MCP', env: 'Prod', type: 'CUSTOM', status: 'live', endpoint: 'acrobat-mcp.adobe.io/mcp/call' },
      { name: 'Adobe Analytics MCP', env: 'Prod', type: 'CUSTOM', status: 'live' },
      { name: 'Adobe CJA MCP', env: 'Prod', type: 'CUSTOM', status: 'live' },
      { name: 'Adobe Express MCP', env: 'Dev', type: 'CUSTOM', status: 'live' },
      { name: 'Adobe Express MCP', env: 'Prod', type: 'CUSTOM', status: 'live' },
      { name: 'Adobe Express MCP', env: 'Stage', type: 'CUSTOM', status: 'live' },
      { name: 'Adobe Illustrator MCP', env: 'Stage', type: 'CUSTOM', status: 'live' },
      { name: 'Adobe Marketing Agent MCP', env: 'Prod', type: 'CUSTOM', status: 'live' },
      { name: 'Adobe MCP', env: 'Stage', type: 'CUSTOM', status: 'live' },
      { name: 'AEM Content', env: 'Prod', type: 'CUSTOM', status: 'live' },
      { name: 'AEM DA', env: 'Prod', type: 'CUSTOM', status: 'live' },
      { name: 'AEM Odin', env: 'Prod', type: 'CUSTOM', status: 'live' },
      { name: 'AEP Destinations MCP', env: 'Prod', type: 'CUSTOM', status: 'live', endpoint: 'aep-destinations-mcp.adobe.io/mcp' },
      { name: 'Experience League MCP', env: 'Prod', type: 'CUSTOM', status: 'live', endpoint: 'exl-ia-mcp-service.ethos55-prod-va7.ethos.adobe.net/mcp' },
      { name: 'Spacecat Sites Optimizer MCP', env: 'Prod', type: 'CUSTOM', status: 'live', endpoint: 'spacecat.experiencecloud.live/api/v1/mcp' },
      { name: 'GitHub Integration', env: 'Prod', type: 'NATIVE', status: 'live' },
    ],

    entitlements: {
      acrobat: { name: 'Acrobat MCP', mcp: 'Acrobat MCP - Prod', status: 'live', endpoint: 'acrobat-mcp.adobe.io/mcp/call', note: 'PDF extract, merge, convert via MCP — Prod endpoint live' },
      aa: { name: 'Adobe Analytics', mcp: 'Adobe Analytics MCP - Prod', status: 'live', endpoint: 'mcp-gateway.adobe.io/aa/mcp', note: 'Connected via MCP Gateway' },
      cja: { name: 'Customer Journey Analytics', mcp: 'Adobe CJA MCP - Prod', status: 'live', endpoint: 'mcp-gateway.adobe.io/cja/mcp', note: 'Connected via MCP Gateway' },
      express: { name: 'Adobe Express', mcp: 'Adobe Express MCP - Prod', status: 'live', note: 'Creative generation, templates, brand kit' },
      illustrator: { name: 'Adobe Illustrator', mcp: 'Adobe Illustrator MCP - Stage', status: 'live', note: 'Vector generation and editing' },
      marketingAgent: { name: 'Adobe Marketing Agent', mcp: 'Adobe Marketing Agent MCP', status: 'live', note: 'AJO journey orchestration, campaign management' },
      aep: { name: 'Adobe Experience Platform', mcp: 'AEP MCP', status: 'live', endpoint: 'platform.adobe.io/data/core/ups/segment/definitions', note: 'Segment API live — Prod (VA7)' },
      target: { name: 'Adobe Target', mcp: 'Target MCP', status: 'active', note: 'Experience decisioning' },
      aemContent: { name: 'AEM Content', mcp: 'AEM Content - Prod', status: 'live', note: 'Content read/write, launches, fragments' },
      aemDA: { name: 'AEM DA', mcp: 'AEM DA - Prod', status: 'live', note: 'Document Authoring — real read/write/preview/publish via admin.da.live' },
      aemOdin: { name: 'AEM Odin', mcp: 'AEM Odin Prod', status: 'live', note: 'AEM Sites management and authoring' },
      destinations: { name: 'AEP Destinations', mcp: 'AEP Destinations MCP - Prod', status: 'live', endpoint: 'aep-destinations-mcp.adobe.io/mcp', note: 'Destination data flows, health monitoring, activation status — MVP read-only (13 tools)' },
      exl: { name: 'Experience League MCP', mcp: 'Experience League MCP - Prod', status: 'live', endpoint: 'exl-ia-mcp-service.ethos55-prod-va7.ethos.adobe.net/mcp', note: 'Doc search, tutorials, release notes — Experience Cloud product docs for AI tools' },
      sitesOptimizer: { name: 'Sites Optimizer (Spacecat)', mcp: 'Spacecat Sites Optimizer MCP - Prod', status: 'live', endpoint: 'spacecat.experiencecloud.live/api/v1/mcp', note: 'Site audit, SEO opportunities, performance recommendations, broken backlinks' },
      github: { name: 'GitHub Integration', mcp: 'GitHub Integration', status: 'live', note: 'Repo access, PR management, code sync' },
      workfront: { name: 'Workfront', mcp: 'Workfront WOA', status: 'active', note: 'P1 skills integrated — campaign ops' },
    },

    mcpCapabilities: [
      { capability: 'AEM content read/write', mcp: 'AEM Content - Prod', ready: true },
      { capability: 'AEM Launches', mcp: 'AEM Content - Prod', ready: true },
      { capability: 'DA page editing', mcp: 'AEM DA - Prod', ready: true },
      { capability: 'DA preview/publish', mcp: 'AEM DA - Prod', ready: true },
      { capability: 'AEM Sites (Odin)', mcp: 'AEM Odin Prod', ready: true },
      { capability: 'Analytics queries', mcp: 'Adobe Analytics MCP - Prod', ready: true, endpoint: 'mcp-gateway.adobe.io/aa/mcp' },
      { capability: 'CJA queries', mcp: 'Adobe CJA MCP - Prod', ready: true, endpoint: 'mcp-gateway.adobe.io/cja/mcp' },
      { capability: 'AEP Segment API', mcp: 'AEP MCP', ready: true, endpoint: 'platform.adobe.io/data/core/ups/segment/definitions' },
      { capability: 'AJO journey orchestration', mcp: 'Adobe Marketing Agent MCP', ready: true },
      { capability: 'PDF extraction/conversion', mcp: 'Acrobat MCP - Prod', ready: true, endpoint: 'acrobat-mcp.adobe.io/mcp/call' },
      { capability: 'Creative generation', mcp: 'Adobe Express MCP - Prod', ready: true },
      { capability: 'Vector editing', mcp: 'Adobe Illustrator MCP - Stage', ready: true },
      { capability: 'GitHub repo/PR management', mcp: 'GitHub Integration', ready: true },
      { capability: 'Destination data flow health', mcp: 'AEP Destinations MCP - Prod', ready: true, endpoint: 'aep-destinations-mcp.adobe.io/mcp' },
      { capability: 'Destination activation status', mcp: 'AEP Destinations MCP - Prod', ready: true },
      { capability: 'Experience League doc search', mcp: 'Experience League MCP - Prod', ready: true, endpoint: 'exl-ia-mcp-service.ethos55-prod-va7.ethos.adobe.net/mcp' },
      { capability: 'Product release notes', mcp: 'Experience League MCP - Prod', ready: true },
      { capability: 'Site SEO audit', mcp: 'Spacecat Sites Optimizer MCP - Prod', ready: true, endpoint: 'spacecat.experiencecloud.live/api/v1/mcp' },
      { capability: 'Site performance opportunities', mcp: 'Spacecat Sites Optimizer MCP - Prod', ready: true },
      { capability: 'Audience creation/sharing', mcp: 'AEP + Target', ready: true },
    ],

    /* ── Curated data (grounded, stable — never randomized) ── */

    segmentSizes: {
      'ent-aem': 142300,
      'greenfield': 87600,
      'mtc': 63400,
    },

    analyticsBaseline: {
      page_views: 34200,
      unique_visitors: 18700,
      bounce_rate: '31.4%',
      avg_time_on_page: '94s',
      conversion_rate: '3.2%',
      top_entry_source: 'organic search',
      mobile_pct: 62,
      hero_ctr: '11.3%',
      trend: 'up 8% vs prior period',
    },

    journeys: [
      { name: 'EDS Onboarding Series', status: 'active', messages_sent: 14320, open_rate: '38.1%', conversion: '12.4%' },
      { name: 'Cloud Migration Nurture', status: 'active', messages_sent: 9840, open_rate: '31.7%', conversion: '7.2%' },
      { name: 'Feature Adoption — Agentic AI', status: 'draft', messages_sent: 0, open_rate: 'N/A', conversion: 'N/A' },
    ],

    /* ── Destinations (AEP Destinations MCP — curated) ── */
    destinations: [
      { id: 'dest-fb-001', name: 'Facebook Custom Audiences', type: 'social', status: 'active', connectionSpec: 'facebook-custom-audiences', flowRunsLast24h: 12, failedRuns: 0, profilesActivated: 142300, lastRun: '2h ago' },
      { id: 'dest-ga-002', name: 'Google Ads Customer Match', type: 'advertising', status: 'active', connectionSpec: 'google-ads-customer-match', flowRunsLast24h: 8, failedRuns: 1, profilesActivated: 87600, lastRun: '45m ago' },
      { id: 'dest-sf-003', name: 'Salesforce Marketing Cloud', type: 'email-marketing', status: 'active', connectionSpec: 'salesforce-marketing-cloud', flowRunsLast24h: 6, failedRuns: 0, profilesActivated: 63400, lastRun: '3h ago' },
      { id: 'dest-s3-004', name: 'Amazon S3 (Data Lake Export)', type: 'cloud-storage', status: 'active', connectionSpec: 'amazon-s3', flowRunsLast24h: 4, failedRuns: 0, profilesActivated: 293300, lastRun: '1h ago' },
      { id: 'dest-tt-005', name: 'The Trade Desk', type: 'advertising', status: 'active', connectionSpec: 'the-trade-desk', flowRunsLast24h: 8, failedRuns: 0, profilesActivated: 218700, lastRun: '30m ago' },
      { id: 'dest-brz-006', name: 'Braze', type: 'mobile-engagement', status: 'warning', connectionSpec: 'braze', flowRunsLast24h: 6, failedRuns: 2, profilesActivated: 41200, lastRun: '4h ago' },
      { id: 'dest-http-007', name: 'HTTP API (Internal Analytics)', type: 'streaming', status: 'active', connectionSpec: 'http-api', flowRunsLast24h: 288, failedRuns: 3, profilesActivated: 0, lastRun: '5m ago' },
    ],

    destinationFlowRuns: [
      { flowRunId: 'fr-001', destinationId: 'dest-fb-001', status: 'success', recordsReceived: 14230, recordsActivated: 14118, recordsFailed: 112, startTime: '2h ago', duration: '4m 12s' },
      { flowRunId: 'fr-002', destinationId: 'dest-ga-002', status: 'partial_success', recordsReceived: 8760, recordsActivated: 8540, recordsFailed: 220, startTime: '45m ago', duration: '6m 38s', errorCategory: 'INVALID_IDENTITIES', errorMessage: '220 profiles missing required Google Ads identity (gclid or email)' },
      { flowRunId: 'fr-003', destinationId: 'dest-sf-003', status: 'success', recordsReceived: 6340, recordsActivated: 6340, recordsFailed: 0, startTime: '3h ago', duration: '2m 54s' },
      { flowRunId: 'fr-004', destinationId: 'dest-s3-004', status: 'success', recordsReceived: 29330, recordsActivated: 29330, recordsFailed: 0, startTime: '1h ago', duration: '8m 22s' },
      { flowRunId: 'fr-005', destinationId: 'dest-brz-006', status: 'failed', recordsReceived: 4120, recordsActivated: 0, recordsFailed: 4120, startTime: '4h ago', duration: '1m 03s', errorCategory: 'AUTH_EXPIRED', errorMessage: 'Braze API key expired — credential renewal required' },
      { flowRunId: 'fr-006', destinationId: 'dest-tt-005', status: 'success', recordsReceived: 21870, recordsActivated: 21870, recordsFailed: 0, startTime: '30m ago', duration: '5m 44s' },
    ],

    sampleCustomers: [
      { firstName: 'Sarah', lastName: 'Chen', email: 'schen@techcorp.io', ltv: '$12,400', loyalty: 'Platinum', channel: 'email', city: 'San Francisco' },
      { firstName: 'Marcus', lastName: 'Williams', email: 'mwilliams@acme.com', ltv: '$8,200', loyalty: 'Gold', channel: 'web', city: 'Austin' },
      { firstName: 'Priya', lastName: 'Sharma', email: 'psharma@global.co', ltv: '$23,100', loyalty: 'Platinum', channel: 'push', city: 'Singapore' },
    ],

    systemPromptExtras: '',
  },

  /* ── Amazon AWS ── */
  'amazon-aws': {
    id: 'amazon-aws',
    name: 'Amazon Web Services',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/512px-Amazon_Web_Services_Logo.svg.png',
    orgId: 'aws',
    repo: 'aws-marketing',
    branch: 'main',
    tier: 'AEM CS + EDS',
    env: 'Prod',
    services: ['EDS', 'Assets Content Hub', 'Sites'],
    vertical: 'Cloud / Technology',
    sourceUrl: 'https://aws.amazon.com',

    brandVoice: {
      tone: 'Clear, technical, customer-obsessed',
      keywords: ['scalable', 'reliable', 'secure', 'innovative', 'cost-effective'],
      avoided: ['jargon', 'vague claims', 'unsupported superlatives'],
      style: 'Plain English, data-driven, customer-first. Active voice. No marketing fluff.',
    },

    segments: [
      { name: 'Enterprise Builders', id: 'enterprise', description: 'Large orgs running workloads on AWS, looking to scale' },
      { name: 'Startups', id: 'startups', description: 'Fast-growing companies building on AWS from day one' },
      { name: 'Public Sector', id: 'public-sector', description: 'Government and education accounts' },
    ],

    approvalChain: [
      { role: 'Content Author', action: 'Draft page content' },
      { role: 'Product Marketing', action: 'Technical accuracy review', sla: '24h' },
      { role: 'Legal', action: 'Compliance review', sla: '48h' },
      { role: 'Digital Publisher', action: 'Publish to aws.amazon.com' },
    ],

    legalSLA: { reviewTime: '48h', escalation: '72h', autoApprove: false },

    damTaxonomy: {
      root: '/content/dam/aws',
      folders: ['product-icons', 'diagrams', 'case-studies', 'hero-images'],
      namingConvention: 'aws-[service]-[type]-[description]',
    },

    entitlements: {
      aemContent: { name: 'AEM Content', mcp: 'AEM Content MCP', status: 'live', note: 'Content read/write' },
      aemDA: { name: 'AEM DA', mcp: 'AEM DA - Prod', status: 'live', note: 'Document Authoring' },
      analytics: { name: 'Adobe Analytics', mcp: 'AA MCP', status: 'active', note: 'Report suite: aws-marketing-prod' },
    },

    mcpCapabilities: [
      { capability: 'AEM content read/write', mcp: 'AEM Content MCP', ready: true },
      { capability: 'DA page editing', mcp: 'AEM DA - Prod', ready: true },
      { capability: 'Analytics queries', mcp: 'AA MCP', ready: true },
    ],

    systemPromptExtras: `## Amazon Web Services — Business Profile\nYou are working with aws.amazon.com marketing pages. Content must be technically accurate, plain English, and customer-obsessed. All product claims must be substantiated.`,

    segmentSizes: { 'enterprise': 2400000, 'startups': 890000, 'public-sector': 340000 },
    analyticsBaseline: { page_views: 48000000, unique_visitors: 12000000, bounce_rate: '34.1%', avg_time_on_page: '142s', conversion_rate: '2.8%', top_entry_source: 'organic search', mobile_pct: 44, hero_ctr: '8.2%', trend: 'up 14% vs prior period' },
    journeys: [
      { name: 'Free Tier Onboarding', status: 'active', messages_sent: 1240000, open_rate: '44.2%', conversion: '18.7%' },
      { name: 'Enterprise Migration Nurture', status: 'active', messages_sent: 284000, open_rate: '31.4%', conversion: '6.2%' },
    ],
    sampleCustomers: [
      { firstName: 'Raj', lastName: 'Patel', email: 'raj@startup.io', ltv: '$84,200', loyalty: 'Platinum', channel: 'email', city: 'Seattle' },
      { firstName: 'Lisa', lastName: 'Chen', email: 'lchen@enterprise.com', ltv: '$2,400,000', loyalty: 'Enterprise', channel: 'web', city: 'New York' },
    ],
  },

  /* ── Amazon Advertising ── */
  'amazon-advertising': {
    id: 'amazon-advertising',
    name: 'Amazon Advertising',
    logoUrl: '/icons/amazon-icon.svg',
    orgId: 'amazon-ads',
    repo: 'amazon-advertising',
    branch: 'main',
    tier: 'AEM CS + EDS',
    env: 'Prod',
    services: ['EDS', 'Assets Content Hub', 'Sites'],
    vertical: 'Advertising / Marketing',
    sourceUrl: 'https://advertising.amazon.com',

    brandVoice: {
      tone: 'Confident, results-driven, data-backed',
      keywords: ['reach', 'ROAS', 'DSP', 'Sponsored Ads', 'performance'],
      avoided: ['cheap', 'easy money', 'guaranteed results'],
      style: 'Business-direct. Lead with outcomes and data. Marketers want ROI proof, not promises.',
    },

    segments: [
      { name: 'Brand Advertisers', id: 'brand', description: 'Large brands running Sponsored Brands and DSP campaigns' },
      { name: 'Performance Marketers', id: 'performance', description: 'Sellers focused on Sponsored Products and ROAS' },
      { name: 'Agencies', id: 'agencies', description: 'Media and creative agencies managing Amazon Ads on behalf of clients' },
    ],

    approvalChain: [
      { role: 'Content Author', action: 'Draft page content' },
      { role: 'Ads Marketing', action: 'Message accuracy review', sla: '24h' },
      { role: 'Legal', action: 'Claims and compliance review', sla: '48h' },
      { role: 'Digital Publisher', action: 'Publish to advertising.amazon.com' },
    ],

    legalSLA: { reviewTime: '48h', escalation: '72h', autoApprove: false },

    damTaxonomy: {
      root: '/content/dam/amazon-advertising',
      folders: ['campaign-creative', 'case-studies', 'product-screenshots', 'infographics'],
      namingConvention: 'amzads-[format]-[audience]-[description]',
    },

    entitlements: {
      aemContent: { name: 'AEM Content', mcp: 'AEM Content MCP', status: 'live', note: 'Content read/write' },
      aemDA: { name: 'AEM DA', mcp: 'AEM DA - Prod', status: 'live', note: 'Document Authoring' },
      analytics: { name: 'Adobe Analytics', mcp: 'AA MCP', status: 'active', note: 'Report suite: amzads-marketing-prod' },
    },

    mcpCapabilities: [
      { capability: 'AEM content read/write', mcp: 'AEM Content MCP', ready: true },
      { capability: 'DA page editing', mcp: 'AEM DA - Prod', ready: true },
      { capability: 'Analytics queries', mcp: 'AA MCP', ready: true },
    ],

    systemPromptExtras: `## Amazon Advertising — Business Profile\nYou are working with advertising.amazon.com marketing pages. Content targets brand advertisers, performance marketers, and agencies. Lead with measurable outcomes and ROAS data.`,

    segmentSizes: { 'brand': 48000, 'performance': 2800000, 'agencies': 12000 },
    analyticsBaseline: { page_views: 8400000, unique_visitors: 2100000, bounce_rate: '29.4%', avg_time_on_page: '118s', conversion_rate: '3.4%', top_entry_source: 'direct', mobile_pct: 38, hero_ctr: '9.1%', trend: 'up 22% vs prior period' },
    journeys: [
      { name: 'Sponsored Ads Onboarding', status: 'active', messages_sent: 840000, open_rate: '38.7%', conversion: '14.2%' },
      { name: 'DSP Demo Request', status: 'active', messages_sent: 124000, open_rate: '42.1%', conversion: '8.9%' },
    ],
    sampleCustomers: [
      { firstName: 'Marcus', lastName: 'Johnson', email: 'mjohnson@brand.com', ltv: '$420,000', loyalty: 'Enterprise', channel: 'email', city: 'Chicago' },
      { firstName: 'Yuki', lastName: 'Tanaka', email: 'ytanaka@agency.co', ltv: '$1,200,000', loyalty: 'Agency', channel: 'web', city: 'Los Angeles' },
    ],
  },
};

/* ── Dynamic Profile Storage ── */
const CUSTOM_PROFILES_KEY = 'ew-custom-profiles';

function loadCustomProfiles() {
  try {
    const raw = localStorage.getItem(CUSTOM_PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveCustomProfiles(profiles) {
  localStorage.setItem(CUSTOM_PROFILES_KEY, JSON.stringify(profiles));
}

export function addCustomProfile(profile) {
  const customs = loadCustomProfiles();
  customs[profile.id] = profile;
  saveCustomProfiles(customs);
}

export function deleteCustomProfile(profileId) {
  const customs = loadCustomProfiles();
  delete customs[profileId];
  saveCustomProfiles(customs);
}

function getAllProfiles() {
  return { ...PROFILES, ...loadCustomProfiles() };
}

/* ── Profile Management ── */

export function getActiveProfileId() {
  return localStorage.getItem(STORAGE_KEY) || null;
}

export function setActiveProfile(profileId) {
  const all = getAllProfiles();
  if (!all[profileId]) throw new Error(`Unknown profile: ${profileId}`);
  localStorage.setItem(STORAGE_KEY, profileId);
}

export function getActiveProfile() {
  const id = getActiveProfileId();
  if (!id) return null;
  const all = getAllProfiles();
  return all[id] || null;
}

export function listProfiles() {
  return Object.values(getAllProfiles()).map((p) => ({
    id: p.id,
    name: p.name,
    vertical: p.vertical,
    tier: p.tier,
    isCustom: !PROFILES[p.id],
  }));
}

/* ── AEM_ORG compat — builds the old AEM_ORG shape from active profile ── */
export function getOrgConfig() {
  const p = getActiveProfile();
  if (!p) {
    return {
      name: '', orgId: '', repo: '', branch: 'main',
      get previewOrigin() { return ''; },
      get liveOrigin() { return ''; },
      get daOrg() { return ''; },
      get daRepo() { return ''; },
      tier: '', env: '', services: [], entitlements: [], mcpCapabilities: [],
    };
  }
  return {
    name: p.name,
    orgId: p.orgId,
    repo: p.repo,
    branch: p.branch,
    get previewOrigin() { return `https://${this.branch}--${this.repo}--${this.orgId.toLowerCase()}.aem.page`; },
    get liveOrigin() { return `https://${this.branch}--${this.repo}--${this.orgId.toLowerCase()}.aem.live`; },
    get daOrg() { return this.orgId; },
    get daRepo() { return this.repo; },
    tier: p.tier,
    env: p.env,
    services: p.services,
    entitlements: p.entitlements,
    mcpCapabilities: p.mcpCapabilities,
  };
}

/* ── System Prompt Builder — the core of Differentiator #1 ── */
export function buildCustomerContext() {
  const p = getActiveProfile();
  if (!p) return '\n## No customer profile active. Site context comes from the connected repository.';
  const parts = [];

  parts.push(`\n## Customer Profile: ${p.name}`);
  parts.push(`- **Vertical**: ${p.vertical}`);
  parts.push(`- **Tier**: ${p.tier}`);
  parts.push(`- **Environment**: ${p.env}`);
  parts.push(`- **Repository**: ${p.orgId}/${p.repo} (branch: ${p.branch})`);
  parts.push(`- **Services**: ${p.services.join(', ')}`);

  // Brand voice
  if (p.brandVoice) {
    parts.push(`\n### Brand Voice`);
    parts.push(`- **Tone**: ${p.brandVoice.tone}`);
    parts.push(`- **Style**: ${p.brandVoice.style}`);
    parts.push(`- **Keywords**: ${p.brandVoice.keywords.join(', ')}`);
    parts.push(`- **Avoid**: ${p.brandVoice.avoided.join(', ')}`);
    if (p.brandVoice.colorPalette) {
      parts.push(`- **Colors**: Primary ${p.brandVoice.colorPalette.primary}, Secondary ${p.brandVoice.colorPalette.secondary}, Accent ${p.brandVoice.colorPalette.accent}`);
    }
    if (p.brandVoice.typography) {
      parts.push(`- **Typography**: Headings: ${p.brandVoice.typography.heading}, Body: ${p.brandVoice.typography.body}`);
    }
  }

  // Segments
  if (p.segments?.length) {
    parts.push(`\n### Audience Segments`);
    p.segments.forEach((s) => {
      parts.push(`- **${s.name}** (${s.id}): ${s.description}`);
    });
  }

  // Approval chain
  if (p.approvalChain?.length) {
    parts.push(`\n### Approval Workflow`);
    p.approvalChain.forEach((step, i) => {
      const sla = step.sla ? ` [SLA: ${step.sla}]` : '';
      parts.push(`${i + 1}. **${step.role}** — ${step.action}${sla}`);
    });
  }

  // Legal rules
  if (p.legalSLA?.specialRules?.length) {
    parts.push(`\n### Legal & Compliance Rules`);
    p.legalSLA.specialRules.forEach((rule) => {
      parts.push(`- ${rule}`);
    });
  }

  // DAM taxonomy
  if (p.damTaxonomy) {
    parts.push(`\n### DAM Taxonomy`);
    parts.push(`- **Root**: ${p.damTaxonomy.root}`);
    parts.push(`- **Folders**: ${p.damTaxonomy.folders.join(', ')}`);
    parts.push(`- **Naming**: ${p.damTaxonomy.namingConvention}`);
  }

  // Customer-specific extras
  if (p.systemPromptExtras) {
    parts.push(p.systemPromptExtras);
  }

  return parts.join('\n');
}

/* ── AI Profile Generation Prompt ── */
/* Given discovery notes + scraped site data, generate a complete customer profile */

export const PROFILE_GENERATION_PROMPT = `You are an AI-powered customer onboarding agent for Adobe Experience Manager XSC (Experience Success Consulting).

Given discovery call notes and/or a website analysis, generate a complete customer profile JSON object.

Return ONLY valid JSON (no markdown fences, no explanation) matching this exact structure:

{
  "id": "kebab-case-id",
  "name": "Company Name",
  "orgId": "github-org-id",
  "repo": "eds-repo-name",
  "branch": "main",
  "tier": "AEM CS + EDS",
  "env": "Prod",
  "services": ["EDS", "Assets Content Hub", "Sites"],
  "vertical": "Industry / Sub-industry",
  "sourceUrl": "https://their-site.com",

  "brandVoice": {
    "tone": "3-5 word tone description",
    "keywords": ["brand", "keywords", "they", "use"],
    "avoided": ["words", "they", "avoid"],
    "style": "One sentence describing their communication style",
    "colorPalette": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "background": "#hex",
      "text": "#hex"
    },
    "typography": {
      "heading": "Font Family, fallback",
      "body": "Font Family, fallback"
    }
  },

  "segments": [
    { "name": "Segment Name", "id": "segment-id", "description": "Who they are and what they want" }
  ],

  "approvalChain": [
    { "role": "Role Name", "action": "What they do in the workflow", "sla": "24h" }
  ],

  "legalSLA": {
    "reviewTime": "48h",
    "escalation": "72h",
    "autoApprove": false,
    "specialRules": ["Specific legal/compliance rules for this customer"]
  },

  "damTaxonomy": {
    "root": "/content/dam/customer-name",
    "folders": ["category1", "category2"],
    "namingConvention": "prefix-[category]-[description]-[year]"
  },

  "entitlements": {
    "analytics": { "name": "Adobe Analytics", "mcp": "AA MCP", "status": "active", "note": "Configuration note" },
    "cja": { "name": "Customer Journey Analytics", "mcp": "CJA MCP", "status": "active", "note": "Note" },
    "aep": { "name": "Adobe Experience Platform", "mcp": "AEP MCP", "status": "active", "note": "Note" },
    "target": { "name": "Adobe Target", "mcp": "Target MCP", "status": "active", "note": "Note" },
    "aemContent": { "name": "AEM Content", "mcp": "AEM Content MCP", "status": "live", "note": "Note" },
    "workfront": { "name": "Workfront", "mcp": "Workfront WOA", "status": "active", "note": "Note" }
  },

  "mcpCapabilities": [
    { "capability": "AEM content read/write", "mcp": "AEM Content MCP", "ready": true },
    { "capability": "Analytics queries", "mcp": "AA MCP", "ready": false, "needs": "Report suite ID" }
  ],

  "systemPromptExtras": "Multi-line string with customer-specific context that the AI should know. Include site structure, key business context, competitive landscape, and what success looks like for this customer."
}

RULES:
- Extract brand colors from CSS/design if website data is provided
- Extract typography from CSS if available
- Infer audience segments from site content and discovery notes
- Build realistic approval chains based on the customer's industry and size
- Include industry-specific legal/compliance rules
- Set entitlement statuses based on what the customer actually has (from discovery notes)
- The systemPromptExtras should be rich — include everything an AI agent would need to know to sound like an insider
- If information is missing, make informed inferences based on the industry and company size
- orgId should be a reasonable GitHub org slug
- repo should be a reasonable EDS repo name`;

export function buildProfilePrompt(discoveryNotes, siteData) {
  const parts = [PROFILE_GENERATION_PROMPT];

  if (discoveryNotes) {
    parts.push(`\n\n## Discovery Call Notes\n${discoveryNotes}`);
  }

  if (siteData) {
    parts.push(`\n\n## Website Analysis\n${siteData}`);
  }

  return parts.join('');
}
