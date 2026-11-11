import axiosInstance from 'src/utils/axiosInstance';
import { pesanGalat } from './perangkatAjarConfig';

// File perangkat ajar dilindungi token, jadi tidak bisa dibuka lewat <a href> biasa.
// Ambil sebagai blob lewat axiosInstance (header Authorization ikut), lalu buat object URL.

export const ambilFileBlob = async (url) => {
  const res = await axiosInstance.get(url, { responseType: 'blob' });
  return { blob: res.data, namaFile: namaDariContentDisposition(res.headers?.['content-disposition']) };
};

const namaDariContentDisposition = (header) => {
  if (!header) return null;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8) return decodeURIComponent(utf8[1]);
  const biasa = /filename="?([^";]+)"?/i.exec(header);
  return biasa ? biasa[1] : null;
};

export const unduhFile = async (url, namaCadangan = 'perangkat-ajar.pdf') => {
  const { blob, namaFile } = await ambilFileBlob(url);
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = namaFile || namaCadangan;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};

/**
 * Pesan galat untuk request `responseType: 'blob'`. Server tetap mengirim JSON `{ msg }`, tetapi
 * axios menyerahkannya sebagai Blob, jadi harus dibaca dulu sebelum `msg` bisa ditampilkan.
 */
export const pesanGalatFile = async (error, fallback) => {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text())?.msg || fallback;
    } catch {
      return fallback;
    }
  }
  return pesanGalat(error, fallback);
};
