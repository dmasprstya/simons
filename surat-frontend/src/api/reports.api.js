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
 * Export Report — download laporan sebagai file blob (Excel/PDF)
 * @param {Object} params - { date_from, date_to, classification_id, format, division }
 *
 * Saat ExportService sudah diimplementasi, backend mengembalikan blob file.
 * Saat masih stub, backend mengembalikan JSON — fungsi ini mendeteksi keduanya.
 */
export async function exportReport(params = {}) {
  const response = await api.get('/reports/export', {
    params,
    responseType: 'blob',
  });

  // Cek apakah response adalah JSON (stub) alih-alih blob file
  // Jika content-type adalah application/json, berarti export belum tersedia
  const contentType = response.headers['content-type'] || '';
  if (contentType.includes('application/json')) {
    // Parse blob kembali ke JSON untuk mendapatkan message
    const text = await response.data.text();
    const json = JSON.parse(text);
    throw new Error(json.message || 'Fitur export belum tersedia.');
  }

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

