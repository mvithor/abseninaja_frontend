import axiosInstance from 'src/utils/axiosInstance';
import { BK_API } from './pemetaanConfig';

// Ekspor PDF profil siswa BK (pemetaan + riwayat permasalahan). PDF dirender backend dan
// di-stream sinkron, mengikuti pola export Profil Kesiapan Kerja (profilSiswaExportApi.jsx).

const namaDariHeader = (cd, fallback) => {
  const match = /filename\*?=(?:UTF-8'')?("?)([^";]+)\1/i.exec(cd || '');
  return match?.[2] ? decodeURIComponent(match[2]) : fallback;
};

// Dengan responseType 'blob', body error juga Blob: baca sebagai teks lalu parse JSON.
const pesanError = async (error) => {
  const fallback = 'Gagal membuat dokumen, coba lagi.';
  const data = error?.response?.data;
  try {
    if (data instanceof Blob) return JSON.parse(await data.text())?.msg || fallback;
    return data?.msg || fallback;
  } catch {
    return fallback;
  }
};

/**
 * @param {string} siswaId
 * @param {object} opts
 * @param {boolean} [opts.includeRiwayat=true] sertakan riwayat permasalahan
 * @param {boolean} [opts.includeRahasia=false] sertakan isi catatan rahasia milik BK pengunduh
 * @param {boolean} [opts.inline=false] buka di tab baru (pratinjau) alih-alih unduh
 * @param {string} [opts.namaSiswa] untuk nama file cadangan
 */
export const exportProfilBkPdf = async (siswaId, { includeRiwayat = true, includeRahasia = false, inline = false, namaSiswa } = {}) => {
  let response;
  try {
    response = await axiosInstance.get(`${BK_API}/pemetaan/siswa/${siswaId}/export`, {
      params: { include_riwayat: includeRiwayat, include_rahasia: includeRahasia, ...(inline ? { disposition: 'inline' } : {}) },
      responseType: 'blob',
    });
  } catch (error) {
    throw new Error(await pesanError(error));
  }

  if (!(response.headers?.['content-type'] || '').includes('application/pdf')) {
    throw new Error('Gagal membuat dokumen, coba lagi.');
  }

  const nama = namaDariHeader(response.headers?.['content-disposition'], `Profil-BK-${(namaSiswa || 'Siswa').replace(/\s+/g, '-')}.pdf`);
  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));

  if (inline) {
    window.open(url, '_blank');
  } else {
    const a = document.createElement('a');
    a.href = url;
    a.download = nama;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  // Jeda agar tab/unduhan sempat membaca blob sebelum dicabut.
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return nama;
};
