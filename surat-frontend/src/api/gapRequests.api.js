import api from './axios';

/**
 * Get My Requests — daftar gap request milik user yang login
 * @param {Object} params - { page, status }
 */
export async function getMyRequests(params = {}) {
  const response = await api.get('/gap-requests', { params });
  return response.data;
}

/**
 * Get All Requests — daftar semua gap request (admin only)
 * @param {Object} params - { page, status, user_id }
 */
export async function getAllRequests(params = {}) {
  const response = await api.get('/gap-requests/all', { params });
  return response.data;
}

/**
 * Create Request — buat gap request baru
 * @param {Object} data - { classification_id, reason }
 */
export async function createRequest(data) {
  const response = await api.post('/gap-requests', data);
  return response.data;
}

/**
 * Approve Request — approve gap request (admin only)
 */
export async function approveRequest(id) {
  const response = await api.patch(`/gap-requests/${id}/approve`);
  return response.data;
}

/**
 * Reject Request — reject gap request dengan alasan (admin only)
 */
export async function rejectRequest(id, reason) {
  const response = await api.patch(`/gap-requests/${id}/reject`, { reason });
  return response.data;
}

/**
 * Get Vacant Numbers — daftar nomor gap yang tersedia (vacant)
 * @param {Object} params - { date_from, date_to, page }
 */
export async function getVacantNumbers(params = {}) {
  const response = await api.get('/gap-numbers', { params });
  return response.data;
}
