// Minimal Twenty API client: REST for records, GraphQL for data (/graphql) and metadata (/metadata).
// Node 20+ (global fetch). Auth is an API key created in Twenty → Settings → API & Webhooks.

export class TwentyClient {
  constructor({ url, apiKey, verbose = false }) {
    if (!url || !apiKey) throw new Error('TWENTY_URL and TWENTY_API_KEY are required');
    this.url = url.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.verbose = verbose;
  }

  async request(path, { method = 'GET', body, headers = {} } = {}) {
    const res = await fetch(this.url + path, {
      method,
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let json;
    try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
    if (this.verbose) console.log(`${method} ${path} → ${res.status}`);
    if (!res.ok) {
      const err = new Error(`${method} ${path} failed (${res.status}): ${text.slice(0, 600)}`);
      err.status = res.status; err.body = json;
      throw err;
    }
    return json;
  }

  // ---- GraphQL ----
  async gql(query, variables = {}, endpoint = '/graphql') {
    const json = await this.request(endpoint, { method: 'POST', body: { query, variables } });
    if (json.errors && json.errors.length) {
      const err = new Error(`GraphQL ${endpoint} error: ${json.errors.map((e) => e.message).join('; ')}`);
      err.errors = json.errors; err.data = json.data;
      throw err;
    }
    return json.data;
  }
  metadata(query, variables) { return this.gql(query, variables, '/metadata'); }

  // ---- REST records ----
  // Twenty's REST API: GET /rest/{plural}?filter=..&limit=.., POST /rest/{plural}, PATCH /rest/{plural}/{id},
  // POST /rest/batch/{plural} for bulk creation.
  async list(plural, { filter, limit = 60, orderBy, depth = 0 } = {}) {
    const params = new URLSearchParams();
    if (filter) params.set('filter', filter);
    if (orderBy) params.set('order_by', orderBy);
    params.set('limit', String(limit));
    params.set('depth', String(depth));
    const json = await this.request(`/rest/${plural}?${params}`);
    return json.data?.[plural] ?? [];
  }
  async create(plural, data) {
    const json = await this.request(`/rest/${plural}`, { method: 'POST', body: data });
    return json.data ? Object.values(json.data)[0] : json;
  }
  async createMany(plural, records) {
    if (!records.length) return [];
    const json = await this.request(`/rest/batch/${plural}`, { method: 'POST', body: records });
    return json.data ? Object.values(json.data)[0] : json;
  }
  async update(plural, id, data) {
    const json = await this.request(`/rest/${plural}/${id}`, { method: 'PATCH', body: data });
    return json.data ? Object.values(json.data)[0] : json;
  }
  async remove(plural, id) { return this.request(`/rest/${plural}/${id}`, { method: 'DELETE' }); }

  // Find one record by a simple equality filter, e.g. findOne('companies', 'name', 'Acme').
  async findOne(plural, field, value) {
    const rows = await this.list(plural, { filter: `${field}[eq]:"${String(value).replace(/"/g, '\\"')}"`, limit: 1 });
    return rows[0] ?? null;
  }
  // Create the record if no record matches (field == value); otherwise update it. Returns the record.
  async upsert(plural, field, value, data) {
    const existing = await this.findOne(plural, field, value);
    if (existing) return { record: await this.update(plural, existing.id, data), created: false };
    return { record: await this.create(plural, data), created: true };
  }
}

export function env(name, fallback) {
  const v = process.env[name];
  if (v === undefined || v === '') { if (fallback !== undefined) return fallback; throw new Error(`Missing env ${name}`); }
  return v;
}

export function log(kind, msg) {
  const tag = { create: '+', update: '~', skip: '=', info: '·', warn: '!', error: 'x' }[kind] || '·';
  console.log(`${tag} ${msg}`);
}
