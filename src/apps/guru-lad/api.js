import axiosInstance from 'src/utils/axiosInstance';
import { potong, MAKS_SEL_PER_PERMINTAAN } from './nilai/tempel';
import { pesanDariRespons } from './galat';

// Pembungkus tipis untuk API LAD (backend: /api/v1/lad). Semua rute melewati gerbang akses di server;
// halaman tidak boleh menebak hak akses sendiri, hanya menanggapi 403.
const DASAR = '/api/v1/lad';
const kelasUrl = (id) => `${DASAR}/kelas/${id}`;

const ambil = async (promise) => (await promise).data;

export const kunciLad = {
  akses: ['lad', 'akses'],
  daftarKelas: ['lad', 'kelas'],
  masukan: (kelasId) => ['lad', 'kelas', kelasId, 'masukan'],
  // Berawalan sama dengan daftarKelas, jadi setiap invalidasi daftarKelas ikut menyegarkan evaluasi.
  evaluasi: (kelasId) => ['lad', 'kelas', kelasId, 'evaluasi'],
};

/** Probe akses: 200 bila fitur aktif dan akun terdaftar sebagai guru LAD, 403 bila tidak. */
export const cekAkses = () => ambil(axiosInstance.get(`${DASAR}/ping`));

export const daftarKelas = () => ambil(axiosInstance.get(`${DASAR}/kelas`));
export const buatKelas = (badan) => ambil(axiosInstance.post(`${DASAR}/kelas`, badan));
export const ubahKelas = (kelasId, badan) => ambil(axiosInstance.patch(kelasUrl(kelasId), badan));
export const bacaMasukan = (kelasId) => ambil(axiosInstance.get(`${kelasUrl(kelasId)}/masukan`));
export const bacaEvaluasi = (kelasId) => ambil(axiosInstance.get(`${kelasUrl(kelasId)}/evaluasi`));

// ---- struktur
export const tambahLm = (kelasId, nama) => ambil(axiosInstance.post(`${kelasUrl(kelasId)}/lm`, { nama }));
export const ubahLm = (kelasId, lmId, badan) => ambil(axiosInstance.patch(`${kelasUrl(kelasId)}/lm/${lmId}`, badan));
export const hapusLm = (kelasId, lmId, konfirmasi = false) => ambil(
  axiosInstance.delete(`${kelasUrl(kelasId)}/lm/${lmId}`, { params: konfirmasi ? { konfirmasi: 'hapus' } : undefined }),
);
export const urutLm = (kelasId, idBerurutan) => ambil(
  axiosInstance.put(`${kelasUrl(kelasId)}/lm/urutan`, { id_berurutan: idBerurutan }),
);

export const tambahTp = (kelasId, lmId, badan) => ambil(axiosInstance.post(`${kelasUrl(kelasId)}/lm/${lmId}/tp`, badan));
export const ubahTp = (kelasId, tpId, badan) => ambil(axiosInstance.patch(`${kelasUrl(kelasId)}/tp/${tpId}`, badan));
export const hapusTp = (kelasId, tpId, konfirmasi = false) => ambil(
  axiosInstance.delete(`${kelasUrl(kelasId)}/tp/${tpId}`, { params: konfirmasi ? { konfirmasi: 'hapus' } : undefined }),
);

// ---- siswa
export const tambahSiswa = (kelasId, siswa) => ambil(axiosInstance.post(`${kelasUrl(kelasId)}/siswa`, { siswa }));
export const ubahSiswa = (kelasId, siswaId, badan) => ambil(axiosInstance.patch(`${kelasUrl(kelasId)}/siswa/${siswaId}`, badan));
export const hapusSiswa = (kelasId, siswaId, konfirmasi = false) => ambil(
  axiosInstance.delete(`${kelasUrl(kelasId)}/siswa/${siswaId}`, { params: konfirmasi ? { konfirmasi: 'hapus' } : undefined }),
);

// ---- nilai
const simpanSatuPotong = (kelasId, sel) => ambil(axiosInstance.put(`${kelasUrl(kelasId)}/nilai-tp`, { sel }));

/**
 * Simpan sel nilai TP yang berubah. Dikirim bertahap (paling banyak 1500 sel per permintaan, batas server).
 * Berhenti di potongan pertama yang ditolak: potongan sebelumnya sudah tersimpan dan dilaporkan di `tersimpan`,
 * sehingga pemanggil dapat menandai sel-sel itu bersih.
 * Mengembalikan { tersimpan: <sel yang diterima server>, ringkasan } atau melempar error dengan `.tersimpan`.
 */
export async function simpanNilaiTp(kelasId, sel) {
  const tersimpan = [];
  const ringkasan = {
    disimpan: 0, tidak_berubah: 0, dikosongkan: 0, remedial_disinkronkan: 0,
  };
  for (const potongan of potong(sel, MAKS_SEL_PER_PERMINTAAN)) {
    try {
      const hasil = await simpanSatuPotong(kelasId, potongan);
      tersimpan.push(...potongan);
      Object.keys(ringkasan).forEach((k) => { ringkasan[k] += hasil[k] ?? 0; });
    } catch (error) {
      error.tersimpan = tersimpan;
      error.potonganGagal = potongan;
      throw error;
    }
  }
  return { tersimpan, ringkasan };
}

/** Ambil pesan yang layak ditampilkan dari error axios, termasuk daftar galat per kolom (422). */
export function pesanGalat(error, cadangan = 'Terjadi kesalahan. Coba lagi.') {
  const data = error?.response?.data;
  if (!data) return error?.message === 'Network Error' ? 'Tidak dapat terhubung ke server.' : cadangan;
  return pesanDariRespons(data, cadangan);
}
