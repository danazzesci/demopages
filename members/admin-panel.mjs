const roles = { user: 'User', delegate_admin: 'Delegate admin', superadmin: 'Superadmin' };
const labels = { individual_learner: 'Individual learner', executive: 'Executive', general: 'General' };

export function createAdminPanel(doc) {
  const $ = id => doc.getElementById(id);
  let service, actorId, actorRole, revision = 0, busy = false;
  const el = (tag, text) => { const node = doc.createElement(tag); if (text) node.textContent = text; return node; };
  function clear() {
    revision++;
    service = undefined;
    $('admin').hidden = true;
    $('invite-form').hidden = true;
    $('invite-email').value = '';
    $('admin-members').replaceChildren();
    $('admin-tools').replaceChildren();
    $('admin-status').textContent = '';
  }
  function selectField(title, options, value, disabled) {
    const label = el('label', title), input = el('select');
    for (const [key, text] of Object.entries(options)) {
      const option = el('option', text); option.value = key; input.append(option);
    }
    input.value = value; input.disabled = disabled; label.append(input);
    return { label, input };
  }
  async function load(version) {
    $('admin-members').replaceChildren();
    const rows = await service.adminMembers();
    if (version !== revision) return;
    $('admin-tools').replaceChildren();
    const searchLabel = el('label', 'Find a user');
    const search = el('input'); search.type = 'search'; search.placeholder = 'Search by email'; searchLabel.append(search);
    const filter = selectField('Show', { all: 'All users', pending: 'Not approved', approved: 'Approved', superadmin: 'Superadmins', delegate_admin: 'Delegate admins', user: 'Users' }, 'all', false);
    $('admin-tools').append(searchLabel, filter.label);
    const cards = [];
    const applyFilters = () => {
      let count = 0;
      for (const { row, form } of cards) {
        const matches = (row.email || '').toLowerCase().includes(search.value.trim().toLowerCase()) &&
          (filter.input.value === 'all' || (filter.input.value === 'pending' ? !row.active : filter.input.value === 'approved' ? row.active : row.role === filter.input.value));
        form.hidden = !matches; if (matches) count++;
      }
      $('admin-status').textContent = `${count} of ${rows.length} users shown.`;
    };
    search.addEventListener('input', applyFilters); filter.input.addEventListener('change', applyFilters);
    const delegateOptions = { '': 'No delegate assigned' };
    for (const row of rows) if (row.role === 'delegate_admin' && row.active) delegateOptions[row.user_id] = row.email;
    for (const row of rows) {
      const form = el('form'); form.className = 'member-editor';
      const isSelf = row.user_id === actorId;
      form.append(el('h3', row.email || row.user_id));
      form.append(el('p', `${roles[row.role]} · ${row.active ? 'Approved' : 'Not approved'}${isSelf ? ' · Your account' : ''}`));
      const role = selectField('Role', roles, row.role, actorRole !== 'superadmin' || isSelf);
      form.append(role.label);
      const group = el('fieldset'); group.append(el('legend', 'Audience labels'));
      const labelInputs = [];
      for (const [key, title] of Object.entries(labels)) {
        const label = el('label'), input = el('input'); input.type = 'checkbox'; input.value = key;
        input.checked = row.labels.includes(key); label.append(input, doc.createTextNode(title));
        group.append(label); labelInputs.push(input);
      }
      form.append(group);
      const approval = el('label'), active = el('input'); active.type = 'checkbox'; active.checked = row.active;
      active.disabled = isSelf; approval.append(active, doc.createTextNode('Approved for member access')); form.append(approval);
      let delegate;
      if (actorRole === 'superadmin') {
        delegate = selectField('Assigned delegate', delegateOptions, row.delegate_id || '', row.role !== 'user');
        role.input.addEventListener('change', () => {
          delegate.input.disabled = role.input.value !== 'user';
          if (delegate.input.disabled) delegate.input.value = '';
        });
        form.append(delegate.label);
      }
      const verifyLabel = el('label', 'Fresh authenticator code (required when granting superadmin access)');
      const verifyInput = el('input'); verifyInput.inputMode = 'numeric'; verifyInput.maxLength = 6;
      verifyInput.autocomplete = 'one-time-code'; verifyLabel.append(verifyInput);
      const updateVerification = () => {
        const needed = actorRole === 'superadmin' && role.input.value === 'superadmin' && (row.role !== 'superadmin' || !row.active);
        verifyLabel.hidden = !needed; verifyInput.required = needed;
        if (!needed) verifyInput.value = '';
      };
      role.input.addEventListener('change', updateVerification);
      updateVerification(); form.append(verifyLabel);
      const button = el('button', 'Save member'); button.type = 'submit'; form.append(button);
      form.addEventListener('submit', async event => {
        event.preventDefault();
        if (busy || version !== revision) return;
        busy = true; button.disabled = true; $('admin-load').disabled = true;
        try {
          await service.saveMember({ user_id: row.user_id, role: role.input.value,
            labels: labelInputs.filter(i => i.checked).map(i => i.value), active: active.checked,
            delegate_id: delegate ? delegate.input.value : row.delegate_id,
            ...(verifyInput.value ? { verification_code: verifyInput.value.trim() } : {}) });
          verifyInput.value = '';
          if (version !== revision) return;
          await load(version);
          if (version === revision) $('admin-status').textContent = 'Member saved.';
        } catch (error) {
          if (version === revision) {
            // Hide stale member details if access was revoked while editing.
            $('admin-members').replaceChildren();
            $('admin-status').textContent = `${error.message || 'Unable to save.'} Reload members to try again.`;
          }
        } finally { busy = false; button.disabled = false; $('admin-load').disabled = false; }
      });
      cards.push({ row, form });
      $('admin-members').append(form);
    }
    $('admin-status').textContent = rows.length ? `${rows.length} member${rows.length === 1 ? '' : 's'}.` : 'No members are assigned to you yet.';
  }
  $('invite-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !service || actorRole !== 'superadmin') return;
    const version = revision; busy = true; $('invite-send').disabled = true;
    try {
      const result = await service.inviteMember($('invite-email').value);
      if (version !== revision) return;
      $('invite-email').value = '';
      $('admin-status').textContent = `Invitation sent to ${result.email}. Load members to manage access.`;
    } catch (error) {
      if (version === revision) $('admin-status').textContent = error.message || 'Invitation could not be sent.';
    } finally { busy = false; $('invite-send').disabled = false; }
  });
  $('admin-load').addEventListener('click', async () => {
    if (busy || !service) return;
    const version = revision; busy = true; $('admin-load').disabled = true;
    try { await load(version); }
    catch (error) { if (version === revision) $('admin-status').textContent = error.message || 'Unable to load members.'; }
    finally { busy = false; $('admin-load').disabled = false; }
  });
  return {
    clear,
    configure(nextService, id, role, approved) {
      clear();
      if (!approved || !['superadmin', 'delegate_admin'].includes(role)) return;
      service = nextService; actorId = id; actorRole = role;
      $('admin').hidden = false;
      $('invite-form').hidden = true; // Invitation delivery is not activated for this release.
      $('admin-description').textContent = role === 'superadmin'
        ? 'Manage roles, audience labels, approval and delegate assignments. Labels do not change permissions.'
        : 'Manage labels and approval for the users assigned to you.';
    },
  };
}
