import axiosInstance from 'src/utils/axiosInstance';

// Lapisan penarik API export "Profil Kesiapan Kerja" (stream PDF, sinkron).
// Ref: docunentation/enpoind dashboard/INTEGRASI-FE-Export-Profil-Kesiapan-Kerja.md (§3.2, §5.2)
// Base path: /api/v1/kepala-jurusan/readiness-profile/{siswa_id}/export
//
// Catatan: sekolah_id & jurusan_id diambil dari token (jangan dikirim FE).
// Auth ditangani otomatis oleh interceptor axiosInstance.

const EXPORT_BASE = '/api/v1/kepala-jurusan/readiness-profile';

// Ambil nama file dari header Content-Disposition (fallback bila tak ada).
const extractFilename = (contentDisposition, fallback) => {
  try {
    if (!contentDisposition) return fallback;
    // contoh: attachment; filename="Profil-Kesiapan-Kerja-Nama.pdf"
    const match = /filename\*?=(?:UTF-8'')?("?)([^";]+)\1/i.exec(contentDisposition);
    if (!match || !match[2]) return fallback;
    return decodeURIComponent(match[2]);
  } catch {
    return fallback;
  }
};

// Saat error, PDF di-stream diganti body JSON. Karena responseType 'blob',
// error.response.data juga berupa Blob — perlu dibaca-teks lalu di-parse.
const parseBlobError = async (error) => {
  const fallback = 'Gagal membuat dokumen, coba lagi.';
  const data = error?.response?.data;
  try {
    if (data instanceof Blob) {
      const text = await data.text();
      const json = JSON.parse(text);
      return json?.error?.message || json?.msg || fallback;
    }
    return data?.error?.message || data?.msg || error?.message || fallback;
  } catch {
    return error?.message || fallback;
  }
};

/**
 * Unduh / buka PDF Profil Kesiapan Kerja siswa.
 * @param {string} siswaId - UUID siswa
 * @param {object} opts
 * @param {boolean} [opts.includeContact=true] - false → kontak siswa disamarkan di dokumen
 * @param {boolean} [opts.inline=false] - true → buka pratinjau di tab; false → paksa unduh
 * @param {number} [opts.trendPeriods] - jumlah semester pada tren (2–8)
 * @param {string} [opts.namaSiswa] - untuk fallback nama file
 * @returns {Promise<string>} nama file yang dipakai
 */
export const exportProfilSiswaPdf = async (
  siswaId,
  { includeContact = true, inline = false, trendPeriods, namaSiswa } = {},
) => {
  if (!siswaId) throw new Error('ID siswa tidak valid.');

  const params = { include_contact: includeContact };
  if (inline) params.disposition = 'inline';
  if (trendPeriods != null) params.trend_periods = trendPeriods;

  let response;
  try {
    response = await axiosInstance.get(`${EXPORT_BASE}/${siswaId}/export`, {
      params,
      responseType: 'blob',
    });
  } catch (error) {
    throw new Error(await parseBlobError(error));
  }

  // Sabuk pengaman: pastikan yang diterima benar-benar PDF, bukan JSON error
  // yang lolos sebagai HTTP 200 (jarang, tapi dijaga sesuai §4).
  const contentType = response?.headers?.['content-type'] || '';
  if (!contentType.includes('application/pdf')) {
    const text = await response.data.text().catch(() => '');
    let msg = 'Gagal membuat dokumen, coba lagi.';
    try {
      const json = JSON.parse(text);
      msg = json?.error?.message || json?.msg || msg;
    } catch {
      /* biarkan pakai pesan default */
    }
    throw new Error(msg);
  }

  const cd = response?.headers?.['content-disposition'] || response?.headers?.['Content-Disposition'];
  const safeName = (namaSiswa || 'Siswa').trim().replace(/\s+/g, '-');
  const filename = extractFilename(cd, `Profil-Kesiapan-Kerja-${safeName}.pdf`);

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);

  if (inline) {
    window.open(url, '_blank'); // buka pratinjau di tab
  } else {
    const a = document.createElement('a'); // paksa unduh
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // beri jeda agar unduhan/tab sempat membaca blob sebelum di-revoke
  setTimeout(() => window.URL.revokeObjectURL(url), 10000);

  return filename;
};
