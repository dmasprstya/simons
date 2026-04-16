import api from './axios';

/**
 * Get Roots — daftar klasifikasi level 1
 * @param {Object} params - { type }
 */
export async function getRoots(params = {}) {
  const response = await api.get('/classifications', { params });
  return response.data;
}

export async function searchClassifications(q) {
  const response = await api.get('/classifications/search', { params: { q } });
  return response.data;
}

/**
 * Get Children — daftar sub-klasifikasi dari parent tertentu
 */
export async function getChildren(id) {
  const response = await api.get(`/classifications/${id}/children`);
  return response.data;
}

/**
 * Get Classification — detail satu klasifikasi
 */
export async function getClassification(id) {
  const response = await api.get(`/classifications/${id}`);
  return response.data;
}

/**
 * Create Classification — buat klasifikasi baru
 * @param {Object} data - { code, name, parent_id, type, level }
 */
export async function createClassification(data) {
  const response = await api.post('/classifications', data);
  return response.data;
}

/**
 * Update Classification — update data klasifikasi
 * @param {Object} data - { code, name, parent_id, type, level }
 */
export async function updateClassification(id, data) {
  const response = await api.put(`/classifications/${id}`, data);
  return response.data;
}

/**
 * Toggle Active — aktifkan/nonaktifkan klasifikasi
 */
export async function toggleActive(id) {
  const response = await api.patch(`/classifications/${id}/toggle-active`);
  return response.data;
}

/**
 * Delete Classification — hapus permanen klasifikasi (hanya jika tidak punya children)
 */
export async function deleteClassification(id) {
  const response = await api.delete(`/classifications/${id}`);
  return response.data;
}
