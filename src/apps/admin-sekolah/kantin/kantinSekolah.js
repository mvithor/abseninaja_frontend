// Logika murni pengelolaan & pengawasan Kantin Cashless oleh Admin Sekolah.
// Menyelaraskan validasi klien dengan abseninaja_backend/src/kantin/{skema,skema-rute}.js.

import {
  BATAS_KANTIN,
  buatKunciIdempotensi,
  formatRupiah,
  formatWaktu,
  metaJenisTransaksi,
  metaKategoriMenu,
  metaStatusDompet,
  metaStatusPencairan,
  metaStatusUnit,
  pesanGalatKantin,
  rentangTanggalQuery,
} from '../../admin-kantin/kantin.js';

export {
  BATAS_KANTIN,
  buatKunciIdempotensi,
  formatRupiah,
  formatWaktu,
  metaJenisTransaksi,
  metaKategoriMenu,
  metaStatusDompet,
  metaStatusPencairan,
  metaStatusUnit,
  pesanGalatKantin,
  rentangTanggalQuery,
};

export const KANTIN_SEKOLAH_API = '/api/v1/admin-sekolah/kantin';
export const ADMIN_KANTIN_AKUN_API = '/api/v1/admin-sekolah/admin-kantin';

export const KUNCI_KANTIN_SEKOLAH = Object.freeze({
  akunAdmin: 'admin-sekolah-kantin-akun',
  unit: 'admin-sekolah-kantin-unit',
  menuUnit: 'admin-sekolah-kantin-menu-unit',
  siswa: 'admin-sekolah-kantin-siswa',
  dompet: 'admin-sekolah-kantin-dompet',
  transaksi: 'admin-sekolah-kantin-transaksi',
  detailTransaksi: 'admin-sekolah-kantin-transaksi-detail',
  pencairan: 'admin-sekolah-kantin-pencairan',
  rekonsiliasi: 'admin-sekolah-kantin-rekonsiliasi',
});

export const BATAS_KANTIN_SEKOLAH = Object.freeze({
  NAMA_KANTIN_MIN: 3,
  NAMA_KANTIN_MAX: 150,
  PJ_MAX: 150,
  LOKASI_MAX: 255,
  ALASAN_RESET_PIN_MIN: 5,
  ALASAN_RESET_PIN_MAX: 300,
  REFERENSI_MAX: 100,
});

export const METODE_PENCAIRAN = Object.freeze([
  { kode: 'MANUAL', label: 'Tunai / Kas Sekolah (Manual)' },
  { kode: 'TRANSFER_BANK', label: 'Transfer Bank' },
  { kode: 'DISBURSEMENT_PG', label: 'Disbursement Payment Gateway' },
]);

export const STATUS_AWAL_PENCAIRAN = Object.freeze([
  { kode: 'SELESAI', label: 'Langsung Selesai' },
  { kode: 'MENUNGGU', label: 'Menunggu Settlement' },
]);

const POLA_PIN = /^[0-9]{6}$/;
const METODE_SAH = new Set(METODE_PENCAIRAN.map((m) => m.kode));
const STATUS_AWAL_SAH = new Set(STATUS_AWAL_PENCAIRAN.map((s) => s.kode));

// ---------------- Validasi & Payload Unit Kantin ----------------

export const validasiUnitKantin = ({ nama_kantin, penanggung_jawab, lokasi }) => {
  const nama = String(nama_kantin ?? '').trim();
  if (!nama) return 'Nama kantin wajib diisi.';
  if (nama.length < BATAS_KANTIN_SEKOLAH.NAMA_KANTIN_MIN) {
    return `Nama kantin minimal ${BATAS_KANTIN_SEKOLAH.NAMA_KANTIN_MIN} karakter.`;
  }
  if (nama.length > BATAS_KANTIN_SEKOLAH.NAMA_KANTIN_MAX) {
    return `Nama kantin maksimal ${BATAS_KANTIN_SEKOLAH.NAMA_KANTIN_MAX} karakter.`;
  }
  const pj = String(penanggung_jawab ?? '').trim();
  if (pj.length > BATAS_KANTIN_SEKOLAH.PJ_MAX) {
    return `Nama penanggung jawab maksimal ${BATAS_KANTIN_SEKOLAH.PJ_MAX} karakter.`;
  }
  const lok = String(lokasi ?? '').trim();
  if (lok.length > BATAS_KANTIN_SEKOLAH.LOKASI_MAX) {
    return `Lokasi kantin maksimal ${BATAS_KANTIN_SEKOLAH.LOKASI_MAX} karakter.`;
  }
  return '';
};

export const bangunPayloadUnitKantin = ({ mode = 'buat', form }) => {
  const adminId = form?.admin_kantin_id ? Number(form.admin_kantin_id) : null;
  const payload = {
    nama_kantin: String(form?.nama_kantin ?? '').trim(),
    admin_kantin_id: Number.isInteger(adminId) && adminId > 0 ? adminId : null,
    penanggung_jawab: String(form?.penanggung_jawab ?? '').trim() || null,
    lokasi: String(form?.lokasi ?? '').trim() || null,
  };
  if (mode === 'ubah') {
    payload.is_aktif = Boolean(form?.is_aktif);
  }
  return payload;
};

