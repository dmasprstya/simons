import api from './axios';

/**
 * Get My Letters — daftar surat milik user yang sedang login
 * @param {Object} params - { page, classification_id, date_from, date_to }
 */
export async function getMyLetters(params = {}) {
  const response = await api.get('/letters', { params });
  return response.data;
}

/**
 * Get Recent Letters — riwayat pengambilan nomor terbaru dari semua user
 * Dapat diakses oleh semua user yang terautentikasi.
 * @param {Object} params - { limit }
 */
export async function getRecentLetters(params = {}) {
  const response = await api.get('/letters/recent', { params });
  return response.data;
}

/**
 * Get All Letters — daftar semua surat (admin only)
 * @param {Object} params - { page, classification_id, date_from, date_to, user_id }
 */
export async function getAllLetters(params = {}) {
  const response = await api.get('/letters/all', { params });
  return response.data;
}

/**
 * Take Number — ambil nomor surat baru
 * @param {Object} data - { classification_id, subject, destination }
 */
export async function takeNumber(data) {
  const response = await api.post('/letters', data);
  return response.data;
}

/**
 * Get Letter — detail satu surat berdasarkan ID
 */
export async function getLetter(id) {
  const response = await api.get(`/letters/${id}`);
  return response.data;
}

/**
 * Void Letter — tandai surat sebagai void/batal
 */
export async function voidLetter(id) {
  const response = await api.patch(`/letters/${id}/void`);
  return response.data;
}
