import api from './axios';

/**
 * Get Summary — ambil ringkasan laporan
 * @param {Object} params - { date, date_from, date_to, classification_id }
 */
export async function getSummary(params = {}) {
  const response = await api.get('/reports/summary', { params });
  return response.data;
}

/**
 * Export Report — download laporan sebagai file blob (Excel/PDF)
 * @param {Object} params - { date_from, date_to, classification_id, format, search, status, division }
 *
 * Menggunakan responseType: 'blob' agar browser bisa trigger download file.
 * Setelah response diterima, buat URL object dan klik link otomatis.
 */
export async function exportReport(params = {}) {
  const response = await api.get('/reports/export', {
    params,
    responseType: 'blob',
  });

  // Ekstrak filename dari Content-Disposition header (jika ada)
  const contentDisposition = response.headers['content-disposition'];
  let filename = `laporan-surat.${params.format || 'xlsx'}`;

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?(.+)"?/);
    if (match) filename = match[1];
  }

  // Buat blob URL dan trigger download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();

  // Cleanup
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);

  return { success: true, filename };
}
