/* Holography CRM — a Lightfield-style CRM, single-file vanilla JS.
   State lives in localStorage; seed data comes from data.js. */
(function () {
  'use strict';

  const STORAGE_KEY = 'holography.crm.v1';
  const MIN = 60 * 1000, HOUR = 60 * MIN, DAY = 24 * HOUR;

  const STAGES = ['Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
  const LEAD_STATUSES = ['New', 'MQL', 'SQL', 'Nurture', 'Converted', 'Disqualified'];
  const SEGMENTS = ['SMB', 'Mid-market', 'Enterprise'];
  const TRIGGERS = ['Webhook received', 'Meeting updated', 'Contact created', 'Account created', 'Opportunity created', 'Opportunity updated', 'Schedule'];
  const SOURCES = ['Cal.com demo', 'LinkedIn form', 'Outbound', 'Referral', 'Inbound', 'YC S26 Demo Day', 'Meeting invite'];
  const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'];
  const FUNDING = ['Bootstrapped', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Public'];

  /* ---------- Icons (inline SVG, 24px viewBox, stroke) ---------- */
  const I = (d, extra) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra || ''}>${d}</svg>`;
  const icons = {
    clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    review: I('<path d="M4 7h16M4 12h16M4 17h10"/><path d="m17 16 2 2 3-3"/>'),
    book: I('<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>'),
    cube: I('<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12 4 7.5M12 12l8-4.5M12 12v9"/>'),
    zap: I('<path d="M13 3 4 14h7l-1 7 9-11h-7z"/>'),
    flow: I('<path d="M5 4h14l-7 8z"/><path d="M12 12v8"/>'),
    users: I('<circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M17 14a6 6 0 0 1 4 6"/>'),
    user: I('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    building: I('<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M16 9h2a2 2 0 0 1 2 2v10"/><path d="M8 7h4M8 11h4M8 15h4M20 21H4"/>'),
    target: I('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'),
    video: I('<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>'),
    chat: I('<path d="M4 5h16v11H9l-5 4z"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>'),
    search: I('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    bell: I('<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>'),
    settings: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    moon: I('<path d="M21 13A8.5 8.5 0 0 1 11 3a8.5 8.5 0 1 0 10 10z"/>'),
    x: I('<path d="M6 6l12 12M18 6 6 18"/>'),
    play: I('<path d="M7 5v14l11-7z"/>'),
    pause: I('<path d="M8 5v14M16 5v14"/>'),
    external: I('<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'),
    dots: I('<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>'),
    status: I('<circle cx="12" cy="12" r="8" stroke-dasharray="3 3"/>'),
    shield: I('<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/>'),
    coin: I('<circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.5 10.5c0-1 1-1.5 2.5-1.5s2.5.5 2.5 1.5-1 1.5-2.5 1.5-2.5.5-2.5 1.5 1 1.5 2.5 1.5 2.5-.5 2.5-1.5"/>'),
    calendar: I('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    mail: I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
    note: I('<path d="M5 4h10l4 4v12H5z"/><path d="M15 4v4h4M8 13h8M8 17h5"/>'),
    check: I('<path d="m5 12 4 4L19 6"/>'),
    dollar: I('<path d="M12 3v18M17 7.5c0-1.5-2-2.5-5-2.5S7 6 7 8s2 2.5 5 3 5 1.5 5 3.5-2 3-5 3-5-1-5-2.5"/>'),
    tag: I('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>'),
    globe: I('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
    list: I('<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/>'),
    star: I('<path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 3 1.1-6.2L3 9.7l6.2-.9z"/>'),
    menu: I('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    send: I('<path d="M4 12 20 4l-4 16-4-7z"/>'),
    sparkle: I('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
    trash: I('<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>'),
    chevron: I('<path d="m9 6 6 6-6 6"/>'),
    grid: I('<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>'),
    columns: I('<rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="16" rx="1"/><rect x="17" y="4" width="4" height="16" rx="1"/>'),
    refresh: I('<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/>'),
    download: I('<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>'),
    link: I('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    warn: I('<path d="M12 3 2 21h20z"/><path d="M12 10v5M12 18h.01"/>'),
  };

  /* ---------- Helpers ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = (p) => p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const fmtMoney = (n) => n == null || isNaN(n) ? '—' : '$' + Math.round(n).toLocaleString('en-US');
  const fmtDate = (ts) => ts ? new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const fmtDateTime = (ts) => ts ? new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';
  const fmtTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const toDateInput = (ts) => ts ? new Date(ts).toISOString().slice(0, 10) : '';
  const toDateTimeInput = (ts) => { if (!ts) return ''; const d = new Date(ts); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
  function timeAgo(ts) {
    if (!ts) return 'Never';
    const d = Date.now() - ts;
    if (d < 0) { const f = -d; return 'in ' + (f < HOUR ? Math.max(1, Math.round(f / MIN)) + 'm' : f < DAY ? Math.round(f / HOUR) + 'h' : Math.round(f / DAY) + 'd'); }
    if (d < MIN) return 'just now';
    if (d < HOUR) return Math.floor(d / MIN) + 'm ago';
    if (d < DAY) return Math.floor(d / HOUR) + 'h ago';
    if (d < 30 * DAY) return Math.floor(d / DAY) + 'd ago';
    return fmtDate(ts);
  }
  function relDue(ts) {
    const d = ts - Date.now();
    const abs = Math.abs(d);
    let s;
    if (abs < HOUR) s = Math.max(1, Math.round(abs / MIN)) + 'm';
    else if (abs < DAY) s = Math.round(abs / HOUR) + 'h';
    else s = Math.round(abs / DAY) + 'd';
    return d < 0 ? s + ' overdue' : 'in ' + s;
  }
  const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
  const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  const avatarHtml = (name, cls) => `<span class="avatar ${cls || ''}" title="${esc(name)}">${esc(initials(name || '?'))}</span>`;
  const isPersonalEmail = (e) => /@(gmail|yahoo|hotmail|outlook|icloud|proton|aol)\./i.test(e || '');
  const domainOf = (email) => ((email || '').split('@')[1] || '').toLowerCase();

  function toast(msg) {
    const host = $('#toasts');
    while (host.children.length >= 3) host.firstChild.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  /* ---------- State ---------- */
  let S = null;
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 1) return parsed;
      }
    } catch (e) { /* fall through to seed */ }
    return window.LF_SEED(Date.now());
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch (e) { /* storage may be unavailable */ }
  }
  function resetAll() {
    S = window.LF_SEED(Date.now());
    S.settings.onboarded = true;
    save();
  }
  const byId = (coll, id) => (S[coll] || []).find((x) => x.id === id) || null;
  const me = () => byId('users', S.settings.userId) || S.users[0];
  const userName = (id) => { const u = byId('users', id); return u ? u.name : '—'; };
  const companyName = (id) => { const c = byId('companies', id); return c ? c.name : '—'; };
  const contactsOf = (companyId) => S.contacts.filter((c) => c.companyId === companyId);
  const oppsOf = (companyId) => S.opportunities.filter((o) => o.companyId === companyId);
  const meetingsOf = (companyId) => S.meetings.filter((m) => m.companyId === companyId).sort((a, b) => b.startsAt - a.startsAt);
  const pendingReviews = () => S.reviews.filter((r) => r.status === 'pending');
  const openOpps = () => S.opportunities.filter((o) => o.stage !== 'Won' && o.stage !== 'Lost');

  function logActivity(entry) {
    S.activity.unshift({ id: uid('ac'), ts: Date.now(), authorId: S.settings.userId, ...entry });
    if (S.activity.length > 500) S.activity.length = 500;
  }

  /* ---------- Router ---------- */
  function parseRoute() {
    const h = (location.hash || '#/up-next').replace(/^#\/?/, '');
    const parts = h.split('/').filter(Boolean).map(decodeURIComponent);
    return { page: parts[0] || 'up-next', id: parts[1] || null, sub: parts[2] || null };
  }
  const go = (path) => { location.hash = path; };
  let route = parseRoute();
  const ui = { search: {}, sort: {}, tab: {}, sidebarOpen: false, chatDraft: '' };

  window.addEventListener('hashchange', () => { route = parseRoute(); ui.sidebarOpen = false; render(); });

  /* ---------- Sidebar ---------- */
  function navItem(href, icon, label, opts) {
    opts = opts || {};
    const active = opts.active != null ? opts.active : ('#/' + route.page) === href.split('/').slice(0, 2).join('/');
    return `<a class="nav-item ${active ? 'active' : ''}" href="${href}">${icon}<span class="label">${esc(label)}</span>${opts.count ? `<span class="count">${opts.count}</span>` : ''}${opts.dot ? '<span class="dot"></span>' : ''}</a>`;
  }
  function renderSidebar() {
    const user = me();
    const reviewCount = pendingReviews().length;
    const chats = S.chats.slice().sort((a, b) => b.createdAt - a.createdAt);
    const shownChats = ui.allChats ? chats : chats.slice(0, 5);
    const fav = S.lists.filter((l) => l.section === 'favorites');
    const demand = S.lists.filter((l) => l.section === 'demand');
    const isTheme = S.settings.theme;
    return `
      <div class="ws-header">
        <div class="ws-name">${avatarHtml(user.name, 'sq')}<span>${esc(user.name)}</span></div>
        <button class="icon-btn" data-action="open-search" title="Search (⌘K)">${icons.search}</button>
        <button class="icon-btn" data-action="open-notifications" title="Notifications">${icons.bell}</button>
      </div>
      <div class="nav">
        ${navItem('#/up-next', icons.clock, 'Up next')}
        ${navItem('#/review', icons.review, 'For review', { count: reviewCount || '' })}
        ${navItem('#/knowledge', icons.book, 'Knowledge')}
        ${navItem('#/skills', icons.cube, 'Skills')}
        ${navItem('#/automations', icons.flow, 'Automations')}
        <div class="nav-section">
          <div class="nav-section-title"><span>Records</span></div>
          ${navItem('#/contacts', icons.user, 'Contacts')}
          ${navItem('#/companies', icons.building, 'Companies')}
          ${navItem('#/opportunities', icons.target, 'Opportunities')}
          ${navItem('#/meetings', icons.video, 'Meetings')}
        </div>
        <div class="nav-section">
          <div class="nav-section-title"><span>Favorites</span><button class="icon-btn" data-action="new-list" data-section="favorites" title="New list">${icons.plus}</button></div>
          ${fav.map((l) => navItem('#/lists/' + l.id, l.objectType === 'company' ? icons.target : icons.list, l.name, { active: route.page === 'lists' && route.id === l.id })).join('')}
        </div>
        <div class="nav-section">
          <div class="nav-section-title"><span>Chats</span></div>
          ${navItem('#/chat/new', icons.plus, 'New chat', { active: route.page === 'chat' && route.id === 'new' })}
          ${shownChats.map((c) => navItem('#/chat/' + c.id, icons.chat, c.title, { active: route.page === 'chat' && route.id === c.id, dot: c.unread })).join('')}
          ${chats.length > 5 ? `<a class="nav-item" data-action="toggle-chats" href="#" >${icons.dots}<span class="label">${ui.allChats ? 'Less' : 'More'}</span></a>` : ''}
        </div>
        <div class="nav-section">
          <div class="nav-section-title"><span>Demand</span><button class="icon-btn" data-action="new-list" data-section="demand" title="New list">${icons.plus}</button></div>
          ${demand.map((l) => navItem('#/lists/' + l.id, l.objectType === 'company' ? icons.target : icons.list, l.name, { active: route.page === 'lists' && route.id === l.id })).join('')}
        </div>
      </div>
      <div class="sidebar-footer">
        <button class="help-btn" data-action="help" title="Help">?</button>
        <span class="spacer"></span>
        <button class="icon-btn" data-action="toggle-theme" title="Toggle theme">${isTheme === 'dark' ? icons.sun : icons.moon}</button>
        <a class="icon-btn ${route.page === 'settings' ? 'active' : ''}" href="#/settings" title="Settings">${icons.settings}</a>
      </div>`;
  }

  /* ---------- Generic table ---------- */
  function searchable(row, cols) {
    return cols.map((c) => (c.text ? c.text(row) : (row[c.key] == null ? '' : String(row[c.key])))).join(' ').toLowerCase();
  }
  function table(opts) {
    const q = (ui.search[opts.key] || '').toLowerCase().trim();
    let rows = opts.rows.slice();
    if (q) rows = rows.filter((r) => searchable(r, opts.columns).includes(q));
    const sort = ui.sort[opts.key] || opts.defaultSort;
    if (sort && sort.key) {
      const col = opts.columns.find((c) => c.key === sort.key);
      const val = (r) => (col && col.sortValue ? col.sortValue(r) : (col && col.text ? col.text(r) : r[sort.key]));
      rows.sort((a, b) => {
        const va = val(a), vb = val(b);
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * sort.dir;
        return String(va).localeCompare(String(vb)) * sort.dir;
      });
    }
    const head = opts.columns.map((c) => `<th data-action="sort" data-table="${opts.key}" data-col="${c.key}">${c.icon || ''}${esc(c.label)}${sort && sort.key === c.key ? `<span class="sort">${sort.dir > 0 ? '▲' : '▼'}</span>` : ''}</th>`).join('');
    const body = rows.length ? rows.map((r) => `<tr data-href="${opts.rowHref(r)}" class="${opts.selectedId === r.id ? 'selected' : ''}">${opts.columns.map((c) => `<td class="${c.cls || ''}">${c.render ? c.render(r) : esc(r[c.key])}</td>`).join('')}</tr>`).join('')
      : `<tr><td colspan="${opts.columns.length}"><div class="empty">${esc(opts.empty || 'Nothing here yet.')}</div></td></tr>`;
    return `
      <div class="table-toolbar">
        <div class="search-wrap">${icons.search}<input class="search-input" placeholder="Search ${esc(opts.noun || '')}…" data-search="${opts.key}" value="${esc(ui.search[opts.key] || '')}"></div>
        <span class="count">${rows.length} ${rows.length === 1 ? (opts.nounSingular || 'record') : (opts.noun || 'records')}</span>
        <span class="spacer"></span>
        ${opts.toolbar || ''}
      </div>
      <div class="table-wrap"><table class="grid"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }
  const selectHtml = (coll, id, field, value, options, cls) =>
    `<select class="${cls || 'inline'}" data-edit="${coll}:${id}:${field}">${options.map((o) => `<option value="${esc(o)}" ${o === value ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  const ownerSelect = (coll, id, value, cls) =>
    `<select class="${cls || 'inline'}" data-edit="${coll}:${id}:owner">${S.users.map((u) => `<option value="${u.id}" ${u.id === value ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select>`;
  const textEdit = (coll, id, field, value, type, cls) =>
    `<input class="${cls || 'inline'}" type="${type || 'text'}" data-edit="${coll}:${id}:${field}" value="${esc(value == null ? '' : value)}">`;
  const stageChip = (stage) => {
    const cls = { Discovery: 'gray', Qualified: 'blue', Proposal: 'purple', Negotiation: 'amber', Won: 'green', Lost: 'red' }[stage] || 'gray';
    return `<span class="chip ${cls}">${esc(stage)}</span>`;
  };
  const leadChip = (st) => {
    const cls = { New: 'gray', MQL: 'blue', SQL: 'purple', Nurture: 'amber', Converted: 'green', Disqualified: 'red' }[st] || 'gray';
    return `<span class="chip ${cls}">${esc(st)}</span>`;
  };
  const statusChip = (s) => `<span class="chip ${s === 'Active' ? 'green' : 'gray'}">${esc(s)}</span>`;

  /* ---------- Topbar ---------- */
  function topbar(crumb, actions) {
    return `<div class="topbar">
      <button class="icon-btn menu-btn" data-action="toggle-sidebar">${icons.menu}</button>
      <div class="crumb">${crumb}</div>
      <span class="spacer"></span>
      <div class="actions">${actions || ''}</div>
    </div>`;
  }
  const crumb = (icon, label, sub) => `${icon}<span>${esc(label)}</span>${sub ? `<span class="sep">/</span><span class="truncate">${esc(sub)}</span>` : ''}`;
  const createInChat = () => `<a class="btn" href="#/chat/new">${icons.plus} Create in chat</a>`;

  /* ---------- Pages ---------- */
  function pageUpNext() {
    const user = me();
    const now = Date.now();
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const upcoming = S.meetings.filter((m) => m.startsAt >= now - 30 * MIN).sort((a, b) => a.startsAt - b.startsAt).slice(0, 6);
    const tasks = S.tasks.filter((t) => !t.done).sort((a, b) => a.due - b.due);
    const open = openOpps();
    const pipeline = open.reduce((s, o) => s + (o.amount || 0), 0);
    const wonThisMonth = S.opportunities.filter((o) => o.stage === 'Won' && new Date(o.closeDate).getMonth() === new Date().getMonth()).reduce((s, o) => s + o.amount, 0);
    const recent = S.meetings.filter((m) => m.status === 'processed').sort((a, b) => b.startsAt - a.startsAt).slice(0, 4);
    const stale = open.filter((o) => !o.nextStep);
    return topbar(crumb(icons.clock, 'Up next'), createInChat()) + `
      <div class="content"><div class="content-inner">
        <div class="greeting">${greet}, ${esc(user.name.split(' ')[0])}.</div>
        <div class="muted">${upcoming.filter((m) => sameDay(m.startsAt, now)).length} meetings today · ${tasks.filter((t) => t.due < now + DAY).length} tasks due · ${pendingReviews().length} updates waiting for review</div>
        <div class="kpis">
          <div class="stat"><div class="n">${fmtMoney(pipeline)}</div><div class="l">Open pipeline · ${open.length} deals</div></div>
          <div class="stat"><div class="n">${fmtMoney(wonThisMonth)}</div><div class="l">Won this month</div></div>
          <div class="stat"><div class="n">${S.contacts.filter((c) => c.leadStatus === 'SQL').length}</div><div class="l">SQL contacts</div></div>
          <div class="stat"><div class="n">${S.automations.reduce((s, a) => s + a.runs, 0).toLocaleString()}</div><div class="l">Automation runs</div></div>
        </div>
        <div class="home-grid">
          <div>
            <div class="card">
              <h3>Meetings <a class="btn ghost sm" href="#/meetings">All meetings</a></h3>
              <div class="list">
                ${upcoming.length ? upcoming.map((m) => `<a class="list-row link" href="#/meetings/${m.id}">${icons.video}<span class="grow"><span>${esc(m.title)}</span><br><span class="sub">${sameDay(m.startsAt, now) ? 'Today' : fmtDate(m.startsAt)} · ${fmtTime(m.startsAt)} · ${m.durationMin} min</span></span>${m.external ? '<span class="chip outline">External</span>' : '<span class="chip gray">Internal</span>'}${willRecord(m) ? `<span class="chip red">● Rec</span>` : ''}</a>`).join('') : '<div class="empty">No upcoming meetings.</div>'}
              </div>
            </div>
            <div class="card">
              <h3>Recent calls</h3>
              <div class="list">
                ${recent.map((m) => `<a class="list-row link" href="#/meetings/${m.id}">${icons.sparkle}<span class="grow"><span>${esc(m.title)}</span><br><span class="sub">${timeAgo(m.startsAt)} · ${m.followups.length} follow-ups</span></span></a>`).join('') || '<div class="empty">No processed calls yet.</div>'}
              </div>
            </div>
          </div>
          <div>
            <div class="card">
              <h3>Tasks <button class="btn ghost sm" data-action="new-task">${icons.plus} Add</button></h3>
              <div class="list">
                ${tasks.length ? tasks.map(taskRow).join('') : '<div class="empty">All caught up.</div>'}
              </div>
            </div>
            <div class="card">
              <h3>Needs attention</h3>
              <div class="list">
                ${pendingReviews().length ? `<a class="list-row link" href="#/review">${icons.review}<span class="grow">${pendingReviews().length} proposed updates waiting for review</span><span class="badge">${pendingReviews().length}</span></a>` : ''}
                ${stale.map((o) => `<a class="list-row link" href="#/opportunities/${o.id}">${icons.warn}<span class="grow">${esc(o.name)} has no next step</span><span class="sub">${fmtMoney(o.amount)}</span></a>`).join('')}
                ${S.automations.filter((a) => a.lastFailed && a.lastFailed > now - 2 * DAY).map((a) => `<a class="list-row link" href="#/automations/${a.id}">${icons.flow}<span class="grow">${esc(a.name)} failed ${timeAgo(a.lastFailed)}</span></a>`).join('')}
                ${!pendingReviews().length && !stale.length ? '<div class="empty">Nothing needs attention.</div>' : ''}
              </div>
            </div>
          </div>
        </div>
      </div></div>`;
  }
  function willRecord(m) {
    if (m.recorded) return true;
    if (m.status !== 'upcoming') return false;
    if (m.recordOverride != null) return m.recordOverride;
    const pref = S.settings.recording;
    return pref === 'all' || (pref === 'external' && m.external);
  }
  function taskRow(t) {
    const over = !t.done && t.due < Date.now();
    const rel = t.objectType && t.objectId ? `<a class="sub" href="#/${t.objectType === 'company' ? 'companies' : t.objectType === 'contact' ? 'contacts' : 'opportunities'}/${t.objectId}">${esc(relatedName(t.objectType, t.objectId))}</a>` : '';
    return `<label class="task ${t.done ? 'done' : ''}"><input type="checkbox" data-action="toggle-task" data-id="${t.id}" ${t.done ? 'checked' : ''}><span class="t">${esc(t.title)}</span>${rel}<span class="due ${over ? 'over' : ''}">${relDue(t.due)}</span></label>`;
  }
  function relatedName(type, id) {
    if (type === 'company') return companyName(id);
    if (type === 'contact') { const c = byId('contacts', id); return c ? c.name : '—'; }
    if (type === 'opportunity') { const o = byId('opportunities', id); return o ? o.name : '—'; }
    return '—';
  }

  function pageReview() {
    const items = pendingReviews().sort((a, b) => b.createdAt - a.createdAt);
    const done = S.reviews.filter((r) => r.status !== 'pending').sort((a, b) => (b.resolvedAt || 0) - (a.resolvedAt || 0)).slice(0, 8);
    return topbar(crumb(icons.review, 'For review'), `${items.length ? `<button class="btn" data-action="approve-all">${icons.check} Approve all (${items.length})</button>` : ''}`) + `
      <div class="content"><div class="content-inner narrow">
        <p class="muted" style="margin-bottom:16px">Updates proposed from your calls and automations. Approve to apply them to your records, or dismiss.</p>
        ${items.length ? items.map(reviewItem).join('') : '<div class="empty">Nothing to review. Updates will show up here after calls are processed.</div>'}
        ${done.length ? `<div class="section" style="margin-top:32px"><div class="section-title">Recently resolved</div><div class="list">${done.map((r) => `<div class="list-row">${r.status === 'approved' ? icons.check : icons.x}<span class="grow">${esc(r.title)}</span><span class="sub">${r.status} · ${timeAgo(r.resolvedAt)}</span></div>`).join('')}</div></div>` : ''}
      </div></div>`;
  }
  function reviewItem(r) {
    const typeChip = r.type === 'email_draft' ? '<span class="chip purple">Email draft</span>' : r.type === 'new_contact' ? '<span class="chip blue">New contact</span>' : '<span class="chip amber">Field update</span>';
    const link = r.objectId ? `<a class="chip outline" href="#/${r.objectType === 'company' ? 'companies' : r.objectType === 'contact' ? 'contacts' : 'opportunities'}/${r.objectId}">${esc(relatedName(r.objectType, r.objectId))}</a>` : (r.payload ? `<span class="chip outline">${esc(companyName(r.payload.companyId))}</span>` : '');
    const src = r.sourceMeetingId ? `<a class="sub" href="#/meetings/${r.sourceMeetingId}">From: ${esc((byId('meetings', r.sourceMeetingId) || {}).title || 'meeting')}</a>` : '';
    let body = '';
    if (r.type === 'field_update') {
      const fmt = (v) => (r.field === 'closeDate' ? fmtDate(v) : v == null || v === '' ? '(empty)' : String(v));
      body = `<div class="diff"><span class="chip gray">${esc(fieldLabel(r.field))}</span><span class="from">${esc(fmt(r.from))}</span><span class="faint">→</span><span class="to">${esc(fmt(r.to))}</span></div>`;
    } else if (r.type === 'email_draft') {
      body = `<textarea class="draft" data-edit="reviews:${r.id}:draft">${esc(r.draft)}</textarea>`;
    } else if (r.type === 'new_contact') {
      const p = r.payload;
      body = `<div class="diff"><span class="to">${esc(p.name)}</span><span class="faint">·</span><span>${esc(p.title)}</span><span class="faint">·</span><span class="muted">${esc(p.email)}</span></div>`;
    }
    return `<div class="review-item">
      <div class="rh">${typeChip}<span class="t">${esc(r.title)}</span>${link}</div>
      ${body}
      <div class="reason">${esc(r.reason)}</div>
      <div class="ra">${src}<span class="spacer"></span><button class="btn ghost" data-action="review-dismiss" data-id="${r.id}">Dismiss</button><button class="btn primary" data-action="review-approve" data-id="${r.id}">${r.type === 'email_draft' ? 'Approve & send' : 'Approve'}</button></div>
    </div>`;
  }
  const fieldLabel = (f) => ({ stage: 'Stage', leadStatus: 'Lead status', closeDate: 'Close date', nextStep: 'Next step', title: 'Title', source: 'Source', industry: 'Industry', segment: 'Segment', amount: 'Amount' }[f] || f);

  function pageKnowledge() {
    const items = S.knowledge.slice().sort((a, b) => b.updatedAt - a.updatedAt);
    const sel = route.id ? byId('knowledge', route.id) : null;
    return topbar(crumb(icons.book, 'Knowledge'), `<button class="btn" data-action="new-knowledge">${icons.plus} New note</button>`) + `
      <div class="content"><div class="content-inner">
        <p class="muted" style="margin-bottom:16px">What the assistant knows about your business. Automations and chat use these notes when drafting emails and proposing updates.</p>
        <div class="record-grid" style="grid-template-columns: 300px 1fr">
          <div class="list">${items.map((k) => `<a class="list-row link ${sel && sel.id === k.id ? 'selected' : ''}" href="#/knowledge/${k.id}" style="${sel && sel.id === k.id ? 'background:var(--bg-active)' : ''}">${icons.note}<span class="grow"><span>${esc(k.title)}</span><br><span class="sub">${timeAgo(k.updatedAt)}${k.tags && k.tags.length ? ' · ' + k.tags.join(', ') : ''}</span></span></a>`).join('')}</div>
          <div>${sel ? `<div class="card">
              <h3><input class="inline" style="font-size:15px;font-weight:600;width:100%;background:transparent;border:1px solid transparent;border-radius:5px;padding:2px 6px;margin-left:-6px" data-edit="knowledge:${sel.id}:title" value="${esc(sel.title)}"><button class="btn ghost sm danger" data-action="delete-knowledge" data-id="${sel.id}">${icons.trash}</button></h3>
              <textarea class="draft" style="width:100%;min-height:260px;resize:vertical;padding:10px 12px;border-radius:6px;border:1px solid var(--border);background:var(--bg);font-family:var(--font);color:var(--text)" data-edit="knowledge:${sel.id}:body">${esc(sel.body)}</textarea>
              <div class="faint" style="margin-top:8px">Last updated ${timeAgo(sel.updatedAt)}. Changes save automatically.</div>
            </div>` : '<div class="empty">Select a note to read or edit it.</div>'}</div>
        </div>
      </div></div>`;
  }

  function pageSkills() {
    return topbar(crumb(icons.cube, 'Skills'), `<button class="btn" data-action="new-skill">${icons.plus} New skill</button>`) + `
      <div class="content"><div class="content-inner">
        <p class="muted" style="margin-bottom:16px">Reusable capabilities the assistant can run from chat or inside automations.</p>
        <div class="list">
          ${S.skills.map((s) => `<div class="list-row" style="padding:12px 10px;border:1px solid var(--border);border-radius:8px;margin-bottom:6px">${icons.cube}<span class="grow" style="white-space:normal"><span style="font-weight:500">${esc(s.name)}</span><br><span class="sub">${esc(s.description)}</span></span><span class="sub nowrap">${s.uses} uses</span><button class="switch ${s.enabled ? 'on' : ''}" data-action="toggle-skill" data-id="${s.id}" title="${s.enabled ? 'Enabled' : 'Disabled'}"></button></div>`).join('')}
        </div>
      </div></div>`;
  }

  /* ---------- Automations ---------- */
  function pageAutomations() {
    const sel = route.id ? byId('automations', route.id) : null;
    const cols = [
      { key: 'name', label: 'Name', icon: icons.flow, cls: 'name', render: (a) => `${icons.flow}${esc(a.name)}` },
      { key: 'status', label: 'Status', icon: icons.status, render: (a) => statusChip(a.status) },
      { key: 'trigger', label: 'Triggers', icon: icons.zap, render: (a) => `${esc(a.trigger)}${a.extraTriggers ? ` <span class="chip gray">+${a.extraTriggers}</span>` : ''}` },
      { key: 'lastRun', label: 'Last run', icon: icons.clock, render: (a) => timeAgo(a.lastRun), sortValue: (a) => -(a.lastRun || 0) },
      { key: 'runs', label: 'Runs', render: (a) => a.runs.toLocaleString() },
      { key: 'createdBy', label: 'Created by', icon: icons.user, render: (a) => `${avatarHtml(userName(a.createdBy))}${esc(userName(a.createdBy))}`, text: (a) => userName(a.createdBy) },
    ];
    const list = table({ key: 'automations', noun: 'automations', nounSingular: 'automation', columns: cols, rows: S.automations, rowHref: (a) => '#/automations/' + a.id, selectedId: sel && sel.id, defaultSort: { key: 'lastRun', dir: 1 } });
    return topbar(crumb(icons.flow, 'Automations'), `<button class="btn" data-action="new-automation">${icons.plus} New automation</button>${createInChat()}`) + `
      <div class="content">${list}</div>
      ${sel ? automationPanel(sel) : ''}`;
  }
  function automationPanel(a) {
    const tab = ui.tab['au:' + a.id] || 'overview';
    const fails = a.runLog.filter((r) => r.status === 'failed').length;
    const triggers = [a.trigger].concat(Array.from({ length: a.extraTriggers }, (_, i) => TRIGGERS.filter((t) => t !== a.trigger)[i]));
    return `<div class="panel-backdrop" data-action="close-panel"></div>
    <div class="panel">
      <div class="panel-header">
        <div class="crumb">${icons.flow}<span class="truncate">${esc(a.name)}</span><button class="icon-btn" data-action="automation-menu" data-id="${a.id}">${icons.dots}</button></div>
        <button class="btn ghost sm" data-action="run-automation" data-id="${a.id}">${icons.play} Run now</button>
        <button class="btn ghost sm" data-action="toggle-automation" data-id="${a.id}">${a.status === 'Active' ? icons.pause + ' Pause' : icons.play + ' Resume'}</button>
        <a class="icon-btn" href="#/automations/${a.id}/full" title="Open full page">${icons.external}</a>
        <button class="icon-btn" data-action="close-panel">${icons.x}</button>
      </div>
      <div class="panel-body">${automationBody(a)}</div>
    </div>`;
  }
  function automationBody(a) {
    const tab = ui.tab['au:' + a.id] || 'overview';
    const fails = a.runLog.filter((r) => r.status === 'failed').length;
    const triggers = [a.trigger].concat(Array.from({ length: a.extraTriggers }, (_, i) => TRIGGERS.filter((t) => t !== a.trigger)[i]));
    return `
        <div class="panel-title"><span class="obj-icon">${icons.flow}</span><h2><input class="inline" style="font-size:22px;font-weight:600;background:transparent;border:1px solid transparent;border-radius:5px;padding:2px 6px;margin-left:-6px;width:100%" data-edit="automations:${a.id}:name" value="${esc(a.name)}"></h2></div>
        <div class="meta">
          <div class="k">${icons.status} Status</div><div class="v">${statusChip(a.status)}</div>
          <div class="k">${icons.shield} Run protection</div><div class="v"><button class="switch ${a.runProtection ? 'on' : ''}" data-action="toggle-run-protection" data-id="${a.id}"></button></div>
          <div class="k">${icons.coin} Credits</div><div class="v">${a.credits} per run avg</div>
          <div class="k">${icons.user} Created by</div><div class="v">${avatarHtml(userName(a.createdBy))}${esc(userName(a.createdBy))}</div>
          <div class="k">${icons.calendar} Created</div><div class="v">${fmtDate(a.createdAt)}</div>
        </div>
        <div class="tabs">
          <button class="${tab === 'overview' ? 'active' : ''}" data-action="tab" data-tab="au:${a.id}" data-value="overview">Overview</button>
          <button class="${tab === 'runs' ? 'active' : ''}" data-action="tab" data-tab="au:${a.id}" data-value="runs">Runs</button>
        </div>
        ${tab === 'overview' ? `
          <div class="section"><div class="section-title">Performance</div>
            <div class="stats">
              <div class="stat"><div class="n">${a.runs.toLocaleString()}</div><div class="l">Runs</div></div>
              <div class="stat"><div class="n">${timeAgo(a.lastRun)}</div><div class="l">Last run</div></div>
              <div class="stat"><div class="n">${a.lastFailed ? timeAgo(a.lastFailed) : 'Never'}</div><div class="l">Last failed</div></div>
            </div></div>
          <div class="section"><div class="section-title">Description</div>
            <textarea class="prose" style="width:100%;min-height:120px;resize:vertical;background:transparent;border:1px solid transparent;border-radius:6px;padding:6px 8px;margin-left:-8px;font-family:var(--font)" data-edit="automations:${a.id}:description" onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='transparent'">${esc(a.description)}</textarea></div>
          <div class="section"><div class="section-title">Triggers</div>
            <div class="list">${triggers.map((t) => `<div class="list-row">${icons.zap}<span class="grow">${esc(t)}</span>${t === 'Schedule' ? `<span class="sub">${esc(a.cadence)}</span>` : '<span class="sub">Event</span>'}</div>`).join('')}</div></div>
          <div class="section"><div class="section-title">Steps</div>
            <div class="steps">${a.steps.map((s) => `<div class="step">${esc(s)}</div>`).join('')}</div></div>
        ` : `
          <div class="section"><div class="section-title"><span>Recent runs</span><span>${fails ? `<span class="chip red">${fails} failed</span>` : '<span class="chip green">All passing</span>'}</span></div>
            ${a.runLog.slice().sort((x, y) => y.ts - x.ts).map((r) => `<div class="run-row"><span class="status"><span class="dot-s ${r.status}"></span>${r.status === 'success' ? 'Success' : 'Failed'}</span><span class="muted">${fmtDateTime(r.ts)}${r.note ? ' · ' + esc(r.note) : ''}</span><span class="muted">${(r.durationMs / 1000).toFixed(1)}s</span><span class="muted">${r.credits} cr</span></div>`).join('') || '<div class="empty">No runs yet.</div>'}
          </div>`}`;
  }

  /* ---------- Contacts ---------- */
  function contactColumns() {
    return [
      { key: 'name', label: 'Name', icon: icons.user, cls: 'name', render: (c) => `${avatarHtml(c.name)}${esc(c.name)}` },
      { key: 'email', label: 'Email', icon: icons.mail },
      { key: 'title', label: 'Title', icon: icons.tag },
      { key: 'companyId', label: 'Company', icon: icons.building, render: (c) => esc(companyName(c.companyId)), text: (c) => companyName(c.companyId) },
      { key: 'leadStatus', label: 'Lead status', icon: icons.status, render: (c) => selectHtml('contacts', c.id, 'leadStatus', c.leadStatus, LEAD_STATUSES) },
      { key: 'owner', label: 'Owner', icon: icons.user, render: (c) => ownerSelect('contacts', c.id, c.owner), text: (c) => userName(c.owner) },
      { key: 'source', label: 'Source', icon: icons.globe },
      { key: 'createdAt', label: 'Created', icon: icons.calendar, render: (c) => timeAgo(c.createdAt), sortValue: (c) => -c.createdAt },
    ];
  }
  function pageContacts() {
    if (route.id) return pageContact(byId('contacts', route.id));
    return topbar(crumb(icons.user, 'Contacts'), `<button class="btn" data-action="new-contact">${icons.plus} New contact</button>${createInChat()}`) +
      `<div class="content">${table({ key: 'contacts', noun: 'contacts', nounSingular: 'contact', columns: contactColumns(), rows: S.contacts, rowHref: (c) => '#/contacts/' + c.id, defaultSort: { key: 'createdAt', dir: 1 } })}</div>`;
  }
  function pageContact(c) {
    if (!c) return notFound('Contact');
    const co = byId('companies', c.companyId);
    const mts = S.meetings.filter((m) => m.attendeeIds.includes(c.id)).sort((a, b) => b.startsAt - a.startsAt);
    const opps = co ? oppsOf(co.id) : [];
    return topbar(crumb(icons.user, 'Contacts', c.name), `<button class="btn" data-action="draft-intro" data-id="${c.id}">${icons.sparkle} Draft email</button><button class="btn ghost danger" data-action="delete-record" data-coll="contacts" data-id="${c.id}">${icons.trash}</button>`) + `
      <div class="content"><div class="content-inner">
        <div class="record-header">${avatarHtml(c.name, 'lg')}<div><h1>${esc(c.name)}</h1><div class="sub">${esc(c.title || '')}${co ? ` at <a href="#/companies/${co.id}">${esc(co.name)}</a>` : ''}</div></div></div>
        <div class="record-grid">
          <div>
            <div class="card"><h3>Details</h3>
              <div class="meta" style="grid-template-columns:110px 1fr;margin-bottom:0">
                <div class="k">Email</div><div class="v">${textEdit('contacts', c.id, 'email', c.email)}</div>
                <div class="k">Title</div><div class="v">${textEdit('contacts', c.id, 'title', c.title)}</div>
                <div class="k">Phone</div><div class="v">${textEdit('contacts', c.id, 'phone', c.phone)}</div>
                <div class="k">Company</div><div class="v"><select data-edit="contacts:${c.id}:companyId"><option value="">—</option>${S.companies.map((x) => `<option value="${x.id}" ${x.id === c.companyId ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
                <div class="k">Lead status</div><div class="v">${selectHtml('contacts', c.id, 'leadStatus', c.leadStatus, LEAD_STATUSES, '')}</div>
                <div class="k">Owner</div><div class="v">${ownerSelect('contacts', c.id, c.owner, '')}</div>
                <div class="k">Source</div><div class="v">${selectHtml('contacts', c.id, 'source', c.source, SOURCES.concat(SOURCES.includes(c.source) ? [] : [c.source]), '')}</div>
                <div class="k">Created</div><div class="v muted">${fmtDate(c.createdAt)}</div>
              </div>
            </div>
            <div class="card"><h3>Opportunities</h3><div class="list">${opps.length ? opps.map((o) => `<a class="list-row link" href="#/opportunities/${o.id}">${icons.target}<span class="grow">${esc(o.name)}</span>${stageChip(o.stage)}</a>`).join('') : '<div class="faint">None</div>'}</div></div>
          </div>
          <div>
            <div class="card"><h3>Meetings</h3><div class="list">${mts.length ? mts.map((m) => `<a class="list-row link" href="#/meetings/${m.id}">${icons.video}<span class="grow">${esc(m.title)}</span><span class="sub">${fmtDate(m.startsAt)}</span></a>`).join('') : '<div class="faint">No meetings with this contact yet.</div>'}</div></div>
            ${activityCard('contact', c.id)}
          </div>
        </div>
      </div></div>`;
  }
  function activityCard(type, id) {
    const notes = S.notes.filter((n) => n.objectType === type && n.objectId === id);
    const acts = S.activity.filter((a) => a.objectType === type && a.objectId === id);
    const items = notes.map((n) => ({ ts: n.createdAt, icon: icons.note, title: userName(n.authorId) + ' added a note', text: n.text }))
      .concat(acts.map((a) => ({ ts: a.ts, icon: icons.refresh, title: a.title, text: a.text || '' })))
      .sort((a, b) => b.ts - a.ts);
    return `<div class="card"><h3>Activity</h3>
      <form class="note-form" data-form="add-note" data-type="${type}" data-id="${id}"><textarea name="text" placeholder="Add a note…" required></textarea><button class="btn primary" type="submit">Add</button></form>
      <div class="timeline" style="margin-top:14px">${items.length ? items.map((i) => `<div class="tl-item"><span class="tl-icon">${i.icon}</span><div class="tl-body"><div class="tl-title">${esc(i.title)}</div><div class="tl-sub">${timeAgo(i.ts)}</div>${i.text ? `<div class="tl-text">${esc(i.text)}</div>` : ''}</div></div>`).join('') : '<div class="faint">No activity yet.</div>'}</div></div>`;
  }

  /* ---------- Companies ---------- */
  function companyColumns() {
    return [
      { key: 'name', label: 'Name', icon: icons.building, cls: 'name', render: (c) => `${icons.building}${esc(c.name)}` },
      { key: 'domain', label: 'Domain', icon: icons.globe },
      { key: 'industry', label: 'Industry', icon: icons.tag },
      { key: 'segment', label: 'Segment', icon: icons.grid, render: (c) => selectHtml('companies', c.id, 'segment', c.segment, SEGMENTS) },
      { key: 'size', label: 'Size', icon: icons.users },
      { key: 'funding', label: 'Funding', icon: icons.dollar },
      { key: 'arr', label: 'ARR', icon: icons.coin, render: (c) => fmtMoney(c.arr) },
      { key: 'owner', label: 'Owner', icon: icons.user, render: (c) => ownerSelect('companies', c.id, c.owner), text: (c) => userName(c.owner) },
      { key: 'contacts', label: 'Contacts', render: (c) => contactsOf(c.id).length, sortValue: (c) => contactsOf(c.id).length },
      { key: 'createdAt', label: 'Created', icon: icons.calendar, render: (c) => timeAgo(c.createdAt), sortValue: (c) => -c.createdAt },
    ];
  }
  function pageCompanies() {
    if (route.id) return pageCompany(byId('companies', route.id));
    return topbar(crumb(icons.building, 'Companies'), `<button class="btn" data-action="new-company">${icons.plus} New company</button>${createInChat()}`) +
      `<div class="content">${table({ key: 'companies', noun: 'companies', nounSingular: 'company', columns: companyColumns(), rows: S.companies, rowHref: (c) => '#/companies/' + c.id, defaultSort: { key: 'createdAt', dir: 1 } })}</div>`;
  }
  function pageCompany(co) {
    if (!co) return notFound('Company');
    const cts = contactsOf(co.id), opps = oppsOf(co.id), mts = meetingsOf(co.id);
    const research = S.knowledge.filter((k) => k.companyId === co.id);
    return topbar(crumb(icons.building, 'Companies', co.name), `<button class="btn" data-action="research-company" data-id="${co.id}">${icons.sparkle} Research</button><button class="btn" data-action="new-opportunity" data-company="${co.id}">${icons.plus} Opportunity</button><button class="btn ghost danger" data-action="delete-record" data-coll="companies" data-id="${co.id}">${icons.trash}</button>`) + `
      <div class="content"><div class="content-inner">
        <div class="record-header"><span class="obj-icon" style="width:40px;height:40px;border:1px solid var(--border);border-radius:8px;display:inline-flex;align-items:center;justify-content:center">${icons.building}</span><div><h1>${esc(co.name)}</h1><div class="sub"><a href="https://${esc(co.domain)}" target="_blank" rel="noopener">${esc(co.domain)}</a> · ${esc(co.industry)}</div></div></div>
        <div class="record-grid">
          <div>
            <div class="card"><h3>Details</h3>
              <div class="meta" style="grid-template-columns:110px 1fr;margin-bottom:0">
                <div class="k">Domain</div><div class="v">${textEdit('companies', co.id, 'domain', co.domain)}</div>
                <div class="k">Industry</div><div class="v">${textEdit('companies', co.id, 'industry', co.industry)}</div>
                <div class="k">Segment</div><div class="v">${selectHtml('companies', co.id, 'segment', co.segment, SEGMENTS, '')}</div>
                <div class="k">Size</div><div class="v">${selectHtml('companies', co.id, 'size', co.size, SIZES, '')}</div>
                <div class="k">Funding</div><div class="v">${selectHtml('companies', co.id, 'funding', co.funding, FUNDING, '')}</div>
                <div class="k">ARR</div><div class="v">${textEdit('companies', co.id, 'arr', co.arr, 'number')}</div>
                <div class="k">Owner</div><div class="v">${ownerSelect('companies', co.id, co.owner, '')}</div>
                <div class="k">Source</div><div class="v">${textEdit('companies', co.id, 'source', co.source)}</div>
                <div class="k">Created</div><div class="v muted">${fmtDate(co.createdAt)}</div>
              </div>
            </div>
            <div class="card"><h3>Contacts <button class="btn ghost sm" data-action="new-contact" data-company="${co.id}">${icons.plus}</button></h3><div class="list">${cts.length ? cts.map((c) => `<a class="list-row link" href="#/contacts/${c.id}">${avatarHtml(c.name)}<span class="grow">${esc(c.name)}<br><span class="sub">${esc(c.title)}</span></span>${leadChip(c.leadStatus)}</a>`).join('') : '<div class="faint">No contacts yet.</div>'}</div></div>
            ${research.length ? `<div class="card"><h3>Research</h3>${research.map((k) => `<div class="prose" style="font-size:12.5px">${esc(k.body)}</div>`).join('<hr style="border:0;border-top:1px solid var(--border);margin:10px 0">')}</div>` : ''}
          </div>
          <div>
            <div class="card"><h3>Opportunities</h3><div class="list">${opps.length ? opps.map((o) => `<a class="list-row link" href="#/opportunities/${o.id}">${icons.target}<span class="grow">${esc(o.name)}</span><span class="sub">${fmtMoney(o.amount)}</span>${stageChip(o.stage)}</a>`).join('') : '<div class="faint">No opportunities yet.</div>'}</div></div>
            <div class="card"><h3>Meetings</h3><div class="list">${mts.length ? mts.map((m) => `<a class="list-row link" href="#/meetings/${m.id}">${icons.video}<span class="grow">${esc(m.title)}</span><span class="sub">${fmtDate(m.startsAt)}</span>${meetingChip(m)}</a>`).join('') : '<div class="faint">No meetings yet.</div>'}</div></div>
            ${activityCard('company', co.id)}
          </div>
        </div>
      </div></div>`;
  }

  /* ---------- Opportunities ---------- */
  function pageOpportunities() {
    if (route.id) return pageOpportunity(byId('opportunities', route.id));
    const view = S.settings.oppView || 'table';
    const toolbar = `<div class="seg"><button class="${view === 'table' ? 'active' : ''}" data-action="opp-view" data-value="table">${icons.list} Table</button><button class="${view === 'board' ? 'active' : ''}" data-action="opp-view" data-value="board">${icons.columns} Board</button></div>`;
    const cols = [
      { key: 'name', label: 'Name', icon: icons.target, cls: 'name', render: (o) => `${icons.target}${esc(o.name)}` },
      { key: 'companyId', label: 'Company', icon: icons.building, render: (o) => esc(companyName(o.companyId)), text: (o) => companyName(o.companyId) },
      { key: 'stage', label: 'Stage', icon: icons.status, render: (o) => selectHtml('opportunities', o.id, 'stage', o.stage, STAGES), sortValue: (o) => STAGES.indexOf(o.stage) },
      { key: 'amount', label: 'Amount', icon: icons.dollar, render: (o) => fmtMoney(o.amount) },
      { key: 'owner', label: 'Owner', icon: icons.user, render: (o) => ownerSelect('opportunities', o.id, o.owner), text: (o) => userName(o.owner) },
      { key: 'closeDate', label: 'Close date', icon: icons.calendar, render: (o) => fmtDate(o.closeDate) },
      { key: 'nextStep', label: 'Next step', icon: icons.chevron, render: (o) => esc(o.nextStep || '') || '<span class="chip amber">Missing</span>' },
      { key: 'qualifiedAt', label: 'Qualified', icon: icons.check, render: (o) => o.qualifiedAt ? fmtDate(o.qualifiedAt) : '—' },
    ];
    const body = view === 'board' ? `<div class="table-toolbar"><span class="count">${openOpps().length} open · ${fmtMoney(openOpps().reduce((s, o) => s + o.amount, 0))}</span><span class="spacer"></span>${toolbar}</div>${board()}`
      : table({ key: 'opportunities', noun: 'opportunities', nounSingular: 'opportunity', columns: cols, rows: S.opportunities, rowHref: (o) => '#/opportunities/' + o.id, toolbar, defaultSort: { key: 'closeDate', dir: 1 } });
    return topbar(crumb(icons.target, 'Opportunities'), `<button class="btn" data-action="new-opportunity">${icons.plus} New opportunity</button>${createInChat()}`) + `<div class="content" ${view === 'board' ? 'style="display:flex;flex-direction:column"' : ''}>${body}</div>`;
  }
  function board() {
    return `<div class="board">${STAGES.map((st) => {
      const items = S.opportunities.filter((o) => o.stage === st).sort((a, b) => a.closeDate - b.closeDate);
      const sum = items.reduce((s, o) => s + o.amount, 0);
      return `<div class="col" data-drop-stage="${st}"><div class="col-head">${stageChip(st)}<span class="count">${items.length}</span><span class="sum">${fmtMoney(sum)}</span></div><div class="col-body">${items.map((o) => `<div class="kcard" draggable="true" data-drag-id="${o.id}" data-href="#/opportunities/${o.id}"><div class="t">${esc(o.name)}</div><div class="m"><span>${esc(companyName(o.companyId))}</span><span>${fmtMoney(o.amount)}</span></div><div class="m" style="margin-top:4px"><span>${esc(userName(o.owner))}</span><span>${fmtDate(o.closeDate)}</span></div></div>`).join('')}</div></div>`;
    }).join('')}</div>`;
  }
  function pageOpportunity(o) {
    if (!o) return notFound('Opportunity');
    const co = byId('companies', o.companyId);
    const mts = co ? meetingsOf(co.id) : [];
    const tasks = S.tasks.filter((t) => (t.objectType === 'opportunity' && t.objectId === o.id) || (co && t.objectType === 'company' && t.objectId === co.id));
    return topbar(crumb(icons.target, 'Opportunities', o.name), `<button class="btn ghost danger" data-action="delete-record" data-coll="opportunities" data-id="${o.id}">${icons.trash}</button>`) + `
      <div class="content"><div class="content-inner">
        <div class="record-header"><span style="width:40px;height:40px;border:1px solid var(--border);border-radius:8px;display:inline-flex;align-items:center;justify-content:center">${icons.target}</span><div><h1>${esc(o.name)}</h1><div class="sub">${co ? `<a href="#/companies/${co.id}">${esc(co.name)}</a> · ` : ''}${fmtMoney(o.amount)} · ${stageChip(o.stage)}</div></div></div>
        <div class="record-grid">
          <div>
            <div class="card"><h3>Details</h3>
              <div class="meta" style="grid-template-columns:110px 1fr;margin-bottom:0">
                <div class="k">Name</div><div class="v">${textEdit('opportunities', o.id, 'name', o.name)}</div>
                <div class="k">Stage</div><div class="v">${selectHtml('opportunities', o.id, 'stage', o.stage, STAGES, '')}</div>
                <div class="k">Amount</div><div class="v">${textEdit('opportunities', o.id, 'amount', o.amount, 'number')}</div>
                <div class="k">Owner</div><div class="v">${ownerSelect('opportunities', o.id, o.owner, '')}</div>
                <div class="k">Close date</div><div class="v"><input type="date" data-edit="opportunities:${o.id}:closeDate" value="${toDateInput(o.closeDate)}"></div>
                <div class="k">Next step</div><div class="v">${textEdit('opportunities', o.id, 'nextStep', o.nextStep)}</div>
                <div class="k">Qualified</div><div class="v muted">${o.qualifiedAt ? fmtDate(o.qualifiedAt) : 'Not yet'}</div>
                <div class="k">Created</div><div class="v muted">${fmtDate(o.createdAt)}</div>
              </div>
            </div>
            <div class="card"><h3>Tasks <button class="btn ghost sm" data-action="new-task" data-type="opportunity" data-id="${o.id}">${icons.plus}</button></h3><div class="list">${tasks.length ? tasks.map(taskRow).join('') : '<div class="faint">No tasks.</div>'}</div></div>
          </div>
          <div>
            <div class="card"><h3>Meetings</h3><div class="list">${mts.length ? mts.map((m) => `<a class="list-row link" href="#/meetings/${m.id}">${icons.video}<span class="grow">${esc(m.title)}</span><span class="sub">${fmtDate(m.startsAt)}</span>${meetingChip(m)}</a>`).join('') : '<div class="faint">No meetings yet.</div>'}</div></div>
            ${activityCard('opportunity', o.id)}
          </div>
        </div>
      </div></div>`;
  }

  /* ---------- Meetings ---------- */
  function meetingChip(m) {
    if (m.status === 'processed') return '<span class="chip green">Processed</span>';
    if (m.status === 'recorded') return '<span class="chip blue">Recorded</span>';
    if (m.status === 'upcoming') return willRecord(m) ? '<span class="chip red">● Will record</span>' : '<span class="chip gray">Not recording</span>';
    return '<span class="chip gray">Not recorded</span>';
  }
  function pageMeetings() {
    if (route.id) return pageMeeting(byId('meetings', route.id));
    const cols = [
      { key: 'title', label: 'Title', icon: icons.video, cls: 'name', render: (m) => `${icons.video}${esc(m.title)}` },
      { key: 'startsAt', label: 'When', icon: icons.calendar, render: (m) => fmtDateTime(m.startsAt), sortValue: (m) => -m.startsAt },
      { key: 'companyId', label: 'Company', icon: icons.building, render: (m) => esc(m.companyId ? companyName(m.companyId) : '—'), text: (m) => m.companyId ? companyName(m.companyId) : '' },
      { key: 'attendees', label: 'Attendees', icon: icons.users, render: (m) => esc(m.attendeeIds.map((id) => (byId('contacts', id) || {}).name).filter(Boolean).concat(m.internalIds.map(userName)).join(', ')), text: (m) => m.attendeeIds.map((id) => (byId('contacts', id) || {}).name).join(' ') },
      { key: 'external', label: 'Type', render: (m) => m.external ? '<span class="chip outline">External</span>' : '<span class="chip gray">Internal</span>', sortValue: (m) => m.external ? 0 : 1 },
      { key: 'status', label: 'Recording', icon: icons.status, render: meetingChip },
      { key: 'durationMin', label: 'Length', icon: icons.clock, render: (m) => m.durationMin + ' min' },
    ];
    const pref = S.settings.recording;
    const prefLabel = pref === 'all' ? 'Recording all meetings' : pref === 'external' ? 'Recording external meetings' : 'Not recording by default';
    return topbar(crumb(icons.video, 'Meetings'), `<a class="btn ghost" href="#/settings">${icons.video} ${prefLabel}</a><button class="btn" data-action="new-meeting">${icons.plus} New meeting</button>`) +
      `<div class="content">${table({ key: 'meetings', noun: 'meetings', nounSingular: 'meeting', columns: cols, rows: S.meetings, rowHref: (m) => '#/meetings/' + m.id, defaultSort: { key: 'startsAt', dir: 1 } })}</div>`;
  }
  function pageMeeting(m) {
    if (!m) return notFound('Meeting');
    const co = m.companyId ? byId('companies', m.companyId) : null;
    const reviews = S.reviews.filter((r) => r.sourceMeetingId === m.id);
    const attendees = m.attendeeIds.map((id) => byId('contacts', id)).filter(Boolean);
    const upcoming = m.status === 'upcoming';
    const actions = upcoming
      ? `<button class="btn" data-action="toggle-record" data-id="${m.id}">${willRecord(m) ? icons.x + ' Don\'t record' : icons.video + ' Record this meeting'}</button><button class="btn" data-action="simulate-meeting" data-id="${m.id}">${icons.play} Simulate call now</button>`
      : m.status === 'recorded' ? `<button class="btn primary" data-action="process-meeting" data-id="${m.id}">${icons.sparkle} Generate summary</button>`
      : m.status === 'processed' ? `<button class="btn" data-action="draft-recap" data-id="${m.id}">${icons.mail} Draft recap email</button>`
      : `<button class="btn" data-action="mark-recorded" data-id="${m.id}">${icons.video} Upload recording</button>`;
    return topbar(crumb(icons.video, 'Meetings', m.title), actions + `<button class="btn ghost danger" data-action="delete-record" data-coll="meetings" data-id="${m.id}">${icons.trash}</button>`) + `
      <div class="content"><div class="content-inner">
        <div class="record-header"><span style="width:40px;height:40px;border:1px solid var(--border);border-radius:8px;display:inline-flex;align-items:center;justify-content:center">${icons.video}</span><div><h1>${esc(m.title)}</h1><div class="sub">${fmtDateTime(m.startsAt)} · ${m.durationMin} min · ${meetingChip(m)}</div></div></div>
        <div class="record-grid">
          <div>
            <div class="card"><h3>Details</h3>
              <div class="meta" style="grid-template-columns:110px 1fr;margin-bottom:0">
                <div class="k">Title</div><div class="v">${textEdit('meetings', m.id, 'title', m.title)}</div>
                <div class="k">When</div><div class="v"><input type="datetime-local" data-edit="meetings:${m.id}:startsAt" value="${toDateTimeInput(m.startsAt)}"></div>
                <div class="k">Length</div><div class="v">${textEdit('meetings', m.id, 'durationMin', m.durationMin, 'number')}</div>
                <div class="k">Company</div><div class="v"><select data-edit="meetings:${m.id}:companyId"><option value="">—</option>${S.companies.map((x) => `<option value="${x.id}" ${x.id === m.companyId ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
                <div class="k">Type</div><div class="v">${m.external ? 'External' : 'Internal'}</div>
                ${m.transcriptLines ? `<div class="k">Transcript</div><div class="v muted">${m.transcriptLines} lines</div>` : ''}
              </div>
            </div>
            <div class="card"><h3>Attendees</h3><div class="list">
              ${attendees.map((c) => `<a class="list-row link" href="#/contacts/${c.id}">${avatarHtml(c.name)}<span class="grow">${esc(c.name)}<br><span class="sub">${esc(c.title)} · ${esc(companyName(c.companyId))}</span></span></a>`).join('')}
              ${m.internalIds.map((id) => `<div class="list-row">${avatarHtml(userName(id))}<span class="grow">${esc(userName(id))}<br><span class="sub">${esc(S.settings.workspace)}</span></span></div>`).join('')}
            </div></div>
          </div>
          <div>
            ${m.status === 'processed' ? `
              <div class="card"><h3>Summary</h3><div class="prose">${esc(m.summary)}</div></div>
              <div class="card"><h3>Follow-ups</h3><div class="list">${m.followups.map((f) => `<div class="list-row">${icons.check}<span class="grow">${esc(f)}</span></div>`).join('')}</div></div>
              <div class="card"><h3>Proposed updates</h3><div class="list">${reviews.length ? reviews.map((r) => `<a class="list-row link" href="#/review">${r.status === 'pending' ? icons.review : r.status === 'approved' ? icons.check : icons.x}<span class="grow">${esc(r.title)}</span><span class="chip ${r.status === 'pending' ? 'amber' : r.status === 'approved' ? 'green' : 'gray'}">${r.status}</span></a>`).join('') : '<div class="faint">None</div>'}</div></div>
            ` : m.status === 'recorded' ? `<div class="card"><h3>Recording</h3><p class="muted">The recording is in. Generate a summary to get follow-ups and proposed record updates.</p></div>`
            : upcoming ? `<div class="card"><h3>Before the call</h3><p class="muted">${willRecord(m) ? 'The assistant will join and record this meeting. Afterwards it will draft a summary and propose updates for review.' : 'This meeting will not be recorded. You can turn recording on for this meeting only from the button above.'}</p>${co ? `<div class="list" style="margin-top:10px">${oppsOf(co.id).map((o) => `<a class="list-row link" href="#/opportunities/${o.id}">${icons.target}<span class="grow">${esc(o.name)}</span>${stageChip(o.stage)}<span class="sub">${esc(o.nextStep || '')}</span></a>`).join('')}</div>` : ''}</div>`
            : `<div class="card"><h3>Not recorded</h3><p class="muted">This meeting was not recorded, so there is no summary.</p></div>`}
          </div>
        </div>
      </div></div>`;
  }

  /* ---------- Lists ---------- */
  function listRows(l) {
    const f = l.filter || {};
    const match = (row) => Object.keys(f).every((k) => {
      if (k === 'companyFunding') { const co = byId('companies', row.companyId); return co && co.funding === f[k]; }
      return row[k] === f[k];
    });
    return (l.objectType === 'company' ? S.companies : S.contacts).filter((r) => match(r) || (l.memberIds || []).includes(r.id));
  }
  function pageList() {
    const l = byId('lists', route.id);
    if (!l) return notFound('List');
    const rows = listRows(l);
    const filterDesc = Object.entries(l.filter || {}).map(([k, v]) => `${k === 'companyFunding' ? 'company funding' : fieldLabel(k).toLowerCase()} is ${v}`).join(', ');
    const tbl = l.objectType === 'company'
      ? table({ key: 'list:' + l.id, noun: 'companies', nounSingular: 'company', columns: companyColumns(), rows, rowHref: (c) => '#/companies/' + c.id })
      : table({ key: 'list:' + l.id, noun: 'contacts', nounSingular: 'contact', columns: contactColumns(), rows, rowHref: (c) => '#/contacts/' + c.id });
    return topbar(crumb(icons.list, l.name), `<button class="btn ghost" data-action="toggle-list-section" data-id="${l.id}">${icons.star} ${l.section === 'favorites' ? 'Unfavorite' : 'Favorite'}</button><button class="btn ghost danger" data-action="delete-list" data-id="${l.id}">${icons.trash}</button>`) + `
      <div class="content">
        <div class="table-toolbar" style="border-bottom:0;padding-bottom:0"><span class="muted">${filterDesc ? 'Filter: ' + esc(filterDesc) : 'Manual list'}</span></div>
        ${tbl}
      </div>`;
  }

  /* ---------- Chat ---------- */
  function md(text) {
    const lines = String(text).split('\n');
    let html = '', para = [], inTable = false, tableRows = [], listType = null;
    const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\[([^\]]+)\]\((#[^)]+)\)/g, '<a href="$2">$1</a>');
    const flushPara = () => { if (para.length) { html += `<p>${para.map(inline).join('<br>')}</p>`; para = []; } };
    const flushTable = () => {
      if (!tableRows.length) return;
      const rows = tableRows.filter((r) => !/^\|?\s*-{2,}/.test(r)).map((r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
      html += `<table><thead><tr>${rows[0].map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      tableRows = []; inTable = false;
    };
    const flushList = () => { if (listType) { html += `</${listType}>`; listType = null; } };
    for (const raw of lines) {
      const line = raw.replace(/\s+$/, '');
      if (/^\|/.test(line)) { flushPara(); flushList(); inTable = true; tableRows.push(line); continue; }
      if (inTable) flushTable();
      const li = line.match(/^\s*([-*]|\d+\.)\s+(.*)$/);
      if (li) { flushPara(); const t = /\d/.test(li[1]) ? 'ol' : 'ul'; if (listType !== t) { flushList(); html += `<${t}>`; listType = t; } html += `<li>${inline(li[2])}</li>`; continue; }
      flushList();
      if (!line.trim()) { flushPara(); continue; }
      para.push(line);
    }
    flushPara(); flushTable(); flushList();
    return html;
  }
  function pageChat() {
    const isNew = !route.id || route.id === 'new';
    const chat = isNew ? null : byId('chats', route.id);
    if (!isNew && !chat) return notFound('Chat');
    if (chat && chat.unread) { chat.unread = false; save(); }
    const suggestions = ['Create a dashboard using my pipeline data', 'Draft a recap email for my last call', 'Which opportunities have no next step?', 'Create contact Jane Doe at Bluefin Analytics', 'Show me SQL contacts', 'Create an automation that notifies me when a deal is Won'];
    const body = chat ? `<div class="chat-inner">${chat.messages.map((m) => `<div class="msg ${m.role}"><span class="who">${m.role === 'user' ? avatarHtml(me().name) : `<span class="avatar" style="background:var(--text);color:var(--bg-elev)">✦</span>`}</span><div class="body">${m.role === 'user' ? esc(m.text) : `<div class="md">${md(m.text)}</div>`}</div></div>`).join('')}</div>`
      : `<div class="chat-empty"><h2>What do you want to do?</h2><p class="muted">Ask about your pipeline, create records, draft emails, or set up automations.</p></div>`;
    return topbar(crumb(icons.chat, chat ? chat.title : 'New chat'), chat ? `<button class="btn ghost danger" data-action="delete-chat" data-id="${chat.id}">${icons.trash}</button>` : '') + `
      <div class="content" style="display:flex;flex-direction:column;overflow:hidden">
        <div class="chat">
          <div class="chat-messages" id="chat-messages">${body}</div>
          <div class="chat-composer">
            ${!chat || chat.messages.length < 2 ? `<div class="chat-suggest">${suggestions.map((s) => `<button data-action="suggest" data-text="${esc(s)}">${esc(s)}</button>`).join('')}</div>` : ''}
            <form data-form="chat" data-id="${chat ? chat.id : 'new'}"><textarea name="text" rows="1" placeholder="Ask anything, or type / for commands…" autofocus>${esc(ui.chatDraft)}</textarea><button class="btn primary" type="submit" title="Send">${icons.send}</button></form>
          </div>
        </div>
      </div>`;
  }

  /* ---------- Settings ---------- */
  function recordingOptions(selected) {
    const opts = [
      { v: 'external', t: 'Record external meetings only', rec: true, d: 'The assistant will only record meetings you participate in that have external participants' },
      { v: 'all', t: 'Record all meetings', d: 'The assistant will record all meetings you participate in' },
      { v: 'none', t: "Don't record", d: 'Your meetings will not be recorded by default. You can still record individual meetings directly from the meeting page.' },
    ];
    return `<div class="options">${opts.map((o) => `<div class="option ${selected === o.v ? 'selected' : ''}" data-action="pick-recording" data-value="${o.v}"><div class="ot"><h3>${esc(o.t)}${o.rec ? '<span class="chip blue">Recommended</span>' : ''}</h3><p>${esc(o.d)}</p></div><span class="radio"></span></div>`).join('')}</div>`;
  }
  function pageSettings() {
    const user = me();
    return topbar(crumb(icons.settings, 'Settings')) + `
      <div class="content"><div class="content-inner narrow"><div class="settings-grid">
        <div class="card"><h3>Profile</h3>
          <div class="meta" style="grid-template-columns:120px 1fr;margin-bottom:0">
            <div class="k">Name</div><div class="v">${textEdit('users', user.id, 'name', user.name)}</div>
            <div class="k">Email</div><div class="v">${textEdit('users', user.id, 'email', user.email)}</div>
            <div class="k">Workspace</div><div class="v"><input type="text" data-edit="settings::workspace" value="${esc(S.settings.workspace)}"></div>
            <div class="k">Theme</div><div class="v"><select data-edit="settings::theme"><option value="dark" ${S.settings.theme === 'dark' ? 'selected' : ''}>Dark</option><option value="light" ${S.settings.theme === 'light' ? 'selected' : ''}>Light</option></select></div>
          </div>
        </div>
        <div class="card"><h3>Call recording</h3><p class="muted" style="margin-bottom:12px">The assistant joins your meetings to generate summaries, follow-ups, and record updates based on your conversations.</p>${recordingOptions(S.settings.recording)}</div>
        <div class="card"><h3>Team</h3><div class="list">${S.users.map((u) => `<div class="list-row">${avatarHtml(u.name)}<span class="grow">${esc(u.name)}<br><span class="sub">${esc(u.email)}</span></span><span class="chip gray">${esc(u.role)}</span></div>`).join('')}</div></div>
        <div class="card"><h3>Data</h3><p class="muted" style="margin-bottom:10px">Everything is stored in this browser. Export a JSON backup, or reset to the sample workspace.</p><div style="display:flex;gap:8px"><button class="btn" data-action="export">${icons.download} Export JSON</button><button class="btn danger" data-action="reset">${icons.refresh} Reset to sample data</button></div></div>
      </div></div></div>`;
  }
  function pageOnboarding() {
    return `<div class="onboard"><div class="onboard-card">
      <h1>Record your calls with ${esc(S.settings.workspace)}</h1>
      <p class="lead">${esc(S.settings.workspace)} will join your meetings to generate summaries, followups, and record updates based on your conversations.</p>
      ${recordingOptions(S.settings.recording)}
      <button class="btn block" data-action="finish-onboarding">Continue</button>
    </div></div>`;
  }
  const notFound = (what) => topbar(crumb(icons.warn, what + ' not found')) + `<div class="content"><div class="empty">${esc(what)} not found. It may have been deleted.</div></div>`;

  /* ---------- Render ---------- */
  const pages = {
    'up-next': pageUpNext, review: pageReview, knowledge: pageKnowledge, skills: pageSkills, automations: pageAutomations,
    contacts: pageContacts, companies: pageCompanies, opportunities: pageOpportunities, meetings: pageMeetings,
    lists: pageList, chat: pageChat, settings: pageSettings,
  };
  function render() {
    document.documentElement.dataset.theme = S.settings.theme;
    const app = $('#app');
    if (!S.settings.onboarded) { app.innerHTML = pageOnboarding(); return; }
    let page = pages[route.page] || pageUpNext;
    if (route.page === 'automations' && route.sub === 'full') page = pageAutomationFull;
    const scrollEl = $('.content');
    const scrollTop = scrollEl ? scrollEl.scrollTop : 0;
    app.innerHTML = `<aside class="sidebar ${ui.sidebarOpen ? 'open' : ''}">${renderSidebar()}</aside><main class="main">${page()}</main>`;
    document.title = `${esc(S.settings.workspace)} CRM`;
    if (ui.keepScroll) { const el = $('.content'); if (el) el.scrollTop = scrollTop; ui.keepScroll = false; }
    if (ui.focusSearch) { const inp = $(`[data-search="${ui.focusSearch}"]`); if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); } ui.focusSearch = null; }
    const cm = $('#chat-messages'); if (cm) cm.scrollTop = cm.scrollHeight;
    const ta = $('.chat-composer textarea'); if (ta && route.page === 'chat') { autoGrow(ta); if (!ui.noFocus) ta.focus(); }
    ui.noFocus = false;
  }
  function pageAutomationFull() {
    const a = byId('automations', route.id);
    if (!a) return notFound('Automation');
    return topbar(crumb(icons.flow, 'Automations', a.name), `<button class="btn" data-action="run-automation" data-id="${a.id}">${icons.play} Run now</button><button class="btn" data-action="toggle-automation" data-id="${a.id}">${a.status === 'Active' ? icons.pause + ' Pause' : icons.play + ' Resume'}</button><a class="btn ghost" href="#/automations/${a.id}">Open as panel</a>`) +
      `<div class="content"><div class="content-inner narrow">${automationBody(a)}</div></div>`;
  }
  const rerender = (keepScroll) => { ui.keepScroll = keepScroll !== false; render(); };
  const autoGrow = (ta) => { ta.style.height = 'auto'; ta.style.height = Math.min(160, ta.scrollHeight) + 'px'; };

  /* ---------- Modal ---------- */
  function openModal(opts) {
    closeModal();
    ui.modal = opts;
    const host = document.createElement('div');
    host.id = 'modal';
    host.innerHTML = `<div class="modal-backdrop" data-action="modal-backdrop"><div class="modal ${opts.cls || ''}" role="dialog">
      ${opts.title ? `<div class="modal-head"><span>${esc(opts.title)}</span><span class="spacer"></span><button class="icon-btn" data-action="modal-close">${icons.x}</button></div>` : ''}
      ${opts.form ? `<form data-form="modal"><div class="modal-body">${opts.body}</div><div class="modal-foot"><button type="button" class="btn ghost" data-action="modal-close">Cancel</button><button type="submit" class="btn primary">${esc(opts.submitLabel || 'Create')}</button></div></form>` : opts.body}
    </div></div>`;
    document.body.appendChild(host);
    const first = host.querySelector('input:not([type=hidden]), select, textarea');
    if (first) first.focus();
    if (opts.onOpen) opts.onOpen(host);
  }
  function closeModal() { const m = $('#modal'); if (m) m.remove(); ui.modal = null; }
  const F = {
    text: (name, label, value, extra) => `<div class="field"><label>${esc(label)}</label><input name="${name}" type="text" value="${esc(value == null ? '' : value)}" ${extra || ''}></div>`,
    number: (name, label, value) => `<div class="field"><label>${esc(label)}</label><input name="${name}" type="number" value="${esc(value == null ? '' : value)}"></div>`,
    date: (name, label, value) => `<div class="field"><label>${esc(label)}</label><input name="${name}" type="date" value="${esc(value || '')}"></div>`,
    datetime: (name, label, value) => `<div class="field"><label>${esc(label)}</label><input name="${name}" type="datetime-local" value="${esc(value || '')}"></div>`,
    select: (name, label, options, value) => `<div class="field"><label>${esc(label)}</label><select name="${name}">${options.map((o) => { const v = typeof o === 'string' ? o : o.v, t = typeof o === 'string' ? o : o.t; return `<option value="${esc(v)}" ${v === value ? 'selected' : ''}>${esc(t)}</option>`; }).join('')}</select></div>`,
    textarea: (name, label, value) => `<div class="field"><label>${esc(label)}</label><textarea name="${name}">${esc(value || '')}</textarea></div>`,
    row: (a, b) => `<div class="field-row">${a}${b}</div>`,
  };
  const companyOptions = (selected) => [{ v: '', t: '— None —' }].concat(S.companies.map((c) => ({ v: c.id, t: c.name })));
  const userOptions = () => S.users.map((u) => ({ v: u.id, t: u.name }));

  /* ---------- Creation helpers ---------- */
  function createContact(data) {
    const c = { id: uid('ct'), name: data.name.trim(), email: (data.email || '').trim(), title: (data.title || '').trim(), companyId: data.companyId || null, leadStatus: data.leadStatus || 'New', owner: data.owner || S.settings.userId, source: data.source || 'Manual', phone: data.phone || '', createdAt: Date.now() };
    const dup = S.contacts.find((x) => c.email && x.email.toLowerCase() === c.email.toLowerCase());
    if (dup) { toast(`Merged into existing contact ${dup.name}`); runHooks('contact.created', c); return dup; }
    S.contacts.push(c);
    logActivity({ objectType: 'contact', objectId: c.id, title: 'Contact created' });
    if (c.companyId) logActivity({ objectType: 'company', objectId: c.companyId, title: `Contact added: ${c.name}` });
    runHooks('contact.created', c);
    return c;
  }
  function createCompany(data) {
    const name = data.name.trim();
    const existing = S.companies.find((x) => x.name.toLowerCase() === name.toLowerCase() || (data.domain && x.domain === data.domain));
    if (existing) return existing;
    const co = { id: uid('co'), name, domain: (data.domain || name.toLowerCase().replace(/[^a-z0-9]+/g, '') + '.com'), industry: data.industry || 'Unknown', size: data.size || '11-50', segment: data.segment || 'SMB', owner: data.owner || S.settings.userId, arr: Number(data.arr) || 0, funding: data.funding || 'Seed', source: data.source || 'Manual', createdAt: Date.now() };
    S.companies.push(co);
    logActivity({ objectType: 'company', objectId: co.id, title: 'Company created' });
    runHooks('company.created', co);
    return co;
  }
  function createOpportunity(data) {
    const o = { id: uid('op'), name: data.name.trim(), companyId: data.companyId || null, stage: data.stage || 'Discovery', amount: Number(data.amount) || 0, owner: data.owner || S.settings.userId, closeDate: data.closeDate ? new Date(data.closeDate).getTime() : Date.now() + 30 * DAY, qualifiedAt: null, createdAt: Date.now(), nextStep: data.nextStep || '' };
    if (o.stage === 'Qualified') o.qualifiedAt = Date.now();
    S.opportunities.push(o);
    logActivity({ objectType: 'opportunity', objectId: o.id, title: 'Opportunity created' });
    if (o.companyId) logActivity({ objectType: 'company', objectId: o.companyId, title: `Opportunity created: ${o.name}` });
    // Contacts at the company become Converted (status never moves backwards).
    contactsOf(o.companyId).forEach((c) => { if (['New', 'MQL', 'SQL'].includes(c.leadStatus)) c.leadStatus = 'Converted'; });
    runHooks('opportunity.created', o);
    return o;
  }
  function createMeeting(data) {
    const attendeeIds = (data.attendeeIds || []).filter(Boolean);
    const co = data.companyId || (attendeeIds.length ? (byId('contacts', attendeeIds[0]) || {}).companyId : null) || null;
    const m = { id: uid('mt'), title: data.title.trim(), startsAt: data.startsAt ? new Date(data.startsAt).getTime() : Date.now() + HOUR, durationMin: Number(data.durationMin) || 30, attendeeIds, internalIds: [S.settings.userId], external: attendeeIds.length > 0, recorded: false, status: 'upcoming', companyId: co, summary: '', followups: [], transcriptLines: 0 };
    if (m.startsAt < Date.now()) m.status = 'not_recorded';
    S.meetings.push(m);
    return m;
  }
  function createAutomation(data) {
    const a = { id: uid('au'), name: data.name.trim(), status: 'Active', trigger: data.trigger || 'Webhook received', extraTriggers: 0, cadence: data.trigger === 'Schedule' ? (data.cadence || 'Daily, 9:00') : 'Event', createdBy: S.settings.userId, runProtection: true, credits: 0.1, runs: 0, lastRun: null, lastFailed: null, description: data.description || '', steps: (data.steps || '').split('\n').map((s) => s.trim()).filter(Boolean), runLog: [], createdAt: Date.now() };
    if (!a.steps.length) a.steps = ['Receive trigger', 'Evaluate conditions', 'Apply changes'];
    S.automations.push(a);
    return a;
  }
  function createTask(data) {
    const t = { id: uid('tk'), title: data.title.trim(), due: data.due ? new Date(data.due).getTime() : Date.now() + DAY, done: false, objectType: data.objectType || null, objectId: data.objectId || null, meetingId: data.meetingId || null };
    S.tasks.push(t);
    return t;
  }

  /* ---------- Automation engine ---------- */
  const TRIGGER_FOR_EVENT = { 'contact.created': 'Contact created', 'company.created': 'Account created', 'opportunity.created': 'Opportunity created', 'opportunity.updated': 'Opportunity updated', 'meeting.updated': 'Meeting updated' };
  function recordRun(a, ok, note) {
    a.runs += 1;
    a.lastRun = Date.now();
    if (!ok) a.lastFailed = Date.now();
    a.runLog.unshift({ id: uid('run'), ts: Date.now(), status: ok ? 'success' : 'failed', durationMs: 900 + Math.floor(Math.random() * 4000), credits: a.credits, note: note || '' });
    if (a.runLog.length > 40) a.runLog.length = 40;
  }
  function runHooks(event, obj) {
    const trig = TRIGGER_FOR_EVENT[event];
    const ran = [];
    S.automations.filter((a) => a.status === 'Active' && a.trigger === trig).forEach((a) => {
      let note = '';
      if (a.id === 'au_9' && event === 'opportunity.created') { const co = byId('companies', obj.companyId); if (co) { const seg = obj.amount >= 100000 || ['501-1000', '1001+'].includes(co.size) ? 'Enterprise' : obj.amount >= 25000 || ['51-200', '201-500'].includes(co.size) ? 'Mid-market' : 'SMB'; if (co.segment !== seg) { co.segment = seg; note = 'Segment → ' + seg; } } }
      if (a.id === 'au_18' && event === 'opportunity.updated' && obj.stage === 'Qualified' && !obj.qualifiedAt) { obj.qualifiedAt = Date.now(); note = 'Set qualified date'; }
      if (a.id === 'au_17' && event === 'opportunity.updated') { if (obj.stage !== 'Won') return; note = 'Posted to #wins'; toast(`Posted to #wins: ${obj.name} closed for ${fmtMoney(obj.amount)}`); }
      if (a.id === 'au_13' && event === 'company.created') { if (obj.industry === 'Unknown') { obj.industry = 'Software'; note = 'Filled industry'; } }
      if (a.id === 'au_12' && event === 'company.created') { researchCompany(obj, true); note = 'Wrote research note'; }
      if (a.id === 'au_3' && event === 'contact.created') { note = 'No duplicates found'; }
      recordRun(a, true, note);
      ran.push(a);
    });
    if (ran.length) toast(`${ran.length} automation${ran.length === 1 ? '' : 's'} ran: ${ran.map((a) => a.name).slice(0, 2).join(', ')}${ran.length > 2 ? '…' : ''}`);
    return ran;
  }
  function researchCompany(co, silent) {
    const existing = S.knowledge.find((k) => k.companyId === co.id);
    const cts = contactsOf(co.id);
    const body = `${co.name} is a ${co.segment.toLowerCase()} ${co.industry.toLowerCase()} company (${co.size} people, ${co.funding.toLowerCase()}) at ${co.domain}. ` +
      (cts.length ? `Known contacts: ${cts.map((c) => `${c.name} (${c.title})`).join(', ')}. ` : 'No contacts on record yet. ') +
      `Likely use cases: keeping the CRM accurate after customer calls, automatic follow-ups, and pipeline reviews without spreadsheet prep. ` +
      `Suggested opener: ask how long their weekly pipeline review takes and who owns follow-ups after calls.`;
    if (existing) { existing.body = body; existing.updatedAt = Date.now(); }
    else S.knowledge.unshift({ id: uid('kn'), title: `Research: ${co.name}`, body, updatedAt: Date.now(), tags: ['research'], companyId: co.id });
    logActivity({ objectType: 'company', objectId: co.id, title: 'Research note written', text: 'Saved to Knowledge.' });
    if (!silent) toast('Research note added to Knowledge');
  }

  /* ---------- Meeting processing ---------- */
  function processMeeting(m) {
    const co = m.companyId ? byId('companies', m.companyId) : null;
    const attendees = m.attendeeIds.map((id) => byId('contacts', id)).filter(Boolean);
    const opps = co ? oppsOf(co.id).filter((o) => o.stage !== 'Won' && o.stage !== 'Lost') : [];
    const lead = attendees[0];
    const who = attendees.length ? attendees.map((c) => c.name.split(' ')[0]).join(' and ') : 'The team';
    m.summary = `${who} walked through how ${co ? co.name : 'the team'} handles follow-ups and pipeline updates today. ` +
      `The main pain is that updates after calls are manual and often skipped, so pipeline reviews start from stale data. ` +
      (opps.length ? `They are evaluating ${opps[0].name.split(' — ')[1] || 'a rollout'} at roughly ${fmtMoney(opps[0].amount)} and want a decision ${opps[0].closeDate ? 'by ' + fmtDate(opps[0].closeDate) : 'this quarter'}. ` : 'No opportunity exists yet; they asked for pricing and a follow-up. ') +
      `Agreed next steps: send a recap with pricing, share the security overview, and book a technical follow-up.`;
    m.followups = ['Send recap email with pricing', 'Share security overview', 'Book technical follow-up'];
    m.transcriptLines = 200 + Math.floor(Math.random() * 400);
    m.status = 'processed';
    m.recorded = true;
    m.followups.forEach((f, i) => createTask({ title: f + (co ? ' — ' + co.name : ''), due: Date.now() + (i + 1) * DAY, objectType: co ? 'company' : null, objectId: co ? co.id : null, meetingId: m.id }));
    const now = Date.now();
    if (opps.length) {
      const o = opps[0];
      const idx = STAGES.indexOf(o.stage);
      if (idx >= 0 && idx < 3) S.reviews.unshift({ id: uid('rv'), type: 'field_update', title: `Move ${o.name} to ${STAGES[idx + 1]}`, objectType: 'opportunity', objectId: o.id, field: 'stage', from: o.stage, to: STAGES[idx + 1], reason: 'Next steps were agreed on the call and budget was confirmed.', sourceMeetingId: m.id, status: 'pending', createdAt: now });
      if (!o.nextStep) S.reviews.unshift({ id: uid('rv'), type: 'field_update', title: `Set next step on ${o.name}`, objectType: 'opportunity', objectId: o.id, field: 'nextStep', from: '', to: 'Send recap with pricing', reason: 'Agreed on the call.', sourceMeetingId: m.id, status: 'pending', createdAt: now });
    } else if (co) {
      S.reviews.unshift({ id: uid('rv'), type: 'field_update', title: `Set next step for ${co.name}`, objectType: 'company', objectId: co.id, field: 'source', from: co.source, to: co.source, reason: 'No opportunity exists yet. Consider creating one from the company page.', sourceMeetingId: m.id, status: 'pending', createdAt: now });
    }
    attendees.forEach((c) => {
      if (['New', 'MQL'].includes(c.leadStatus)) S.reviews.unshift({ id: uid('rv'), type: 'field_update', title: `Move ${c.name} to SQL`, objectType: 'contact', objectId: c.id, field: 'leadStatus', from: c.leadStatus, to: 'SQL', reason: `${c.name.split(' ')[0]} joined a sales call and engaged on next steps.`, sourceMeetingId: m.id, status: 'pending', createdAt: now });
    });
    if (lead) S.reviews.unshift(draftRecapReview(m, lead));
    logActivity({ objectType: co ? 'company' : 'contact', objectId: co ? co.id : (lead ? lead.id : null), title: `Call processed: ${m.title}`, text: m.followups.join(' · ') });
    runHooks('meeting.updated', m);
  }
  function draftRecapReview(m, c) {
    const co = m.companyId ? byId('companies', m.companyId) : null;
    const draft = `Hi ${c.name.split(' ')[0]},\n\nThanks for the time today. To recap what we heard: follow-ups after calls are manual and pipeline reviews start from stale data.\n\nNext steps on our side:\n1. Recap with pricing (this email)\n2. Security overview\n3. A technical follow-up with your team\n\nDoes later this week work for the follow-up?\n\n${me().name.split(' ')[0]}`;
    return { id: uid('rv'), type: 'email_draft', title: `Recap email to ${c.name}`, objectType: 'contact', objectId: c.id, draft, reason: `Generated from ${m.title}${co ? ' with ' + co.name : ''}.`, sourceMeetingId: m.id, status: 'pending', createdAt: Date.now() };
  }
  function applyReview(r) {
    if (r.type === 'field_update') {
      const coll = r.objectType === 'company' ? 'companies' : r.objectType === 'contact' ? 'contacts' : 'opportunities';
      const obj = byId(coll, r.objectId);
      if (obj) {
        obj[r.field] = r.to;
        logActivity({ objectType: r.objectType, objectId: r.objectId, title: `${fieldLabel(r.field)} updated from review`, text: `${r.from == null ? '(empty)' : r.field === 'closeDate' ? fmtDate(r.from) : r.from} → ${r.field === 'closeDate' ? fmtDate(r.to) : r.to}` });
        if (coll === 'opportunities' && r.field === 'stage') runHooks('opportunity.updated', obj);
      }
    } else if (r.type === 'new_contact') {
      createContact(r.payload);
    } else if (r.type === 'email_draft') {
      logActivity({ objectType: 'contact', objectId: r.objectId, title: `Email sent: ${r.title}`, text: r.draft });
      const c = byId('contacts', r.objectId);
      if (c && c.companyId) logActivity({ objectType: 'company', objectId: c.companyId, title: `Email sent to ${c.name}`, text: r.draft.split('\n')[0] });
    }
    r.status = 'approved';
    r.resolvedAt = Date.now();
  }

  /* ---------- Assistant ---------- */
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  function findCompany(text) {
    const t = norm(text);
    let best = null, bestLen = 0;
    S.companies.forEach((c) => { const n = norm(c.name); const first = n.split(' ')[0]; if ((t.includes(n) && n.length > bestLen)) { best = c; bestLen = n.length; } else if (!best && first.length > 3 && t.includes(first)) { best = c; bestLen = first.length; } });
    return best;
  }
  function findContact(text) {
    const t = norm(text);
    let best = null, bestLen = 0;
    S.contacts.forEach((c) => { const n = norm(c.name); const first = n.split(' ')[0]; if (t.includes(n) && n.length > bestLen) { best = c; bestLen = n.length; } else if (!best && first.length > 3 && t.includes(first)) { best = c; bestLen = first.length; } });
    return best;
  }
  const oppLink = (o) => `[${o.name}](#/opportunities/${o.id})`;
  const coLink = (c) => `[${c.name}](#/companies/${c.id})`;
  const ctLink = (c) => `[${c.name}](#/contacts/${c.id})`;
  function pipelineReport() {
    const open = openOpps();
    const byStage = STAGES.filter((s) => s !== 'Won' && s !== 'Lost').map((s) => { const items = open.filter((o) => o.stage === s); return `| ${s} | ${items.length} | ${fmtMoney(items.reduce((a, o) => a + o.amount, 0))} |`; });
    const byOwner = S.users.map((u) => { const items = open.filter((o) => o.owner === u.id); return items.length ? `| ${u.name} | ${items.length} | ${fmtMoney(items.reduce((a, o) => a + o.amount, 0))} |` : null; }).filter(Boolean);
    const total = open.reduce((a, o) => a + o.amount, 0);
    const won = S.opportunities.filter((o) => o.stage === 'Won');
    const risks = open.filter((o) => !o.nextStep || o.closeDate < Date.now() || !o.qualifiedAt);
    return `Here is a snapshot of your open pipeline.\n\n| Stage | Deals | Amount |\n|---|---|---|\n${byStage.join('\n')}\n\n| Owner | Deals | Amount |\n|---|---|---|\n${byOwner.join('\n')}\n\nOpen pipeline totals **${fmtMoney(total)}** across ${open.length} deals. Won to date: **${fmtMoney(won.reduce((a, o) => a + o.amount, 0))}** (${won.length} deals).` +
      (risks.length ? `\n\n**Needs attention**\n${risks.map((o) => `- ${oppLink(o)}: ${!o.nextStep ? 'no next step' : o.closeDate < Date.now() ? 'close date has passed' : 'not yet qualified'}`).join('\n')}` : '');
  }
  function respond(text) {
    const t = text.trim();
    const l = t.toLowerCase();
    let m;
    if (/^(help|\/help|what can you do)/.test(l)) {
      return `I can work directly on your CRM. Try:\n- **Create records**: "create contact Jane Doe at Bluefin Analytics with email jane@bluefin.io", "create company Acme", "create opportunity Acme — Pilot for $20,000"\n- **Pipeline**: "create a dashboard", "which opportunities have no next step?"\n- **Drafting**: "draft a recap email for my call with Atlas", "draft an intro to Lucía"\n- **Lookups**: "show me SQL contacts", "give me all the information on Northwind", "meetings today"\n- **Automations**: "create an automation that notifies me when a deal is Won"`;
    }
    if ((m = t.match(/^create (?:a |an |new )?contact (?:named |called )?(.+?)(?: at (.+?))?(?: with (?:email|the email) (\S+))?$/i))) {
      const co = m[2] ? (findCompany(m[2]) || createCompany({ name: m[2] })) : null;
      const email = m[3] ? m[3].replace(/[.,]$/, '') : '';
      const c = createContact({ name: m[1], companyId: co ? co.id : null, email, source: 'Chat' });
      return `Created contact ${ctLink(c)}${co ? ` at ${coLink(co)}` : ''}${email ? ` with email ${email}` : ''}. Lead status is **New**.`;
    }
    if ((m = t.match(/^create (?:a |an |new )?(?:company|account) (?:named |called )?(.+?)(?: in (.+))?$/i))) {
      const co = createCompany({ name: m[1], industry: m[2] });
      return `Created company ${coLink(co)}. Enrichment and research automations ran and wrote a research note to Knowledge.`;
    }
    if ((m = t.match(/^create (?:a |an |new )?(?:opportunity|deal) (?:named |called )?(.+?)(?: (?:for|at|with) (?![$\d])(.+?))?(?: (?:for|worth|at) \$?([\d,]+)k?)?$/i))) {
      const co = m[2] ? (findCompany(m[2]) || createCompany({ name: m[2] })) : findCompany(m[1]);
      const amount = m[3] ? Number(m[3].replace(/,/g, '')) : 0;
      const o = createOpportunity({ name: m[1], companyId: co ? co.id : null, amount });
      return `Created opportunity ${oppLink(o)}${co ? ` for ${coLink(co)}` : ''} in **Discovery**${amount ? ` at ${fmtMoney(amount)}` : ''}.`;
    }
    if ((m = t.match(/^create (?:a |an |new )?automation (?:that |to |which )?(.+)$/i))) {
      const d = m[1];
      const trigger = /won|stage|opportunit|deal/i.test(d) ? 'Opportunity updated' : /contact|lead/i.test(d) ? 'Contact created' : /meeting|call/i.test(d) ? 'Meeting updated' : /compan|account/i.test(d) ? 'Account created' : /daily|weekly|every/i.test(d) ? 'Schedule' : 'Webhook received';
      const a = createAutomation({ name: d.charAt(0).toUpperCase() + d.slice(1), trigger, description: `Created from chat: ${t}` });
      return `Created automation [${a.name}](#/automations/${a.id}) triggered by **${trigger}**. It is active with run protection on. Open it to edit the steps.`;
    }
    if (/dashboard|pipeline|forecast|how (?:is|are) (?:my|the) (?:deals|pipeline)/.test(l)) return pipelineReport();
    if (/no next step|stale|slipp|at risk/.test(l)) {
      const items = openOpps().filter((o) => !o.nextStep || o.closeDate < Date.now());
      return items.length ? `${items.length} open opportunit${items.length === 1 ? 'y needs' : 'ies need'} attention:\n${items.map((o) => `- ${oppLink(o)} (${fmtMoney(o.amount)}, ${o.stage}): ${!o.nextStep ? 'no next step' : 'close date has passed'}`).join('\n')}` : 'Every open opportunity has a next step and a future close date.';
    }
    if (/draft|write/.test(l) && /(recap|follow[- ]?up|summary)/.test(l)) {
      const co = findCompany(t);
      let mt = co ? S.meetings.filter((x) => x.companyId === co.id && x.status === 'processed').sort((a, b) => b.startsAt - a.startsAt)[0] : null;
      if (!mt) mt = S.meetings.filter((x) => x.status === 'processed').sort((a, b) => b.startsAt - a.startsAt)[0];
      if (!mt) return 'There are no processed calls to recap yet. Record a meeting and generate its summary first.';
      const c = mt.attendeeIds.map((id) => byId('contacts', id)).filter(Boolean)[0];
      if (!c) return `${mt.title} has no external attendees to email.`;
      const r = draftRecapReview(mt, c);
      S.reviews.unshift(r);
      return `Drafted a recap for ${ctLink(c)} based on **${mt.title}** (${fmtDate(mt.startsAt)}). It is waiting in [For review](#/review) so you can edit before sending.\n\n\`\`\`\n${r.draft}\n\`\`\``;
    }
    if (/draft|write|compose/.test(l) && /(intro|email|message|note)/.test(l)) {
      const c = findContact(t) || (findCompany(t) ? contactsOf(findCompany(t).id)[0] : null);
      if (!c) return 'Who should the email go to? Name a contact or company, for example "draft an intro to Lucía at Tidewater".';
      const co = byId('companies', c.companyId);
      const ref = S.companies.find((x) => x.arr > 0 && x.id !== c.companyId);
      const draft = `Hi ${c.name.split(' ')[0]},\n\nWe help sales teams at ${co ? co.industry.toLowerCase() : 'B2B'} companies keep their CRM accurate without reps typing after every call.${ref ? ` Teams like ${ref.name} use us to cut pipeline review prep from hours to minutes.` : ''}\n\nWould a 20 minute walkthrough next week be useful?\n\n${me().name.split(' ')[0]}`;
      S.reviews.unshift({ id: uid('rv'), type: 'email_draft', title: `Intro email to ${c.name}`, objectType: 'contact', objectId: c.id, draft, reason: 'Drafted from chat.', sourceMeetingId: null, status: 'pending', createdAt: Date.now() });
      return `Here is an intro to ${ctLink(c)}${co ? ` (${c.title}, ${co.name})` : ''}. It is also in [For review](#/review).\n\n\`\`\`\n${draft}\n\`\`\``;
    }
    if (/(meeting|call)s?\b/.test(l) && /(today|tomorrow|this week|upcoming|next)/.test(l)) {
      const now = Date.now();
      const end = /today/.test(l) ? new Date().setHours(23, 59, 59) : /tomorrow/.test(l) ? now + 2 * DAY : now + 7 * DAY;
      const items = S.meetings.filter((x) => x.startsAt >= now - 30 * MIN && x.startsAt <= end).sort((a, b) => a.startsAt - b.startsAt);
      return items.length ? `${items.length} meeting${items.length === 1 ? '' : 's'}:\n${items.map((x) => `- [${x.title}](#/meetings/${x.id}) — ${fmtDateTime(x.startsAt)}${willRecord(x) ? ' (will record)' : ''}`).join('\n')}` : 'No meetings in that window.';
    }
    if (/(show|list|find|which|who|give me|get).*(contact|lead|people|person)/.test(l)) {
      const status = LEAD_STATUSES.find((s) => l.includes(s.toLowerCase()));
      const co = findCompany(t);
      let items = S.contacts.filter((c) => (!status || c.leadStatus === status) && (!co || c.companyId === co.id));
      if (!items.length) return 'No contacts match that.';
      return `${items.length} contact${items.length === 1 ? '' : 's'}${status ? ' with status ' + status : ''}${co ? ' at ' + co.name : ''}:\n\n| Name | Title | Company | Status |\n|---|---|---|---|\n${items.slice(0, 25).map((c) => `| ${ctLink(c)} | ${c.title} | ${companyName(c.companyId)} | ${c.leadStatus} |`).join('\n')}`;
    }
    if (/(show|list|find|which|give me|get).*(compan|account)/.test(l)) {
      const seg = SEGMENTS.find((s) => l.includes(s.toLowerCase()));
      const fund = FUNDING.find((s) => l.includes(s.toLowerCase()));
      const items = S.companies.filter((c) => (!seg || c.segment === seg) && (!fund || c.funding === fund));
      return `${items.length} compan${items.length === 1 ? 'y' : 'ies'}${seg ? ' in ' + seg : ''}${fund ? ' at ' + fund : ''}:\n\n| Company | Industry | Segment | Funding | ARR |\n|---|---|---|---|---|\n${items.map((c) => `| ${coLink(c)} | ${c.industry} | ${c.segment} | ${c.funding} | ${fmtMoney(c.arr)} |`).join('\n')}`;
    }
    if (/review|pending|approve/.test(l)) {
      const p = pendingReviews();
      return p.length ? `${p.length} update${p.length === 1 ? '' : 's'} waiting in [For review](#/review):\n${p.slice(0, 8).map((r) => `- ${r.title}`).join('\n')}` : 'Nothing is waiting for review.';
    }
    const co = findCompany(t), ct = findContact(t);
    if (ct && (!co || norm(ct.name).length >= norm(co.name).length || l.includes(norm(ct.name)))) {
      const c = ct, cco = byId('companies', c.companyId);
      const mts = S.meetings.filter((x) => x.attendeeIds.includes(c.id));
      return `${ctLink(c)} is ${c.title || 'a contact'}${cco ? ` at ${coLink(cco)}` : ''}. Lead status **${c.leadStatus}**, owned by ${userName(c.owner)}, source ${c.source}.${c.email ? ` Email: ${c.email}.` : ''} ${mts.length ? `${mts.length} meeting${mts.length === 1 ? '' : 's'} on record, most recent ${fmtDate(mts.sort((a, b) => b.startsAt - a.startsAt)[0].startsAt)}.` : 'No meetings yet.'}`;
    }
    if (co) {
      const cts = contactsOf(co.id), opps = oppsOf(co.id), mts = meetingsOf(co.id);
      return `${coLink(co)} is a ${co.segment} ${co.industry.toLowerCase()} company (${co.size} people, ${co.funding}) owned by ${userName(co.owner)}. ARR ${fmtMoney(co.arr)}.\n\n**Contacts**: ${cts.length ? cts.map((c) => `${ctLink(c)} (${c.title}, ${c.leadStatus})`).join(', ') : 'none'}\n\n**Opportunities**: ${opps.length ? opps.map((o) => `${oppLink(o)} — ${fmtMoney(o.amount)}, ${o.stage}`).join('; ') : 'none'}\n\n**Meetings**: ${mts.length ? mts.map((x) => `[${x.title}](#/meetings/${x.id}) (${fmtDate(x.startsAt)})`).join(', ') : 'none'}${mts[0] && mts[0].summary ? `\n\n**Last call**: ${mts[0].summary}` : ''}`;
    }
    return `I am not sure how to do that yet. I can create contacts, companies, opportunities and automations, draft recap or intro emails, build a pipeline dashboard, and look up any record. Type **help** for examples.`;
  }
  function sendChat(chatId, text) {
    let chat = chatId === 'new' ? null : byId('chats', chatId);
    if (!chat) {
      chat = { id: uid('ch'), title: text.length > 42 ? text.slice(0, 40) + '…' : text, createdAt: Date.now(), messages: [] };
      S.chats.unshift(chat);
    }
    chat.messages.push({ role: 'user', text, ts: Date.now() });
    const reply = respond(text);
    chat.messages.push({ role: 'assistant', text: reply, ts: Date.now() + 1 });
    save();
    if (route.page !== 'chat' || route.id !== chat.id) go('#/chat/' + chat.id); else render();
  }

  /* ---------- Search (⌘K) ---------- */
  function searchAll(q) {
    const t = q.toLowerCase().trim();
    if (!t) return [];
    const hit = (s) => (s || '').toLowerCase().includes(t);
    const out = [];
    S.contacts.forEach((c) => { if (hit(c.name) || hit(c.email) || hit(c.title)) out.push({ icon: icons.user, label: c.name, sub: `${c.title} · ${companyName(c.companyId)}`, type: 'Contact', href: '#/contacts/' + c.id }); });
    S.companies.forEach((c) => { if (hit(c.name) || hit(c.domain) || hit(c.industry)) out.push({ icon: icons.building, label: c.name, sub: c.industry, type: 'Company', href: '#/companies/' + c.id }); });
    S.opportunities.forEach((o) => { if (hit(o.name)) out.push({ icon: icons.target, label: o.name, sub: `${o.stage} · ${fmtMoney(o.amount)}`, type: 'Opportunity', href: '#/opportunities/' + o.id }); });
    S.meetings.forEach((m) => { if (hit(m.title) || hit(m.summary)) out.push({ icon: icons.video, label: m.title, sub: fmtDateTime(m.startsAt), type: 'Meeting', href: '#/meetings/' + m.id }); });
    S.automations.forEach((a) => { if (hit(a.name) || hit(a.description)) out.push({ icon: icons.flow, label: a.name, sub: a.trigger, type: 'Automation', href: '#/automations/' + a.id }); });
    S.lists.forEach((l) => { if (hit(l.name)) out.push({ icon: icons.list, label: l.name, sub: l.objectType + ' list', type: 'List', href: '#/lists/' + l.id }); });
    S.knowledge.forEach((k) => { if (hit(k.title) || hit(k.body)) out.push({ icon: icons.note, label: k.title, sub: 'Knowledge', type: 'Note', href: '#/knowledge/' + k.id }); });
    S.chats.forEach((c) => { if (hit(c.title)) out.push({ icon: icons.chat, label: c.title, sub: 'Chat', type: 'Chat', href: '#/chat/' + c.id }); });
    return out.slice(0, 30);
  }
  function openSearch() {
    openModal({ cls: 'cmdk', body: `<input id="cmdk-input" placeholder="Search contacts, companies, deals, meetings, automations…" autocomplete="off"><div class="results" id="cmdk-results"><div class="empty">Type to search across your workspace.</div></div>`,
      onOpen(host) {
        const inp = host.querySelector('#cmdk-input'), res = host.querySelector('#cmdk-results');
        let sel = 0, items = [];
        const draw = () => { res.innerHTML = items.length ? items.map((r, i) => `<a class="list-row link ${i === sel ? 'sel' : ''}" href="${r.href}" data-action="cmdk-go">${r.icon}<span class="grow">${esc(r.label)}<br><span class="sub">${esc(r.sub)}</span></span><span class="chip gray">${r.type}</span></a>`).join('') : `<div class="empty">${inp.value ? 'No results.' : 'Type to search across your workspace.'}</div>`; };
        inp.addEventListener('input', () => { items = searchAll(inp.value); sel = 0; draw(); });
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown') { sel = Math.min(items.length - 1, sel + 1); draw(); e.preventDefault(); }
          else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); draw(); e.preventDefault(); }
          else if (e.key === 'Enter' && items[sel]) { closeModal(); go(items[sel].href); }
        });
      } });
  }

  /* ---------- Actions ---------- */
  const A = {
    'open-search': openSearch,
    'open-notifications': () => {
      const items = S.activity.slice(0, 20);
      const fails = S.automations.filter((a) => a.lastFailed && a.lastFailed > Date.now() - 3 * DAY);
      openModal({ title: 'Notifications', body: `<div class="modal-body"><div class="list">${fails.map((a) => `<a class="list-row link" href="#/automations/${a.id}" data-action="modal-go">${icons.warn}<span class="grow">${esc(a.name)} failed<br><span class="sub">${timeAgo(a.lastFailed)}</span></span></a>`).join('')}${items.map((i) => `<div class="list-row">${icons.refresh}<span class="grow">${esc(i.title)}<br><span class="sub">${esc(relatedName(i.objectType, i.objectId))} · ${timeAgo(i.ts)}</span></span></div>`).join('')}${!items.length && !fails.length ? '<div class="empty">No notifications yet.</div>' : ''}</div></div>` });
    },
    'help': () => openModal({ title: 'Help', body: `<div class="modal-body"><p style="margin-bottom:10px">This is a Lightfield-style CRM. Meetings get recorded based on your preference, summaries turn into follow-ups and proposed record updates, and automations react to changes in your records.</p><ul style="padding-left:18px;color:var(--text-2)"><li>Press <b>⌘K</b> / <b>Ctrl+K</b> to search anything.</li><li>Click a cell in any table to edit it inline.</li><li>Drag cards between stages on the opportunity board.</li><li>Open a meeting and "Simulate call now" to see the review queue fill up.</li><li>Ask the chat to create records, draft emails or build a dashboard.</li></ul></div>` }),
    'toggle-theme': () => { S.settings.theme = S.settings.theme === 'dark' ? 'light' : 'dark'; save(); rerender(); },
    'toggle-sidebar': () => { ui.sidebarOpen = !ui.sidebarOpen; rerender(); },
    'toggle-chats': (el, e) => { e.preventDefault(); ui.allChats = !ui.allChats; rerender(); },
    'sort': (el) => { const k = el.dataset.table, c = el.dataset.col; const cur = ui.sort[k]; ui.sort[k] = cur && cur.key === c ? { key: c, dir: -cur.dir } : { key: c, dir: 1 }; rerender(); },
    'close-panel': () => go('#/automations'),
    'tab': (el) => { ui.tab[el.dataset.tab] = el.dataset.value; rerender(); },
    'opp-view': (el) => { S.settings.oppView = el.dataset.value; save(); rerender(); },
    'run-automation': (el) => { const a = byId('automations', el.dataset.id); if (!a) return; recordRun(a, true, 'Manual run'); save(); toast(`Ran "${a.name}"`); rerender(); },
    'toggle-automation': (el) => { const a = byId('automations', el.dataset.id); if (!a) return; a.status = a.status === 'Active' ? 'Paused' : 'Active'; save(); rerender(); },
    'toggle-run-protection': (el) => { const a = byId('automations', el.dataset.id); if (!a) return; a.runProtection = !a.runProtection; save(); rerender(); },
    'automation-menu': (el) => {
      const a = byId('automations', el.dataset.id); if (!a) return;
      openModal({ title: a.name, body: `<div class="modal-body"><div class="list"><button class="list-row link btn ghost" style="justify-content:flex-start;height:auto" data-action="duplicate-automation" data-id="${a.id}">${icons.plus}<span class="grow">Duplicate</span></button><button class="list-row link btn ghost danger" style="justify-content:flex-start;height:auto" data-action="delete-automation" data-id="${a.id}">${icons.trash}<span class="grow">Delete</span></button></div></div>` });
    },
    'duplicate-automation': (el) => { const a = byId('automations', el.dataset.id); if (!a) return; const copy = JSON.parse(JSON.stringify(a)); copy.id = uid('au'); copy.name = a.name + ' (copy)'; copy.runs = 0; copy.runLog = []; copy.lastRun = null; copy.lastFailed = null; copy.status = 'Paused'; copy.createdAt = Date.now(); copy.createdBy = S.settings.userId; S.automations.push(copy); save(); closeModal(); go('#/automations/' + copy.id); },
    'delete-automation': (el) => { const a = byId('automations', el.dataset.id); if (!a || !confirm(`Delete "${a.name}"?`)) return; S.automations = S.automations.filter((x) => x.id !== a.id); save(); closeModal(); go('#/automations'); },
    'new-automation': () => openModal({ title: 'New automation', form: true, body: F.text('name', 'Name', '', 'required') + F.select('trigger', 'Trigger', TRIGGERS, 'Meeting updated') + F.text('cadence', 'Schedule (only for Schedule trigger)', 'Daily, 9:00') + F.textarea('description', 'What should it do?') + F.textarea('steps', 'Steps (one per line)'),
      onSubmit: (d) => { const a = createAutomation(d); go('#/automations/' + a.id); } }),
    'new-contact': (el) => openModal({ title: 'New contact', form: true, body: F.row(F.text('name', 'Name', '', 'required'), F.text('email', 'Email')) + F.row(F.text('title', 'Title'), F.select('companyId', 'Company', companyOptions(), el.dataset.company || '')) + F.row(F.select('leadStatus', 'Lead status', LEAD_STATUSES, 'New'), F.select('owner', 'Owner', userOptions(), S.settings.userId)) + F.select('source', 'Source', SOURCES.concat(['Manual']), 'Manual'),
      onSubmit: (d) => { const c = createContact(d); go('#/contacts/' + c.id); } }),
    'new-company': () => openModal({ title: 'New company', form: true, body: F.row(F.text('name', 'Name', '', 'required'), F.text('domain', 'Domain')) + F.row(F.text('industry', 'Industry'), F.select('segment', 'Segment', SEGMENTS, 'SMB')) + F.row(F.select('size', 'Size', SIZES, '11-50'), F.select('funding', 'Funding', FUNDING, 'Seed')) + F.row(F.select('owner', 'Owner', userOptions(), S.settings.userId), F.select('source', 'Source', SOURCES.concat(['Manual']), 'Manual')),
      onSubmit: (d) => { const c = createCompany(d); go('#/companies/' + c.id); } }),
    'new-opportunity': (el) => openModal({ title: 'New opportunity', form: true, body: F.text('name', 'Name', el.dataset.company ? companyName(el.dataset.company) + ' — ' : '', 'required') + F.row(F.select('companyId', 'Company', companyOptions(), el.dataset.company || ''), F.select('stage', 'Stage', STAGES, 'Discovery')) + F.row(F.number('amount', 'Amount ($)', ''), F.date('closeDate', 'Close date', toDateInput(Date.now() + 30 * DAY))) + F.row(F.select('owner', 'Owner', userOptions(), S.settings.userId), F.text('nextStep', 'Next step')),
      onSubmit: (d) => { const o = createOpportunity(d); go('#/opportunities/' + o.id); } }),
    'new-meeting': () => openModal({ title: 'New meeting', form: true, body: F.text('title', 'Title', '', 'required') + F.row(F.datetime('startsAt', 'When', toDateTimeInput(Date.now() + HOUR)), F.number('durationMin', 'Length (min)', 30)) + F.select('companyId', 'Company', companyOptions(), '') + `<div class="field"><label>External attendees</label><select name="attendeeIds" multiple size="6">${S.contacts.map((c) => `<option value="${c.id}">${esc(c.name)} — ${esc(companyName(c.companyId))}</option>`).join('')}</select></div>`,
      onSubmit: (d) => { const m = createMeeting(d); go('#/meetings/' + m.id); } }),
    'new-task': (el) => openModal({ title: 'New task', form: true, body: F.text('title', 'Task', '', 'required') + F.datetime('due', 'Due', toDateTimeInput(Date.now() + DAY)),
      onSubmit: (d) => { createTask({ ...d, objectType: el.dataset.type || null, objectId: el.dataset.id || null }); rerender(); } }),
    'new-list': (el) => openModal({ title: 'New list', form: true, body: F.text('name', 'Name', '', 'required') + F.row(F.select('objectType', 'Records', [{ v: 'contact', t: 'Contacts' }, { v: 'company', t: 'Companies' }], 'contact'), F.select('section', 'Show under', [{ v: 'favorites', t: 'Favorites' }, { v: 'demand', t: 'Demand' }], el.dataset.section || 'demand')) + F.row(F.select('filterKey', 'Filter field', [{ v: '', t: '— None (manual) —' }, { v: 'leadStatus', t: 'Lead status (contacts)' }, { v: 'source', t: 'Source' }, { v: 'segment', t: 'Segment (companies)' }, { v: 'funding', t: 'Funding (companies)' }, { v: 'industry', t: 'Industry (companies)' }], ''), F.text('filterValue', 'Equals')),
      onSubmit: (d) => { const l = { id: uid('ls'), name: d.name.trim(), objectType: d.objectType, section: d.section, filter: d.filterKey && d.filterValue ? { [d.filterKey]: d.filterValue.trim() } : {}, memberIds: [], createdAt: Date.now() }; S.lists.push(l); go('#/lists/' + l.id); } }),
    'toggle-list-section': (el) => { const l = byId('lists', el.dataset.id); if (!l) return; l.section = l.section === 'favorites' ? 'demand' : 'favorites'; save(); rerender(); },
    'delete-list': (el) => { const l = byId('lists', el.dataset.id); if (!l || !confirm(`Delete list "${l.name}"?`)) return; S.lists = S.lists.filter((x) => x.id !== l.id); save(); go('#/up-next'); },
    'new-knowledge': () => openModal({ title: 'New note', form: true, body: F.text('title', 'Title', '', 'required') + F.textarea('body', 'Content'), onSubmit: (d) => { const k = { id: uid('kn'), title: d.title.trim(), body: d.body || '', updatedAt: Date.now(), tags: [] }; S.knowledge.unshift(k); go('#/knowledge/' + k.id); } }),
    'delete-knowledge': (el) => { const k = byId('knowledge', el.dataset.id); if (!k || !confirm(`Delete "${k.title}"?`)) return; S.knowledge = S.knowledge.filter((x) => x.id !== k.id); save(); go('#/knowledge'); },
    'new-skill': () => openModal({ title: 'New skill', form: true, body: F.text('name', 'Name', '', 'required') + F.textarea('description', 'What does it do?'), onSubmit: (d) => { S.skills.push({ id: uid('sk'), name: d.name.trim(), description: d.description || '', enabled: true, uses: 0 }); rerender(); } }),
    'toggle-skill': (el) => { const s = byId('skills', el.dataset.id); if (!s) return; s.enabled = !s.enabled; save(); rerender(); },
    'approve-all': () => { const p = pendingReviews(); if (!p.length || !confirm(`Approve all ${p.length} updates?`)) return; p.forEach(applyReview); save(); toast(`Applied ${p.length} updates`); rerender(); },
    'review-approve': (el) => { const r = byId('reviews', el.dataset.id); if (!r) return; applyReview(r); save(); toast(r.type === 'email_draft' ? 'Email sent' : 'Update applied'); rerender(); },
    'review-dismiss': (el) => { const r = byId('reviews', el.dataset.id); if (!r) return; r.status = 'dismissed'; r.resolvedAt = Date.now(); save(); rerender(); },
    'draft-intro': (el) => { const c = byId('contacts', el.dataset.id); if (c) sendChat('new', `Draft an intro email to ${c.name}`); },
    'draft-recap': (el) => { const m = byId('meetings', el.dataset.id); if (m) sendChat('new', `Draft a recap email for ${m.title}`); },
    'research-company': (el) => { const co = byId('companies', el.dataset.id); if (!co) return; researchCompany(co); const a = byId('automations', 'au_12'); if (a) recordRun(a, true, 'Manual research'); save(); rerender(); },
    'delete-record': (el) => {
      const coll = el.dataset.coll, id = el.dataset.id, obj = byId(coll, id);
      if (!obj || !confirm(`Delete ${obj.name || obj.title}? This cannot be undone.`)) return;
      S[coll] = S[coll].filter((x) => x.id !== id);
      if (coll === 'companies') { S.contacts.forEach((c) => { if (c.companyId === id) c.companyId = null; }); S.opportunities = S.opportunities.filter((o) => o.companyId !== id); S.meetings.forEach((m) => { if (m.companyId === id) m.companyId = null; }); }
      if (coll === 'contacts') S.meetings.forEach((m) => { m.attendeeIds = m.attendeeIds.filter((x) => x !== id); });
      S.reviews = S.reviews.filter((r) => !(r.objectId === id));
      S.tasks = S.tasks.filter((t) => t.objectId !== id);
      save(); go('#/' + coll);
    },
    'toggle-record': (el) => { const m = byId('meetings', el.dataset.id); if (!m) return; m.recordOverride = !willRecord(m); save(); rerender(); },
    'mark-recorded': (el) => { const m = byId('meetings', el.dataset.id); if (!m) return; m.recorded = true; m.status = 'recorded'; m.transcriptLines = 250; save(); rerender(); },
    'simulate-meeting': (el) => {
      const m = byId('meetings', el.dataset.id); if (!m) return;
      const rec = willRecord(m);
      m.startsAt = Date.now() - m.durationMin * MIN;
      if (rec) { m.recorded = true; m.status = 'recorded'; processMeeting(m); toast('Call processed: summary, follow-ups and proposed updates are ready'); }
      else { m.status = 'not_recorded'; toast('The call happened but was not recorded'); }
      save(); rerender();
    },
    'process-meeting': (el) => { const m = byId('meetings', el.dataset.id); if (!m) return; processMeeting(m); save(); toast('Summary generated'); rerender(); },
    'suggest': (el) => { const id = route.page === 'chat' && route.id ? route.id : 'new'; sendChat(id, el.dataset.text); },
    'delete-chat': (el) => { const c = byId('chats', el.dataset.id); if (!c || !confirm('Delete this chat?')) return; S.chats = S.chats.filter((x) => x.id !== c.id); save(); go('#/chat/new'); },
    'pick-recording': (el) => { S.settings.recording = el.dataset.value; save(); rerender(); },
    'finish-onboarding': () => { S.settings.onboarded = true; save(); go('#/up-next'); render(); },
    'export': () => { const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'crm-export.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); },
    'reset': () => { if (!confirm('Reset everything to the sample workspace? Your changes will be lost.')) return; resetAll(); toast('Workspace reset'); go('#/up-next'); render(); },
    'modal-close': closeModal,
    'modal-backdrop': (el, e) => { if (e.target === el) closeModal(); },
    'modal-go': closeModal,
    'cmdk-go': closeModal,
  };

  /* ---------- Inline edits ---------- */
  const NUMERIC = { amount: 1, arr: 1, durationMin: 1 };
  function applyEdit(el) {
    const [coll, id, field] = el.dataset.edit.split(':');
    let value = el.type === 'checkbox' ? el.checked : el.value;
    if (coll === 'settings') { S.settings[field] = value; save(); if (field === 'theme' || field === 'workspace') rerender(); return; }
    const obj = byId(coll, id);
    if (!obj) return;
    const prev = obj[field];
    if (NUMERIC[field]) value = value === '' ? 0 : Number(value);
    else if (field === 'closeDate' || field === 'startsAt') value = value ? new Date(value).getTime() : null;
    else if (field === 'companyId') value = value || null;
    if (value === prev) return;
    obj[field] = value;
    if (coll === 'knowledge') obj.updatedAt = Date.now();
    if (coll === 'opportunities' && field === 'stage') {
      logActivity({ objectType: 'opportunity', objectId: id, title: `Stage changed`, text: `${prev} → ${value}` });
      if (obj.companyId) logActivity({ objectType: 'company', objectId: obj.companyId, title: `${obj.name}: ${prev} → ${value}` });
      runHooks('opportunity.updated', obj);
    } else if (coll === 'contacts' && field === 'leadStatus') {
      logActivity({ objectType: 'contact', objectId: id, title: 'Lead status changed', text: `${prev} → ${value}` });
    } else if (coll === 'meetings' && field === 'startsAt') {
      if (value > Date.now() && obj.status !== 'processed') obj.status = 'upcoming';
    }
    save();
    const tag = el.tagName;
    if (tag === 'SELECT' || el.type === 'date' || el.type === 'datetime-local' || el.type === 'checkbox') { ui.noFocus = true; rerender(); }
  }

  /* ---------- Event wiring ---------- */
  document.addEventListener('click', (e) => {
    const actEl = e.target.closest('[data-action]');
    if (actEl) {
      const fn = A[actEl.dataset.action];
      if (fn) {
        if (actEl.tagName === 'A' && actEl.dataset.action !== 'cmdk-go' && actEl.dataset.action !== 'modal-go') e.preventDefault();
        if (actEl.type === 'checkbox') return; // handled on change
        fn(actEl, e);
        return;
      }
    }
    const row = e.target.closest('[data-href]');
    if (row && !e.target.closest('input, select, button, a, textarea')) { go(row.dataset.href); return; }
    if (ui.sidebarOpen && !e.target.closest('.sidebar') && !e.target.closest('.menu-btn')) { ui.sidebarOpen = false; rerender(); }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset && t.dataset.edit) { applyEdit(t); return; }
    if (t.dataset && t.dataset.action === 'toggle-task') { const task = byId('tasks', t.dataset.id); if (task) { task.done = t.checked; save(); rerender(); } }
  });
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset && t.dataset.search != null) { ui.search[t.dataset.search] = t.value; ui.focusSearch = t.dataset.search; rerender(); return; }
    if (t.matches && t.matches('.chat-composer textarea')) { ui.chatDraft = t.value; autoGrow(t); }
  });
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-form]');
    if (!form) return;
    e.preventDefault();
    const kind = form.dataset.form;
    const fd = new FormData(form);
    const data = {};
    fd.forEach((v, k) => { if (k in data) { data[k] = [].concat(data[k], v); } else data[k] = v; });
    if (form.querySelector('[name=attendeeIds]')) data.attendeeIds = fd.getAll('attendeeIds');
    if (kind === 'chat') { const text = (data.text || '').trim(); if (!text) return; ui.chatDraft = ''; sendChat(form.dataset.id, text); return; }
    if (kind === 'add-note') { const text = (data.text || '').trim(); if (!text) return; S.notes.unshift({ id: uid('nt'), objectType: form.dataset.type, objectId: form.dataset.id, text, authorId: S.settings.userId, createdAt: Date.now() }); save(); rerender(); return; }
    if (kind === 'modal' && ui.modal && ui.modal.onSubmit) { const h = ui.modal.onSubmit; closeModal(); h(data); save(); }
  });
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); return; }
    if (e.key === 'Escape') { if ($('#modal')) { closeModal(); return; } if (route.page === 'automations' && route.id) go('#/automations'); return; }
    if (e.key === 'Enter' && !e.shiftKey && e.target.matches && e.target.matches('.chat-composer textarea')) { e.preventDefault(); e.target.form.requestSubmit(); }
  });
  // Drag & drop on the board
  document.addEventListener('dragstart', (e) => { const c = e.target.closest && e.target.closest('[data-drag-id]'); if (!c) return; ui.dragId = c.dataset.dragId; c.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', ui.dragId); } catch (x) { /* ignore */ } });
  document.addEventListener('dragend', (e) => { $$('.dragging').forEach((x) => x.classList.remove('dragging')); $$('.col.drag-over').forEach((x) => x.classList.remove('drag-over')); });
  document.addEventListener('dragover', (e) => { const col = e.target.closest && e.target.closest('[data-drop-stage]'); if (!col || !ui.dragId) return; e.preventDefault(); $$('.col.drag-over').forEach((x) => { if (x !== col) x.classList.remove('drag-over'); }); col.classList.add('drag-over'); });
  document.addEventListener('drop', (e) => {
    const col = e.target.closest && e.target.closest('[data-drop-stage]'); if (!col || !ui.dragId) return;
    e.preventDefault();
    const o = byId('opportunities', ui.dragId); const stage = col.dataset.dropStage; ui.dragId = null;
    if (!o || o.stage === stage) return;
    const prev = o.stage; o.stage = stage;
    logActivity({ objectType: 'opportunity', objectId: o.id, title: 'Stage changed', text: `${prev} → ${stage}` });
    runHooks('opportunity.updated', o); save(); rerender();
  });

  /* ---------- Init ---------- */
  S = load();
  if (!S.activity) S.activity = [];
  if (!location.hash) location.hash = '#/up-next';
  render();
  window.CRM = { state: () => S, save, reset: resetAll, respond };
})();
