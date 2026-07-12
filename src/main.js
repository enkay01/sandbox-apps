const emptyCompany = { name: '', website: '', headquarters: '', industry: '', description: '', fitReasons: [''], objectivesMatched: [''], evidenceUrls: [''], confidence: 'medium', notes: '' };
const starterCompanies = [{ name: 'Sample Mobility AI Ltd', website: 'https://example.com', headquarters: 'London, UK', industry: 'Transport technology', description: 'Example record showing the JSON shape expected after Codex researches companies online.', fitReasons: ['UK-based', 'Builds software for transport operators', 'Has public evidence of deployments'], objectivesMatched: ['Find B2B transport tech suppliers', 'Prioritize companies with clear public traction'], evidenceUrls: ['https://example.com/about', 'https://example.com/case-studies'], confidence: 'medium', notes: 'Replace this with sourced findings.' }];
let brief = { industry: 'Transport technology', location: 'United Kingdom', technology: 'Software, data platforms, AI, fleet, logistics, rail, bus, micromobility, or infrastructure tools', jobRole: 'Product, engineering, or go-to-market roles related to transport technology', objectives: 'Find companies building relevant technology products. Prioritize B2B vendors with public evidence and likely hiring relevance for the target role.', mustHave: 'Company name, website, HQ/location, short description, why it matches, source URLs.', exclude: 'Pure consultancies with no product; inactive companies; companies without a useful web presence.', maxResults: 25 };
let companies = starterCompanies;
let jsonText = JSON.stringify(starterCompanies, null, 2);
let message = '';
let selectedCompanyIndex = 0;

