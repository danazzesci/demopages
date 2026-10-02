(() => {
  'use strict';
  const storageKey = 'dan-about-access-v1';
  const invitation = 'uvksUenUpRM6gIPmwBDvKCyRgQUXfrM5';
  let allowed = false;
  try { allowed = sessionStorage.getItem(storageKey) === 'yes'; } catch {}
  const hash = new URLSearchParams(location.hash.slice(1));
  if (hash.get('invite') === invitation) {
    allowed = true;
    try { sessionStorage.setItem(storageKey, 'yes'); } catch {}
    history.replaceState(null, '', location.pathname + location.search);
  }
  const standalone = /^\/invited\//.test(location.pathname);
  if (standalone && !allowed) document.documentElement.classList.add('about-access-locked');
  let pending;
  function unlock() {
    allowed = true;
    try { sessionStorage.setItem(storageKey, 'yes'); } catch {}
    document.documentElement.classList.remove('about-access-locked');
  }
  function request() {
    if (allowed) return Promise.resolve(true);
    if (pending) return pending;
    pending = new Promise(resolve => {
      const dialog = document.createElement('dialog');
      dialog.className = 'about-access-dialog';
      dialog.setAttribute('aria-labelledby', 'about-access-title');
      dialog.innerHTML = `<form><h2 id="about-access-title">Invited users only</h2><p>This page is accessible to invited users only. Enter the access code Dan provided.</p><label for="about-access-code">Access code</label><input id="about-access-code" type="password" autocomplete="off" required autofocus><p class="about-access-error" role="status" aria-live="polite"></p><div class="about-access-actions"><button type="button" class="about-access-cancel">Cancel</button><button type="submit">Open About</button></div></form>`;
      const finish = success => {
        if (success) unlock();
        dialog.close(); dialog.remove(); pending = undefined; resolve(success);
      };
      dialog.querySelector('form').addEventListener('submit', event => {
        event.preventDefault();
        if (dialog.querySelector('input').value.trim() === 'daniel') finish(true);
        else {
          dialog.querySelector('[role="status"]').textContent = 'That code isn’t correct. Please try again.';
          dialog.querySelector('input').select();
        }
      });
      dialog.querySelector('.about-access-cancel').addEventListener('click', () => finish(false));
      dialog.addEventListener('cancel', event => { event.preventDefault(); finish(false); });
      document.body.append(dialog); dialog.showModal();
    });
    return pending;
  }
  window.DanAboutAccess = Object.freeze({ request });
  if (standalone && !allowed) document.addEventListener('DOMContentLoaded', async () => {
    if (!await request()) location.replace('/');
  }, { once: true });
})();
