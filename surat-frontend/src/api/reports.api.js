import api from './axios';

/**
 * Get Summary — ambil ringkasan laporan
 * @param {Object} params - { date_from, date_to, classification_id }
 */
export async function getSummary(params = {}) {
  const response = await api.get('/reports/summary', { params });
  return response.data;
}

/**
 * Export Report — download/export laporan
 * @param {Object} params - { date_from, date_to, classification_id, format }
 */
export async function exportReport(params = {}) {
  const response = await api.get('/reports/export', { params });
  return response.data;
}