const app = document.getElementById('app');
const sandboxApps = [
  { id: 'home', label: 'Home', route: '#/' },
  { id: 'job-search', label: 'Job Search App', route: '#/job-search' }
];
const esc = value => String(value ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const route = () => window.location.hash === '#/job-search' ? 'job-search' : 'home';
const promptText = () => `Find companies matching this brief and return only valid JSON matching the schema below.\n\nIndustry: ${brief.industry}\nLocation: ${brief.location}\nTechnology focus: ${brief.technology}\nTarget job role: ${brief.jobRole}\nObjectives: ${brief.objectives}\nMust include: ${brief.mustHave}\nExclude: ${brief.exclude}\nMaximum results: ${brief.maxResults}\n\nResearch online. Use multiple search queries and cite evidence URLs for each company. Prefer official company pages, credible directories, news, funding databases, and public case studies.\n\nJSON schema:\n[\n  {\n    "name": "Company name",\n    "website": "https://...",\n    "headquarters": "City, Country",\n    "industry": "Specific category",\n    "description": "1-2 sentence summary",\n    "fitReasons": ["reason tied to brief"],\n    "objectivesMatched": ["objective satisfied"],\n    "evidenceUrls": ["https://source-1", "https://source-2"],\n    "confidence": "high|medium|low",\n    "notes": "Optional caveats"\n  }\n]`;
const normalize = company => ({ ...emptyCompany, ...company, fitReasons: Array.isArray(company.fitReasons) ? company.fitReasons : [], objectivesMatched: Array.isArray(company.objectivesMatched) ? company.objectivesMatched : [], evidenceUrls: Array.isArray(company.evidenceUrls) ? company.evidenceUrls : [] });
const setMessage = text => { message = text; renderShell(); if (text) setTimeout(() => { message = ''; renderShell(); }, 1800); };

function renderShell() {
  const currentRoute = route();
  app.innerHTML = `<div class="sandboxShell">
    <aside class="sidebar" aria-label="Sandbox apps">
      <a class="brand" href="#/"><span class="brandMark">S</span><span><strong>Sandbox</strong><small>Static app lab</small></span></a>
      <nav class="sideNav">${sandboxApps.map(item => `<a class="${currentRoute === item.id ? 'active' : ''}" href="${item.route}">${item.label}</a>`).join('')}</nav>
    </aside>
    <section class="workspace">${currentRoute === 'job-search' ? renderJobSearchApp() : renderHome()}</section>
  </div>`;
}

function renderHome() {
  return `<section class="homeHero">
    <p class="eyebrow">Sandbox Home</p>
    <h1>Choose a sandbox app</h1>
    <p class="homeIntro">A small launcher for personal tools hosted from this GitHub Pages site. More experiments can join this list later.</p>
    <div class="pillGrid">
      <a class="appPill" href="#/job-search"><span>Job Search App</span><small>Open the company research workspace</small></a>
    </div>
  </section>`;
}

function renderJobSearchApp() {
  if (selectedCompanyIndex >= companies.length) selectedCompanyIndex = Math.max(0, companies.length - 1);
  return `<section class="hero"><div><p class="eyebrow">Job Search App</p><h1>Company research without the spreadsheet squint</h1><p>Generate a research prompt, paste Codex results, then read each imported company in a calm review layout with source links you can open or copy.</p></div></section>
  <section class="grid two setupGrid"><div class="panel promptPanel"><h2>Generate research prompt</h2><p class="panelIntro">Edit the brief when needed, then generate a prompt for Codex.</p><details class="briefPanel"><summary>Edit research brief</summary>${briefFields()}</details><textarea class="prompt" readonly>${esc(promptText())}</textarea><div class="actions"><button data-action="copyPrompt">Generate prompt</button></div>${message ? `<p class="message">${esc(message)}</p>` : ''}</div>
  <div class="panel importPanel"><h2>Paste Codex results</h2><p class="panelIntro">Paste the JSON array returned by Codex, then import it into the review workspace.</p><textarea class="jsonbox" id="jsonText">${esc(jsonText)}</textarea><div class="actions"><button data-action="importJson">Import results</button><button data-action="downloadJson">Download results JSON</button><button data-action="copyJson">Copy results JSON</button></div></div></section>
  <section class="toolbar"><div><p class="eyebrow">Review workspace</p><h2>Company results (${companies.length})</h2></div><button data-action="addCompany">Add company</button></section><section class="resultsLayout">${renderList()}${renderDetails()}</section>`;
}

function briefFields() { return [['industry','Industry'], ['location','Location'], ['technology','Technology focus'], ['jobRole','Target job role'], ['objectives','Objectives'], ['mustHave','Must include'], ['exclude','Exclude']].map(([key,label]) => `<label>${label}<textarea data-brief="${key}" rows="${['objectives', 'technology', 'jobRole'].includes(key) ? 4 : 2}">${esc(brief[key])}</textarea></label>`).join('') + `<label>Maximum results<input data-brief="maxResults" type="number" min="1" max="100" value="${esc(brief.maxResults)}"></label>`; }
function renderList() {
  return `<div class="companyList" aria-label="Imported companies">${companies.map((company, index) => `<button class="companyListItem ${index === selectedCompanyIndex ? 'active' : ''}" data-action="selectCompany" data-index="${index}">
    <span>${esc(company.name || `Company ${index + 1}`)}</span>
    <small>${esc(company.industry || 'No industry yet')}</small>
    <em>${esc(company.confidence || 'medium')} confidence</em>
  </button>`).join('')}</div>`;
}
function renderDetails() {
  const company = companies[selectedCompanyIndex] || { ...emptyCompany };
  return `<article class="companyDetail">
    <div class="detailHeader"><div><p class="eyebrow">Selected company</p><h3>${esc(company.name || 'Untitled company')}</h3></div><button class="ghost" data-action="removeCompany" data-index="${selectedCompanyIndex}" aria-label="Remove selected company">Remove</button></div>
    <div class="factGrid">
      ${fact('Website', company.website ? `<a href="${esc(company.website)}" target="_blank" rel="noreferrer">${esc(company.website)}</a>` : 'Not provided')}
      ${fact('Headquarters', esc(company.headquarters || 'Not provided'))}
      ${fact('Industry', esc(company.industry || 'Not provided'))}
      ${fact('Confidence', `<span class="confidence ${esc(company.confidence)}">${esc(company.confidence || 'medium')}</span>`)}
    </div>
    ${readBlock('Description', company.description)}
    ${listBlock('Fit reasons', company.fitReasons)}
    ${listBlock('Objectives matched', company.objectivesMatched)}
    ${sourceBlock(company.evidenceUrls)}
    ${readBlock('Notes', company.notes)}
    <details class="editPanel"><summary>Edit company details</summary>${companyEditor(company, selectedCompanyIndex)}</details>
  </article>`;
}
function fact(label, value) { return `<div class="fact"><span>${label}</span><strong>${value}</strong></div>`; }
function readBlock(label, value) { return `<section class="readBlock"><h4>${label}</h4><p>${esc(value || 'Nothing added yet.')}</p></section>`; }
function listBlock(label, values) {
  const items = (Array.isArray(values) ? values : []).filter(Boolean);
  return `<section class="readBlock"><h4>${label}</h4>${items.length ? `<ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>` : '<p>Nothing added yet.</p>'}</section>`;
}
function sourceBlock(urls) {
  const items = (Array.isArray(urls) ? urls : []).filter(Boolean);
  return `<section class="readBlock"><h4>Evidence sources</h4>${items.length ? `<div class="sourceList">${items.map((url, index) => `<div class="sourceRow"><a href="${esc(url)}" target="_blank" rel="noreferrer"><span>Source ${index + 1}</span><small>${esc(url)}</small></a><button class="iconButton" data-action="copySourceUrl" data-url="${esc(url)}" aria-label="Copy source ${index + 1} URL"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8h10v12H8z"></path><path d="M6 16H4V4h12v2"></path></svg></button></div>`).join('')}</div>` : '<p>No sources yet.</p>'}</section>`;
}
function companyEditor(company, index) {
  return `<div class="fields">${['name','website','headquarters','industry'].map(k => `<label>${k[0].toUpperCase()+k.slice(1)}<input data-company="${index}" data-key="${k}" value="${esc(company[k])}"></label>`).join('')}<label>Confidence<select data-company="${index}" data-key="confidence">${['high','medium','low'].map(v => `<option ${company.confidence === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label></div>${textArea(index,'description','Description',company.description)}${textArea(index,'fitReasons','Fit reasons (one per line)',company.fitReasons.join('\n'), true)}${textArea(index,'objectivesMatched','Objectives matched (one per line)',company.objectivesMatched.join('\n'), true)}${textArea(index,'evidenceUrls','Evidence URLs (one per line)',company.evidenceUrls.join('\n'), true)}${textArea(index,'notes','Notes',company.notes)}`;
}
function textArea(i,k,label,value,list=false) { return `<label>${label}<textarea data-company="${i}" data-key="${k}" ${list ? 'data-list="true"' : ''}>${esc(value)}</textarea></label>`; }

app.addEventListener('input', event => {
  const t = event.target;
  if (t.dataset.brief) brief[t.dataset.brief] = t.value;
  if (t.id === 'jsonText') jsonText = t.value;
  if (t.dataset.company) {
    const value = t.dataset.list ? t.value.split('\n').map(v => v.trim()).filter(Boolean) : t.value;
    companies[Number(t.dataset.company)][t.dataset.key] = value;
  }
});
app.addEventListener('click', async event => {
  const button = event.target.closest('button');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'copyPrompt') { await navigator.clipboard.writeText(promptText()); setMessage('Generated prompt and copied it to clipboard.'); }
  if (action === 'copyJson') { await navigator.clipboard.writeText(JSON.stringify(companies, null, 2)); setMessage('Copied results JSON.'); }
  if (action === 'copySourceUrl') { await navigator.clipboard.writeText(button.dataset.url); setMessage('Copied source link.'); }
  if (action === 'downloadJson') { const blob = new Blob([JSON.stringify(companies, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = Object.assign(document.createElement('a'), { href: url, download: 'company-findings.json' }); a.click(); URL.revokeObjectURL(url); }
  if (action === 'importJson') {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error('Top-level JSON must be an array.');
      companies = parsed.map(normalize);
      selectedCompanyIndex = 0;
      setMessage(`Imported ${parsed.length} companies.`);
    } catch (error) {
      setMessage(`Import failed: ${error.message}`);
    }
  }
  if (action === 'addCompany') { companies.push({ ...emptyCompany }); selectedCompanyIndex = companies.length - 1; renderShell(); }
  if (action === 'selectCompany') { selectedCompanyIndex = Number(button.dataset.index); renderShell(); }
  if (action === 'removeCompany') { companies.splice(Number(button.dataset.index), 1); selectedCompanyIndex = Math.max(0, selectedCompanyIndex - 1); renderShell(); }
});
window.addEventListener('hashchange', renderShell);
renderShell();