/** Memetakan daftar akun admin_kantin dan menandai apakah akun sudah tertaut ke unit lain. */
export const petakanOpsiAdminKantin = ({ akunList = [], kantinList = [], kantinDieditId = null }) => {
  const pemetaanTertaut = new Map();
  for (const k of kantinList) {
    if (k?.admin_kantin_id) {
      pemetaanTertaut.set(k.admin_kantin_id, k);
    }
  }
  return akunList.map((akun) => {
    const unitTertaut = pemetaanTertaut.get(akun.id);
    const tertautKeLain = Boolean(unitTertaut && unitTertaut.id !== kantinDieditId);
    return {
      ...akun,
      tertautKeUnit: unitTertaut?.nama_kantin || null,
      tertautKeLain,
      bisaDipilih: Boolean(akun.is_aktif) && !tertautKeLain,
    };
  });
};

// ---------------- Validasi & Payload Reset PIN Admin Sekolah ----------------

export const validasiResetPinSekolah = ({ pin_baru, alasan }) => {
  if (!POLA_PIN.test(String(pin_baru ?? ''))) {
    return 'PIN baru harus terdiri dari tepat 6 digit angka (0-9).';
  }
  const teks = String(alasan ?? '').trim();
  if (teks.length < BATAS_KANTIN_SEKOLAH.ALASAN_RESET_PIN_MIN) {
    return `Alasan reset PIN minimal ${BATAS_KANTIN_SEKOLAH.ALASAN_RESET_PIN_MIN} karakter.`;
  }
  if (teks.length > BATAS_KANTIN_SEKOLAH.ALASAN_RESET_PIN_MAX) {
    return `Alasan reset PIN maksimal ${BATAS_KANTIN_SEKOLAH.ALASAN_RESET_PIN_MAX} karakter.`;
  }
  return '';
};

export const bangunPayloadResetPinSekolah = ({ pin_baru, alasan }) => ({
  pin_baru: String(pin_baru),
  alasan: String(alasan ?? '').trim(),
});

// ---------------- Validasi & Payload Pencairan Dana Kantin ----------------

export const validasiPencairanSekolah = ({
  kantin_id,
  nominal,
  metode_pencairan,
  status,
  referensi_eksternal,
  catatan,
  saldoMengendap,
}) => {
  if (!kantin_id || Number(kantin_id) <= 0) {
    return 'Pilih unit kantin tujuan pencairan.';
  }
  const angka = Number(nominal);
  if (!Number.isInteger(angka) || angka <= 0) {
    return 'Nominal pencairan harus berupa bilangan bulat rupiah lebih dari 0.';
  }
  if (saldoMengendap !== null && saldoMengendap !== undefined && angka > Number(saldoMengendap)) {
    return `Nominal pencairan melebihi saldo mengendap unit (${formatRupiah(saldoMengendap)}).`;
  }
  if (!METODE_SAH.has(metode_pencairan)) {
    return 'Metode pencairan tidak valid.';
  }
  if (!STATUS_AWAL_SAH.has(status)) {
    return 'Status awal pencairan harus MENUNGGU atau SELESAI.';
  }
  if (String(referensi_eksternal ?? '').trim().length > BATAS_KANTIN_SEKOLAH.REFERENSI_MAX) {
    return `Referensi eksternal maksimal ${BATAS_KANTIN_SEKOLAH.REFERENSI_MAX} karakter.`;
  }
  if (String(catatan ?? '').trim().length > BATAS_KANTIN.CATATAN_MAX) {
    return `Catatan maksimal ${BATAS_KANTIN.CATATAN_MAX} karakter.`;
  }
  return '';
};

export const bangunPayloadPencairanSekolah = ({ form, idempotencyKey }) => {
  const ref = String(form?.referensi_eksternal ?? '').trim();
  const note = String(form?.catatan ?? '').trim();
  return {
    nominal: Math.trunc(Number(form?.nominal)),
    metode_pencairan: form?.metode_pencairan || 'MANUAL',
    status: form?.status || 'SELESAI',
    idempotency_key: idempotencyKey,
    ...(ref ? { referensi_eksternal: ref } : {}),
    ...(note ? { catatan: note } : {}),
  };
};

export const validasiUbahStatusPencairan = ({ status, referensi_eksternal, catatan }) => {
  if (status !== 'SELESAI' && status !== 'DIBATALKAN') {
    return 'Status tujuan harus SELESAI atau DIBATALKAN.';
  }
  if (String(referensi_eksternal ?? '').trim().length > BATAS_KANTIN_SEKOLAH.REFERENSI_MAX) {
    return `Referensi eksternal maksimal ${BATAS_KANTIN_SEKOLAH.REFERENSI_MAX} karakter.`;
  }
  if (String(catatan ?? '').trim().length > BATAS_KANTIN.CATATAN_MAX) {
    return `Catatan maksimal ${BATAS_KANTIN.CATATAN_MAX} karakter.`;
  }
  return '';
};

export const bangunPayloadUbahStatusPencairan = ({ status, referensi_eksternal, catatan }) => {
  const ref = String(referensi_eksternal ?? '').trim();
  const note = String(catatan ?? '').trim();
  return {
    status,
    ...(ref ? { referensi_eksternal: ref } : {}),
    ...(note ? { catatan: note } : {}),
  };
};
