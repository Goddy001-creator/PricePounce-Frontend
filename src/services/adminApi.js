import api from "./api";

export async function getAdminStats() {
  const response = await api.get("/admin/stats");
  return response.data;
}

export async function getAdminUsers(params) {
  const response = await api.get("/admin/users", { params });
  return response.data;
}

export async function getAdminUser(userId) {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
}

export async function getAdminAudit(params) {
  const response = await api.get("/admin/audit", { params });
  return response.data;
}

export async function suspendUser(userId) {
  const response = await api.post(`/admin/users/${userId}/suspend`);
  return response.data;
}

export async function unsuspendUser(userId) {
  const response = await api.post(`/admin/users/${userId}/unsuspend`);
  return response.data;
}

export async function forceLogoutUser(userId) {
  const response = await api.post(`/admin/users/${userId}/force-logout`);
  return response.data;
}

export async function unlockUser(userId) {
  const response = await api.post(`/admin/users/${userId}/unlock`);
  return response.data;
}

export async function verifyUserEmail(userId) {
  const response = await api.post(`/admin/users/${userId}/verify-email`);
  return response.data;
}

export async function setUserPlan(userId, payload) {
  const response = await api.post(`/admin/users/${userId}/plan`, payload);
  return response.data;
}

export async function deleteUser(userId, confirmEmail) {
  const response = await api.post(`/admin/users/${userId}/delete`, {
    confirm_email: confirmEmail,
  });

  return response.data;
}