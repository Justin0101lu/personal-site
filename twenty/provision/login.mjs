// Signs in with email + password and returns a workspace access token. Twenty's workflow-builder
// mutations need a user session (an API key is rejected there), so the scripts prefer this.
export default async function login(url, email, password) {
  const call = async (query) => {
    const r = await fetch(url.replace(/\/$/, '') + '/metadata', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
    const j = await r.json();
    if (j.errors) throw new Error('Login failed: ' + j.errors.map((e) => e.message).join('; '));
    return j.data;
  };
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const lt = await call(`mutation { getLoginTokenFromCredentials(email:"${esc(email)}", password:"${esc(password)}", origin:"${url}") { loginToken { token } } }`);
  const at = await call(`mutation { getAuthTokensFromLoginToken(loginToken:"${lt.getLoginTokenFromCredentials.loginToken.token}", origin:"${url}") { tokens { accessOrWorkspaceAgnosticToken { token } } } }`);
  return at.getAuthTokensFromLoginToken.tokens.accessOrWorkspaceAgnosticToken.token;
}
