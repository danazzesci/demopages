import { createAdminPanel } from './admin-panel.mjs';
import { safeActionUrl } from './page-utils.mjs';
import { config } from './config.js';
import { createAuthService } from './auth-service.mjs';

const $ = id => document.getElementById(id);
let service, client, pendingFactor, preview = false, generation = 0, working = false;
let recoveringPassword = false;
const adminPanel = createAdminPanel(document);
const message = text => { $('status').textContent = text; };
function clearPrivate() {
  generation++;
  adminPanel.clear();
  $('profile-form').reset();
  $('reset-password-form').reset();
  $('pages').replaceChildren();
  $('identity').textContent = '';
  $('access-note').textContent = '';
  $('secret').value = '';
  $('qr').removeAttribute('src');
  $('code').value = '';
  $('enrollment').hidden = true;
}
function show(stage) {
  for (const id of ['signin', 'mfa', 'account', 'reset-password']) $(id).hidden = id !== stage;
  $('signout').hidden = !service || stage === 'signin' || preview;
  $('leave-preview').hidden = !preview;
}
async function act(button, action) {
  if (working) return;
  working = true;
  button.disabled = true;
  try { await action(); }
  catch (error) { message(error.message || 'Something went wrong. Please try again.'); }
  finally { button.disabled = false; working = false; }
}
async function refresh() {
  clearPrivate();
  show('signin');
  const version = generation;
  const state = await service.state();
  if (version !== generation) return;
  pendingFactor = undefined;
  if (state.stage === 'signin') { message('Choose an account to sign in.'); return; }
  if (state.stage === 'enroll' || state.stage === 'verify') {
    show('mfa');
    const enrolling = state.stage === 'enroll';
    $('mfa-title').textContent = enrolling ? 'Secure your account.' : 'One more step.';
    $('mfa-description').textContent = enrolling ? 'Add this account to an authenticator app, then enter its six-digit code.' : 'Enter the current code from your authenticator app to continue.';
    $('enroll').hidden = !enrolling;
    $('verify-form').hidden = enrolling;
    $('factor-label').hidden = enrolling || state.factors.length < 2;
    $('factor').replaceChildren();
    for (const factor of state.factors) {
      const option = document.createElement('option');
      option.value = factor.id;
      option.textContent = factor.friendly_name || 'Authenticator';
      $('factor').append(option);
    }
    message('Two-factor verification is required before profiles or member resources can be opened.');
    return;
  }
  if (recoveringPassword) {
    show('reset-password');
    message('Two-factor verification complete. Choose a new password.');
    return;
  }
  // Fail closed: keep the private panel hidden until all required reads succeed.
  const [profile, access, pages, role] = await Promise.all([service.profile(), service.membership(), service.pages(), service.role()]);
  if (version !== generation) return;
  for (const name of ['display_name', 'organization', 'interests']) $('profile-form').elements[name].value = profile?.[name] || '';
  $('identity').textContent = state.user.email || 'Signed-in member';
  $('account-label').textContent = 'Your space';
  $('save').textContent = 'Save profile';
  $('access-note').textContent = access?.active ? (pages.length ? 'Your approved member resources.' : 'Your access is approved. No resources have been published yet.') : 'Your account is verified. Member resources will appear here after Dan approves access. You can save your profile now.';
  for (const page of pages) {
    const article = document.createElement('article');
    const title = document.createElement('h3');
    const body = document.createElement('p');
    title.textContent = page.title;
    body.textContent = page.body;
    article.append(title, body);
    const href = safeActionUrl(page.action_url);
    if (href) {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = page.action_label || 'Continue';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'resource-action';
      article.append(link);
    }
    if (page.expires_at) {
      const expiry = document.createElement('p');
      expiry.textContent = `Available until ${new Date(page.expires_at).toLocaleString()}`;
      article.append(expiry);
    }
    $('pages').append(article);
  }
  show('account');
  adminPanel.configure(service, state.user.id, role.role, access?.active === true);
  message('Two-factor verification complete.');
}

