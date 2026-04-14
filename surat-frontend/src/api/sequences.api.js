import api from './axios';

/**
 * Get Today — ambil data sequence global hari ini
 */
export async function getToday() {
  const response = await api.get('/sequences/today');
  return response.data;
}

/**
 * Get Sequences — daftar semua sequence (admin)
 * @param {Object} params - { page, classification_id, date }
 */
export async function getSequences(params = {}) {
  const response = await api.get('/sequences', { params });
  return response.data;
}

/**
 * Update Gap — ubah ukuran gap pada sequence
 * @param {number} gapSize
 */
export async function updateGap(gapSize) {
  const response = await api.patch('/sequences/gap', { gap_size: gapSize });
  return response.data;
}

/**
 * Reset Sequence — reset penomoran ke titik awal baru (admin only)
 * @param {{ next_start: number, gap_size?: number }} payload
 */
export async function resetSequence(payload) {
  const response = await api.post('/sequences/reset', payload);
  return response.data;
}
