const api = 'https://nrd-reconstruction-service.ds4791.chatgpt.site/';
const get = (id) => document.getElementById(id);
const form = get('search');
const results = get('objects');
const details = get('details');
const excerpt = get('excerpt');
const status = get('result-status');
const retrievalStatus = get('retrieval-status');
const preview = get('preview');
const download = get('download');
const session = get('session-status');
const sessionIdle = session.textContent;
const submit = form.querySelector('button');
let grant;

function add(parent, tag, value, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  parent.append(element);
  return element;
}

function clearResult() {
  grant = undefined;
  results.replaceChildren();
  details.hidden = true;
  excerpt.hidden = true;
  excerpt.querySelector('p').textContent = '';
  get('properties').replaceChildren();
  preview.setAttribute('aria-expanded', 'false');
  preview.disabled = download.disabled = false;
  retrievalStatus.textContent = '';
  session.textContent = sessionIdle;
  status.textContent = 'Awaiting investigation query.';
}

function validIPv4(value) {
  const parts = value.split('.');
  return parts.length === 4 && parts.every((part) => /^(0|[1-9]\d{0,2})$/.test(part) && Number(part) <= 255);
}

for (const name of ['source', 'destination', 'keywords']) {
  form.elements[name].addEventListener('input', (event) => event.target.setCustomValidity(''));
}
form.addEventListener('input', () => { if (grant) clearResult(); });

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = Object.fromEntries(new FormData(form));
  for (const field of ['source', 'destination']) {
    query[field] = query[field].trim();
    if (!validIPv4(query[field])) {
      form.elements[field].setCustomValidity('Enter an IPv4 address with four octets from 0 to 255.');
      form.elements[field].reportValidity();
      return;
    }
  }
  if (!query.keywords.trim()) {
    form.elements.keywords.setCustomValidity('Enter the content keywords.');
    form.elements.keywords.reportValidity();
    return;
  }
  clearResult();
  const fields = Array.from(form.elements);
  fields.forEach((field) => { field.disabled = true; });
  status.textContent = 'Searching recorded traffic…';
  try {
    const response = await fetch(api + 'api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    });
    if (!response.ok) throw new Error('Search unavailable');
    const { objects, token } = await response.json();
    if (objects.length === 0) {
      status.textContent = 'No reconstructed objects matched the supplied search criteria. Verify the investigation parameters and search again.';
      return;
    }
    grant = { object: objects[0], token };
    status.textContent = 'Reconstructed Objects: 1';
    renderObject(grant.object);
  } catch {
    status.textContent = 'The reconstruction service could not complete the query. Try again.';
  } finally {
    fields.forEach((field) => { field.disabled = false; });
    submit.focus();
  }
});

function renderObject(object) {
  session.textContent = object.session + ' · ' + object.observation + ' · ' + object.transferWindow;
  const row = add(results, 'tr');
  for (const value of [object.id, object.protocol, object.source, object.destination, object.filename]) {
    add(row, 'td', value, 'technical');
  }
  add(row, 'td', 'Word document');
  add(row, 'td', 'Reconstructed');
  const select = add(add(row, 'td'), 'button', 'Select object');
  select.type = 'button';
  select.setAttribute('aria-controls', 'details');
  select.setAttribute('aria-expanded', 'false');
  select.addEventListener('click', () => {
    row.dataset.selected = '';
    select.setAttribute('aria-expanded', 'true');
    details.hidden = false;
    get('detail-title').focus();
  });
  for (const [label, value] of [
    ['Document', object.title],
    ['Document ID / revision', object.revision],
    ['Reconstruction source', 'The Nixon Recording Device (NRD)'],
    ['Capture / session', object.session],
    ['Observation point', object.observation],
    ['Captured transfer window', object.transferWindow],
    ['FTP control / data', object.connections],
    ['Gateway handling', object.gateway],
    ['Parent upload', object.parent],
    ['Evidence reference', object.reference],
    ['Recovered file SHA-256', object.sha256],
  ]) {
    if (value) {
      add(get('properties'), 'dt', label);
      add(get('properties'), 'dd', value, 'technical');
    }
  }
}

async function retrieve(button, route, useResponse) {
  const current = grant;
  if (!current) return;
  retrievalStatus.textContent = '';
  button.disabled = true;
  try {
    const response = await fetch(api + route, { headers: { Authorization: 'Bearer ' + current.token } });
    if (!response.ok) throw new Error(response.status === 403 ? 'Access expired. Run the search again.' : 'Object retrieval failed. Try again.');
    await useResponse(response, current);
  } catch (error) {
    if (grant === current) retrievalStatus.textContent = error.message;
  } finally {
    if (grant === current) button.disabled = false;
  }
}

preview.addEventListener('click', () => {
  if (!excerpt.hidden) {
    excerpt.hidden = true;
    preview.setAttribute('aria-expanded', 'false');
    return;
  }
  retrieve(preview, 'api/preview', async (response, current) => {
    const data = await response.json();
    if (grant !== current) return;
    excerpt.querySelector('p').textContent = data.excerpt;
    excerpt.hidden = false;
    preview.setAttribute('aria-expanded', 'true');
  });
});

download.addEventListener('click', () => {
  retrieve(download, 'api/document', async (response, current) => {
    const bytes = await response.blob();
    if (grant !== current) return;
    const url = URL.createObjectURL(bytes);
    const link = add(document.body, 'a');
    link.href = url;
    link.download = current.object.filename;
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  });
});