let emailPanel = $('login-panel');
async function switchEmailPanel(next, focus) {
  if (next === emailPanel) return;
  const previous = emailPanel;
  const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    typeof previous.animate === 'function';
  if (animate) {
    await previous.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140 }).finished;
  }
  previous.hidden = true;
  emailPanel = next;
  next.hidden = false;
  focus.focus();
  if (animate) {
    await next.animate([
      { opacity: 0, transform: 'translateY(16px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 220, easing: 'ease-out' }).finished;
  }
}
$('show-signup').addEventListener('click', () => act($('show-signup'), async () => {
  message('');
  $('signup-status').textContent = '';
  await switchEmailPanel($('email-signup'), $('signup-heading'));
}));
for (const id of ['back-from-signup', 'back-from-confirmation']) {
  $(id).addEventListener('click', () => act($(id), async () => {
    $('email-signup-form').reset();
    await switchEmailPanel($('login-panel'), $('show-signup'));
  }));
}

$('email-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  act(event.submitter, async () => {
    const { error } = await client.auth.signInWithPassword({
      email: form.elements.email.value.trim(),
      password: form.elements.password.value,
    });
    if (error) throw error;
    form.reset();
    await refresh();
  });
});
$('email-signup-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  act(event.submitter, async () => {
    const status = $('signup-status');
    status.textContent = '';
    const { data, error } = await client.auth.signUp({
      email: form.elements.email.value.trim(),
      password: form.elements.password.value,
      options: { emailRedirectTo: new URL('./', location.href).href },
    });
    if (error) { status.textContent = error.message; return; }
    form.reset();
    if (data.session) {
      await switchEmailPanel($('login-panel'), $('show-signup'));
      await refresh();
      return;
    }
    await switchEmailPanel($('signup-confirmation'), $('confirmation-heading'));
  });
});
$('email-reset-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  act(event.submitter, async () => {
    const status = $('email-reset-status');
    status.textContent = '';
    const { error } = await client.auth.resetPasswordForEmail(form.elements.email.value.trim(), {
      redirectTo: new URL('./', location.href).href,
    });
    status.textContent = error ? error.message : 'If an account can receive a reset link, check your email and open the link in this browser.';
  });
});
$('reset-password-form').addEventListener('submit', event => {
  event.preventDefault();
  act(event.submitter, async () => {
    if (!recoveringPassword || (await service.state()).stage !== 'account') throw new Error('Complete authenticator verification before resetting your password.');
    const { error } = await client.auth.updateUser({ password: event.target.elements.password.value });
    if (error) throw error;
    event.target.reset();
    await service.signOut();
    recoveringPassword = false;
    show('signin');
    message('Password updated. Sign in with your new password.');
  });
});

for (const button of document.querySelectorAll('[data-provider]')) {
  button.addEventListener('click', () => act(button, async () => {
    message('Opening your sign-in provider…');
    await service.signIn(button.dataset.provider);
  }));
}
$('preview').addEventListener('click', () => {
  clearPrivate();
  preview = true;
  show('account');
  $('account-label').textContent = 'Example invitation';
  $('identity').textContent = 'Example member · No real account';
  $('profile-form').elements.display_name.value = 'Alex Morgan';
  $('profile-form').elements.organization.value = 'Example organization';
  $('profile-form').elements.interests.value = 'AI and workforce transformation';
  $('save').textContent = 'Try saving this preview';
  $('access-note').textContent = 'Illustrative content only—not a real invitation or protected resource.';
  const sample = document.createElement('article');
  const title = document.createElement('h3');
  title.textContent = 'A closer look at the work ahead';
  const body = document.createElement('p');
  body.textContent = 'Your private briefing or lesson will appear here. When there is a next step, a clear link will take you to registration or scheduling with the external provider.';
  sample.append(title, body);
  $('pages').append(sample);
  message('Preview only. Please use fictional information. Nothing is saved or sent.');
});
$('leave-preview').addEventListener('click', () => {
  preview = false;
  clearPrivate();
  show('signin');
  message(service ? 'Choose an account to sign in.' : 'Development preview · Sign-in has not been connected.');
});
$('enroll').addEventListener('click', () => act($('enroll'), async () => {
  const enrollment = await service.enroll();
  pendingFactor = enrollment.id;
  $('qr').src = enrollment.totp.qr_code;
  $('secret').value = enrollment.totp.secret;
  $('enrollment').hidden = false;
  $('verify-form').hidden = false;
  $('enroll').hidden = true;
  $('code').focus();
}));
$('cancel-enrollment').addEventListener('click', () => act($('cancel-enrollment'), async () => {
  if (pendingFactor) await service.cancelEnrollment(pendingFactor);
  await refresh();
}));
$('verify-form').addEventListener('submit', event => {
  event.preventDefault();
  act(event.submitter, async () => {
    await service.verify(pendingFactor || $('factor').value, $('code').value.trim());
    await refresh();
  });
});
$('profile-form').addEventListener('submit', event => {
  event.preventDefault();
  if (preview) { message('Preview complete. No profile was saved and nothing was sent.'); return; }
  act(event.submitter, async () => {
    await service.saveProfile(Object.fromEntries(new FormData(event.target)));
    message('Your profile has been saved.');
  });
});
$('signout').addEventListener('click', () => act($('signout'), async () => {
  clearPrivate();
  show('signin');
  await service.signOut();
  recoveringPassword = false;
  message('Signed out on this browser.');
}));

