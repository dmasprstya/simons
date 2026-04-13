import api from './axios';

/**
 * Get Summary — ambil ringkasan laporan
 * @param {Object} params - { date_from, date_to, classification_id, division }
 */
export async function getSummary(params = {}) {
  const response = await api.get('/reports/summary', { params });
  return response.data;
}

/**
 * Export Report — download laporan sebagai file blob (CSV/PDF)
 * @param {Object} params - { date_from, date_to, classification_id, format, division }
 */
export async function exportReport(params = {}) {
  let response;
  try {
    response = await api.get('/reports/export', {
      params: { ...params, format: params.format || 'csv' },
      responseType: 'blob',
    });
  } catch (err) {
    // Beberapa browser mengembalikan blob JSON pada error biner.
    if (err.response?.data instanceof Blob) {
      const text = await err.response.data.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || 'Gagal mengekspor laporan.');
      } catch {
        throw new Error(text || 'Network error saat mengunduh file.');
      }
    }

    throw new Error(err.message || 'Network error saat mengunduh file.');
  }

  // Jika backend merespons JSON error, tampilkan message aslinya.
  const contentType = response.headers['content-type'] || '';
  if (contentType.includes('application/json')) {
    const text = await response.data.text();
    const json = JSON.parse(text);
    throw new Error(json.message || 'Gagal mengekspor laporan.');
  }

  // Ekstrak filename dari Content-Disposition header (jika ada)
  const contentDisposition = response.headers['content-disposition'];
  const requestedFormat = (params.format || 'csv').toLowerCase();
  let filename = requestedFormat === 'pdf' ? 'laporan-surat.pdf' : 'laporan-surat.csv';

  if (contentDisposition) {
    const match = contentDisposition.match(/filename[^;=\n]*=(['"]?)([^'"\n]+)\1/);
    if (match?.[2]) filename = match[2];
  }

  // Buat blob URL dan trigger download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();

  // Cleanup
  if (link.parentNode) {
    link.parentNode.removeChild(link);
  }
  window.URL.revokeObjectURL(url);

  return { success: true, filename };
}

