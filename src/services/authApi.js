import api from "./api";

export async function loginTwoFactor(mfaToken, code) {
  const response = await api.post("/auth/login/2fa", {
    mfa_token: mfaToken,
    code,
  });

  return response.data;
}

export async function setupTwoFactor() {
  const response = await api.post("/security/2fa/setup");
  return response.data;
}

export async function enableTwoFactor(code) {
  const response = await api.post("/security/2fa/enable", { code });
  return response.data;
}

export async function disableTwoFactor(password, code) {
  const response = await api.post("/security/2fa/disable", {
    password,
    code,
  });

  return response.data;
}

export async function regenerateRecoveryCodes(code) {
  const response = await api.post("/security/2fa/recovery-codes", { code });
  return response.data;
}