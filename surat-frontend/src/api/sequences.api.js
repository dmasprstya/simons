import api from './axios';

/**
 * Get Today — ambil data sequence hari ini untuk classification tertentu
 * @param {number} classificationId
 */
export async function getToday(classificationId) {
  const response = await api.get('/sequences/today', {
    params: { classification_id: classificationId },
  });
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
