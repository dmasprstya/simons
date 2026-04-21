import api from './axios';

/**
 * Get Users — daftar semua user (admin only)
 * @param {Object} params - { page, search, role, is_active }
 */
export async function getUsers(params = {}) {
  const response = await api.get('/users', { params });
  return response.data;
}

/**
 * Create User — buat user baru (admin only)
 * @param {Object} data - { name, email, password, role }
 */
export async function createUser(data) {
  const form = new FormData();
  Object.entries(data).forEach(([key, val]) => {
    if (val !== undefined && val !== null) form.append(key, val);
  });
  const response = await api.post('/users', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Get User — detail satu user
 */
export async function getUser(id) {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

/**
 * Update User — update data user (admin only)
 * @param {Object} data - { name, email, role }
 */
export async function updateUser(id, data) {
  // Laravel tidak mendukung multipart PUT — gunakan POST + _method spoofing
  const form = new FormData();
  form.append('_method', 'PUT');
  Object.entries(data).forEach(([key, val]) => {
    if (val !== undefined && val !== null) form.append(key, val);
  });
  const response = await api.post(`/users/${id}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Toggle Active — aktifkan/nonaktifkan user (admin only)
 */
export async function toggleActive(id) {
  const response = await api.patch(`/users/${id}/toggle-active`);
  return response.data;
}
