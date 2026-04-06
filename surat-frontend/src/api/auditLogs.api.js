import api from './axios';

/**
 * Get Logs — daftar audit log (admin only)
 * @param {Object} params - { page, user_id, action, date_from, date_to }
 */
export async function getLogs(params = {}) {
  const response = await api.get('/audit-logs', { params });
  return response.data;
}

/**
 * Get Log — detail satu audit log
 */
export async function getLog(id) {
  const response = await api.get(`/audit-logs/${id}`);
  return response.data;
}
