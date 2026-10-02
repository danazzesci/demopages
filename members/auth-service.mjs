export const providers = ['google', 'facebook', 'azure'];

function checked(result) {
  if (result.error) throw result.error;
  return result.data;
}

// UI checks guide navigation. PostgreSQL policies independently enforce access.
export function createAuthService(client, redirectTo) {
  async function identity() {
    const { user } = checked(await client.auth.getUser());
    if (!user) throw new Error('Please sign in again.');
    return user;
  }
  async function requireMfa() {
    const user = await identity();
    const assurance = checked(await client.auth.mfa.getAuthenticatorAssuranceLevel());
    if (assurance.currentLevel !== 'aal2') throw new Error('Complete two-factor verification first.');
    return user;
  }
  return {
    async signIn(provider) {
      if (!providers.includes(provider)) throw new Error('Unsupported sign-in provider.');
      return checked(await client.auth.signInWithOAuth({ provider, options: {
        redirectTo, ...(provider === 'azure' ? { scopes: 'email' } : {}),
        ...(provider === 'google' ? { queryParams: { prompt: 'select_account' } } : {}),
      } }));
    },
    async state() {
      const { session } = checked(await client.auth.getSession());
      if (!session) return { stage: 'signin' };
      const user = await identity();
      const assurance = checked(await client.auth.mfa.getAuthenticatorAssuranceLevel());
      if (assurance.currentLevel === 'aal2') return { stage: 'account', user };
      const factors = checked(await client.auth.mfa.listFactors());
      const verified = factors.totp.filter(f => f.status === 'verified');
      return { stage: verified.length ? 'verify' : 'enroll', factors: verified, user };
    },
    async enroll() {
      await identity();
      return checked(await client.auth.mfa.enroll({ factorType: 'totp', friendlyName: `Dan Schaupner ${Date.now()}`, issuer: 'danschaupner.com' }));
    },
    async cancelEnrollment(factorId) {
      return checked(await client.auth.mfa.unenroll({ factorId }));
    },
    async verify(factorId, code) {
      if (!/^\d{6}$/.test(code)) throw new Error('Enter the six-digit code from your authenticator app.');
      return checked(await client.auth.mfa.challengeAndVerify({ factorId, code }));
    },
    async profile() {
      const user = await requireMfa();
      return checked(await client.from('profiles').select('display_name,organization,interests').eq('user_id', user.id).maybeSingle());
    },
    async saveProfile(values) {
      const user = await requireMfa();
      const row = { user_id: user.id };
      for (const [key, max] of Object.entries({ display_name: 100, organization: 160, interests: 1000 })) {
        row[key] = String(values[key] ?? '').trim();
        if (row[key].length > max) throw new Error(`${key.replaceAll('_', ' ')} is too long.`);
      }
      if (!row.display_name) throw new Error('Please enter a display name.');
      checked(await client.from('profiles').upsert(row, { onConflict: 'user_id' }));
    },
    async membership() {
      const user = await requireMfa();
      return checked(await client.from('member_access').select('active').eq('user_id', user.id).maybeSingle());
    },
    async role() {
      const user = await requireMfa();
      const result = await client.from('member_roles').select('role,labels').eq('user_id', user.id).maybeSingle();
      // Keep existing member access working until the new migration is applied.
      if (['42P01', 'PGRST205'].includes(result.error?.code)) return { role: 'user', labels: [] };
      return checked(result) || { role: 'user', labels: [] };
    },
    async inviteMember(email) {
      await requireMfa();
      const result = await client.functions.invoke('invite-member', { body: { email: email.trim() } });
      if (result.error) {
        const response = result.error.context;
        if (response?.status === 404) throw new Error('Invitation delivery has not been activated yet.');
        let detail;
        try { detail = await response?.json(); } catch {}
        throw new Error(detail?.error || 'Invitation delivery could not be confirmed. Check the users list before retrying.');
      }
      if (result.data?.sent !== true) throw new Error('Invitation delivery was not confirmed.');
      return result.data;
    },
    async acceptInvitation(access_token, refresh_token) {
      checked(await client.auth.setSession({ access_token, refresh_token }));
    },
    async adminMembers() {
      await requireMfa();
      return checked(await client.rpc('admin_members'));
    },
    async saveMember(values) {
      await requireMfa();
      if (values.verification_code) {
        if (!/^\d{6}$/.test(values.verification_code)) throw new Error('Enter a six-digit authenticator code.');
        const factors = checked(await client.auth.mfa.listFactors());
        const factor = factors.totp.find(f => f.status === 'verified');
        if (!factor) throw new Error('A verified authenticator is required.');
        checked(await client.auth.mfa.challengeAndVerify({ factorId: factor.id, code: values.verification_code }));
      }
      // Server independently verifies role, MFA, approval and delegated scope.
      return checked(await client.rpc('admin_save_member', {
        target_id: values.user_id, new_role: values.role,
        new_labels: values.labels, new_active: values.active,
        assigned_delegate: values.delegate_id || null,
      }));
    },
    async pages() {
      await requireMfa();
      return checked(await client.from('member_pages').select('id,title,body,action_label,action_url,expires_at').order('title'));
    },
    async signOut() { checked(await client.auth.signOut({ scope: 'local' })); },
  };
}
