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
  // Ringkasan satu kelas (FR-10, L-2) dan ringkasan semua kelas untuk Beranda (L-1). Keduanya juga berawalan
  // daftarKelas, jadi setiap penyimpanan nilai, kehadiran, atau struktur ikut menyegarkannya.
  ringkasan: (kelasId) => ['lad', 'kelas', kelasId, 'ringkasan'],
  ringkasanSemua: ['lad', 'kelas', 'ringkasan'],
  // Ringkasan keputusan saran seluruh kelas (untuk penanda di matriks) dan saran lengkap satu siswa.
  saranKelas: (kelasId) => ['lad', 'kelas', kelasId, 'saran'],
  saranSiswa: (kelasId, siswaId) => ['lad', 'kelas', kelasId, 'saran-siswa', String(siswaId)],
};

/** Probe akses: 200 bila fitur aktif dan akun terdaftar sebagai guru LAD, 403 bila tidak. */
export const cekAkses = () => ambil(axiosInstance.get(`${DASAR}/ping`));

export const daftarKelas = () => ambil(axiosInstance.get(`${DASAR}/kelas`));
export const buatKelas = (badan) => ambil(axiosInstance.post(`${DASAR}/kelas`, badan));
export const ubahKelas = (kelasId, badan) => ambil(axiosInstance.patch(kelasUrl(kelasId), badan));

// ---- impor blanko (FR-07)
// Berkas dikirim sebagai multipart. Pratinjau tidak menulis apa pun; simpan memeriksa ulang dari awal dan
// membuat semua kelas dalam satu transaksi (semua-atau-tidak-sama-sekali), jadi berkas dikirim ulang saat menyimpan.
function kirimBerkasImpor(jalur, berkas, meta) {
  const form = new FormData();
  berkas.forEach((f) => form.append('berkas', f, f.name));
  form.append('meta', JSON.stringify(meta));
  return ambil(axiosInstance.post(`${DASAR}/kelas/impor${jalur}`, form));
}
export const pratinjauImpor = (berkas, meta) => kirimBerkasImpor('/pratinjau', berkas, meta);
export const simpanImpor = (berkas, meta) => kirimBerkasImpor('', berkas, meta);

export const bacaMasukan = (kelasId) => ambil(axiosInstance.get(`${kelasUrl(kelasId)}/masukan`));
export const bacaEvaluasi = (kelasId) => ambil(axiosInstance.get(`${kelasUrl(kelasId)}/evaluasi`));

// ---- ringkasan (FR-10). Semua angka dihitung server dari evaluasi yang sama dengan tab Perlu Perhatian.
export const bacaRingkasan = (kelasId) => ambil(axiosInstance.get(`${kelasUrl(kelasId)}/ringkasan`));
export const bacaRingkasanSemuaKelas = () => ambil(axiosInstance.get(`${DASAR}/kelas/ringkasan`));

// ---- saran tindak lanjut
// Draf disusun server dari bukti; yang dikirim klien hanya versi akhir guru. Keputusan (pakai, abaikan,
// buka kembali) selalu menyimpan salinan draf saat itu di server, jadi klien tidak mengirim draf.
const saranUrl = (kelasId, siswaId, pola) => `${kelasUrl(kelasId)}/siswa/${siswaId}/saran${pola ? `/${pola}` : ''}`;
export const bacaSaranKelas = (kelasId) => ambil(axiosInstance.get(`${kelasUrl(kelasId)}/saran`));
export const bacaSaranSiswa = (kelasId, siswaId) => ambil(axiosInstance.get(saranUrl(kelasId, siswaId)));
export const pakaiSaran = (kelasId, siswaId, pola, akhir) => ambil(axiosInstance.put(saranUrl(kelasId, siswaId, pola), { akhir }));
export const abaikanSaran = (kelasId, siswaId, pola, alasan) => ambil(
  axiosInstance.post(`${saranUrl(kelasId, siswaId, pola)}/abaikan`, { alasan }),
);
export const bukaKembaliSaran = (kelasId, siswaId, pola) => ambil(axiosInstance.delete(saranUrl(kelasId, siswaId, pola)));

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
const simpanSatuPotong = (kelasId, sel, rute) => ambil(axiosInstance.put(`${kelasUrl(kelasId)}/${rute}`, { sel }));

/**
 * Simpan sel nilai yang berubah. Dikirim bertahap (paling banyak 1500 sel per permintaan, batas server).
 * Berhenti di potongan pertama yang ditolak: potongan sebelumnya sudah tersimpan dan dilaporkan di `tersimpan`,
 * sehingga pemanggil dapat menandai sel-sel itu bersih.
 * Mengembalikan { tersimpan: <sel yang diterima server>, ringkasan } atau melempar error dengan `.tersimpan`.
 */
