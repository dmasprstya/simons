/**
 * Menampilkan nomor surat dalam format lengkap.
 * Gunakan formatted_number dari API jika tersedia,
 * fallback ke number mentah jika tidak ada.
 *
 * @param {Object} letter - Objek surat dari API
 * @returns {string|number} Nomor surat terformat atau mentah
 */
export function displayLetterNumber(letter) {
  return letter.formatted_number ?? letter.number;
}

/**
 * Validasi format nomor surat (untuk keperluan display/debug).
 * Pola: W7.{KODE}-{ANGKA}
 *
 * @param {string} str - String yang akan divalidasi
 * @returns {boolean} true jika sesuai pola W7.{kode}-{angka}
 */
export function isFormattedNumber(str) {
  return /^W7\.[\w.]+(-\d+)$/.test(str);
}

/**
 * Menampilkan klasifikasi sesuai level:
 *   level 1 → "HM - Hukum dan Perundang-undangan"
 *   level 2+ → "Peraturan Perundang-undangan" (hanya nama)
 *
 * @param {Object|null} classification - Objek klasifikasi dari API
 * @returns {string}
 */
export function displayClassification(classification) {
  if (!classification) return '-';
  if (classification.level === 1) return `${classification.code} - ${classification.name}`;
  return classification.name || '-';
}