async function initialize() {
  show('signin');
  if (!config.supabaseUrl || !config.supabasePublishableKey) {
    message('Development preview · Sign-in has not been connected.');
    return;
  }
  const url = new URL(config.supabaseUrl);
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.supabase.co')) throw new Error('Member sign-in configuration is unavailable.');
  // Loaded only after configuration; the offline preview makes no external requests.
  const { createClient } = await import('./vendor/supabase.mjs');
  client = createClient(config.supabaseUrl, config.supabasePublishableKey, { auth: {
    flowType: 'pkce', detectSessionInUrl: false, persistSession: true,
    storage: {
      getItem(key) {
        const value = sessionStorage.getItem(key);
        if (value !== null || !key.endsWith('-code-verifier')) return value;
        const saved = JSON.parse(localStorage.getItem(key));
        if (saved && saved.expiresAt > Date.now()) return saved.value;
        localStorage.removeItem(key);
        return null;
      },
      setItem(key, value) {
        // Share the bundled SDK's recovery verifier across tabs, keeping sessions tab-local.
        if (key.endsWith('-code-verifier') && JSON.parse(value)?.endsWith('/PASSWORD_RECOVERY')) {
          localStorage.setItem(key, JSON.stringify({ value, expiresAt: Date.now() + 3600000 }));
          sessionStorage.removeItem(key);
        } else {
          sessionStorage.setItem(key, value);
        }
      },
      removeItem(key) {
        if (key.endsWith('-code-verifier') && sessionStorage.getItem(key) === null) {
          localStorage.removeItem(key);
        }
        sessionStorage.removeItem(key);
      },
    },
    autoRefreshToken: true,
  } });
  service = createAuthService(client, new URL('./', location.href).href);
  for (const button of document.querySelectorAll('[data-provider]')) button.disabled = !config.enabledProviders.includes(button.dataset.provider);
  $('setup-note').textContent = 'Your profile requires authenticator verification. Member resources require approved access.';
  $('email-access').hidden = false;
  const inviteParams = new URLSearchParams(location.hash.slice(1));
  const params = new URLSearchParams(location.search);
  const oauthError = params.get('error_description') || params.get('error');
  const code = params.get('code');
  // Remove callback credentials/errors from history before reading private data.
  if (code || oauthError || inviteParams.has('access_token') || inviteParams.has('error')) history.replaceState(null, '', location.pathname);
  if (inviteParams.has('error')) {
    if (inviteParams.get('type') === 'invite') throw new Error('This invitation could not be accepted. Request a fresh invitation.');
    throw new Error('Sign-in could not be completed. Return to the sign-in page to try again.');
  }
  if (inviteParams.get('type') === 'invite' && inviteParams.has('access_token') && inviteParams.has('refresh_token')) {
    await service.acceptInvitation(inviteParams.get('access_token'), inviteParams.get('refresh_token'));
  }
  if (oauthError) throw new Error('Sign-in was cancelled or declined. Please try again.');
  if (code) {
    const { data, error } = await client.auth.exchangeCodeForSession(code);
    if (error) throw error;
    recoveringPassword = ['PASSWORD_RECOVERY', 'recovery'].includes(data.redirectType);
  }
  await refresh();
  // Do not await Supabase calls inside an auth callback (SDK lock). Clear immediately.
  client.auth.onAuthStateChange(event => {
    if (event === 'SIGNED_OUT') { recoveringPassword = false; clearPrivate(); show('signin'); message('Your session has ended.'); }
    if (event === 'TOKEN_REFRESHED' && !working && !preview) {
      setTimeout(() => refresh().catch(error => message(error.message)), 0);
    }
  });
}
initialize().catch(error => { clearPrivate(); show('signin'); message(error.message || 'Sign-in setup could not be loaded.'); });