async function simpanBertahap(kelasId, sel, rute) {
  const tersimpan = [];
  const ringkasan = {
    disimpan: 0, tidak_berubah: 0, dikosongkan: 0, remedial_disinkronkan: 0,
  };
  for (const potongan of potong(sel, MAKS_SEL_PER_PERMINTAAN)) {
    try {
      const hasil = await simpanSatuPotong(kelasId, potongan, rute);
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

export const simpanNilaiTp = (kelasId, sel) => simpanBertahap(kelasId, sel, 'nilai-tp');
export const simpanNilaiProyek = (kelasId, sel) => simpanBertahap(kelasId, sel, 'nilai-proyek');

// ---- proyek
export const tambahProyek = (kelasId, badan) => ambil(axiosInstance.post(`${kelasUrl(kelasId)}/proyek`, badan));
export const ubahProyek = (kelasId, proyekId, badan) => ambil(axiosInstance.patch(`${kelasUrl(kelasId)}/proyek/${proyekId}`, badan));
export const hapusProyek = (kelasId, proyekId, konfirmasi = false) => ambil(
  axiosInstance.delete(`${kelasUrl(kelasId)}/proyek/${proyekId}`, { params: konfirmasi ? { konfirmasi: 'hapus' } : undefined }),
);

// ---- pertemuan dan kehadiran
export const tambahPertemuan = (kelasId, badan) => ambil(axiosInstance.post(`${kelasUrl(kelasId)}/pertemuan`, badan));
export const ubahPertemuan = (kelasId, pertemuanId, badan) => ambil(axiosInstance.patch(`${kelasUrl(kelasId)}/pertemuan/${pertemuanId}`, badan));
export const hapusPertemuan = (kelasId, pertemuanId, konfirmasi = false) => ambil(
  axiosInstance.delete(`${kelasUrl(kelasId)}/pertemuan/${pertemuanId}`, { params: konfirmasi ? { konfirmasi: 'hapus' } : undefined }),
);
export const urutPertemuan = (kelasId, idBerurutan) => ambil(
  axiosInstance.put(`${kelasUrl(kelasId)}/pertemuan/urutan`, { id_berurutan: idBerurutan }),
);

/**
 * Simpan kehadiran banyak pertemuan: satu permintaan per pertemuan (itu bentuk API-nya), berurutan.
 * `muatan` = Map(pertemuanId -> [{ siswa_id, kode }]), kode null menghapus catatan. Berhenti di pertemuan
 * pertama yang ditolak; pertemuan sebelumnya sudah tersimpan dan dilaporkan di `error.berhasil`, sedangkan
 * pertemuan yang gagal ada di `error.pertemuanGagal` beserta daftar catatannya di `error.catatanGagal`
 * (indeks galat dari server menunjuk ke daftar itu).
 */
export async function simpanKehadiranBanyak(kelasId, muatan) {
  const berhasil = [];
  const ringkasan = { disimpan: 0, tidak_berubah: 0, dihapus: 0 };
  for (const [pertemuanId, catatan] of muatan) {
    for (const potongan of potong(catatan, MAKS_SEL_PER_PERMINTAAN)) {
      try {
        const hasil = await ambil(axiosInstance.put(`${kelasUrl(kelasId)}/pertemuan/${pertemuanId}/kehadiran`, { catatan: potongan }));
        Object.keys(ringkasan).forEach((k) => { ringkasan[k] += hasil[k] ?? 0; });
        berhasil.push(...potongan.map((c) => ({ pertemuan_id: pertemuanId, siswa_id: c.siswa_id })));
      } catch (error) {
        error.berhasil = berhasil;
        error.pertemuanGagal = pertemuanId;
        error.catatanGagal = potongan;
        throw error;
      }
    }
  }
  return { berhasil, ringkasan };
}

// ---- remedial
export const tambahRemedial = (kelasId, badan) => ambil(axiosInstance.post(`${kelasUrl(kelasId)}/remedial`, badan));
export const ubahRemedial = (kelasId, remedialId, badan) => ambil(axiosInstance.patch(`${kelasUrl(kelasId)}/remedial/${remedialId}`, badan));
export const hapusRemedial = (kelasId, remedialId) => ambil(axiosInstance.delete(`${kelasUrl(kelasId)}/remedial/${remedialId}`));

/** Ambil pesan yang layak ditampilkan dari error axios, termasuk daftar galat per kolom (422). */
export function pesanGalat(error, cadangan = 'Terjadi kesalahan. Coba lagi.') {
  const data = error?.response?.data;
  if (!data) return error?.message === 'Network Error' ? 'Tidak dapat terhubung ke server.' : cadangan;
  return pesanDariRespons(data, cadangan);
}
