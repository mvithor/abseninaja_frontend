// Logika murni portal Admin Kantin (tanpa React), agar dapat diuji langsung dengan node:test
// serta menjaga aturan React Fast Refresh (pemisahan berkas .js dan .jsx).
// Validasi klien mencerminkan aturan abseninaja_backend/src/kantin/skema.js.

export const KANTIN_API = '/api/v1/kantin';

export const KUNCI_KANTIN = Object.freeze({
  profil: 'kantin-profil',
  menu: 'kantin-menu',
  siswa: 'kantin-siswa',
  dompet: 'kantin-dompet',
  transaksi: 'kantin-transaksi',
  detailTransaksi: 'kantin-transaksi-detail',
  pencairan: 'kantin-pencairan',
  rekonsiliasi: 'kantin-rekonsiliasi',
});

export const BATAS_KANTIN = Object.freeze({
  NAMA_MENU_MIN: 2,
  NAMA_MENU_MAX: 150,
  CATATAN_MAX: 500,
  ALASAN_REVERSAL_MIN: 5,
  ALASAN_REVERSAL_MAX: 500,
  PIN_PANJANG: 6,
  NOMINAL_TOPUP_PRESET: Object.freeze([10000, 20000, 50000, 100000]),
});

export const KATEGORI_MENU = Object.freeze([
  { kode: 'makanan', label: 'Makanan' },
  { kode: 'minuman', label: 'Minuman' },
  { kode: 'snack', label: 'Snack' },
  { kode: 'lainnya', label: 'Lainnya' },
]);

const KATEGORI_SAH = new Set(KATEGORI_MENU.map((k) => k.kode));
const POLA_PIN = /^[0-9]{6}$/;

/** Memformat bilangan bulat rupiah ke tampilan lokal Indonesia. */
export const formatRupiah = (nilai) => {
  const angka = Number(nilai);
  if (!Number.isFinite(angka)) return 'Rp 0';
  return `Rp ${Math.trunc(angka).toLocaleString('id-ID')}`;
};

/** Memformat ISO timestamp server menggunakan zona waktu sekolah setempat. */
export const formatWaktu = (iso, timeZone = 'Asia/Jakarta') => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone,
    }).format(d);
  } catch {
    return d.toISOString();
  }
};

/** Membuat kunci idempotensi baru per percobaan submit transaksi finansial. */
export const buatKunciIdempotensi = (awalan = 'knt') => {
  const prefix = String(awalan || 'knt')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 16) || 'knt';
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `${prefix}-${globalThis.crypto.randomUUID()}`.slice(0, 100);
  }
  const acak = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${acak}`.slice(0, 100);
};

export const metaStatusUnit = (isAktif) =>
  isAktif
    ? { label: 'Unit Aktif', color: 'success' }
    : { label: 'Unit Nonaktif', color: 'warning' };

export const metaKetersediaanMenu = (isTersedia) =>
  isTersedia
    ? { label: 'Tersedia', color: 'success' }
    : { label: 'Habis', color: 'default' };

export const metaKategoriMenu = (kategori) => {
  const ketemu = KATEGORI_MENU.find((k) => k.kode === kategori);
  return ketemu ? ketemu.label : kategori || '-';
};

export const metaJenisTransaksi = (jenis) => {
  if (jenis === 'BELANJA') return { label: 'Belanja Kasir', color: 'primary', tanda: '-' };
  if (jenis === 'TOPUP') return { label: 'Top-Up Saldo', color: 'success', tanda: '+' };
  if (jenis === 'REVERSAL') return { label: 'Reversal / Refund', color: 'warning', tanda: '+' };
  return { label: jenis || '-', color: 'default', tanda: '' };
};

export const metaStatusPencairan = (status) => {
  if (status === 'SELESAI') return { label: 'Selesai', color: 'success' };
  if (status === 'MENUNGGU') return { label: 'Menunggu', color: 'warning' };
  if (status === 'DIBATALKAN') return { label: 'Dibatalkan', color: 'error' };
  return { label: status || '-', color: 'default' };
};

/** Mengubah status dompet siswa menjadi chip teks yang jelas (tidak bergantung pada warna saja). */
export const metaStatusDompet = (dompet, now = new Date()) => {
  if (!dompet) return { label: 'Belum Aktif', color: 'default', bisaBelanja: false };
  if (!dompet.is_aktif) return { label: 'Dinonaktifkan', color: 'error', bisaBelanja: false };
  if (dompet.terkunci_sampai && new Date(dompet.terkunci_sampai).getTime() > now.getTime()) {
    return { label: 'PIN Terkunci', color: 'error', bisaBelanja: false };
  }
  if (!dompet.punya_pin) return { label: 'Belum Ada PIN', color: 'warning', bisaBelanja: false };
  return { label: 'Siap Transaksi', color: 'success', bisaBelanja: true };
};

/** Menghitung sisa limit jajan harian siswa; mengembalikan null bila tidak dibatasi. */
export const sisaLimitHarian = (dompet, pemakaianHariIni = 0) => {
  if (!dompet || dompet.limit_harian === null || dompet.limit_harian === undefined) return null;
  const limit = Number(dompet.limit_harian);
  const terpakai = Math.max(0, Number(pemakaianHariIni) || 0);
  if (!Number.isFinite(limit)) return null;
  return Math.max(0, limit - terpakai);
};

// ---------------- Keranjang POS Kasir ----------------

export const tambahItemKeranjang = (keranjang, menu) => {
  const list = Array.isArray(keranjang) ? keranjang : [];
  if (!menu || !menu.id) return list;
  const ada = list.find((it) => it.menu_id === menu.id);
  if (ada) {
    return list.map((it) =>
      it.menu_id === menu.id
        ? {
            ...it,
            nama_menu: menu.nama_menu ?? it.nama_menu,
            harga: Number(menu.harga ?? it.harga),
            jumlah: it.jumlah + 1,
          }
        : it,
    );
  }
  return [
    ...list,
    {
      menu_id: Number(menu.id),
      nama_menu: menu.nama_menu || 'Menu',
      harga: Math.max(0, Math.trunc(Number(menu.harga) || 0)),
      jumlah: 1,
    },
  ];
};

export const ubahJumlahKeranjang = (keranjang, menuId, delta) => {
  const list = Array.isArray(keranjang) ? keranjang : [];
  return list
    .map((it) => (it.menu_id === menuId ? { ...it, jumlah: it.jumlah + delta } : it))
    .filter((it) => it.jumlah > 0);
};

export const hitungRingkasanKeranjang = (keranjang) => {
  const list = Array.isArray(keranjang) ? keranjang : [];
  let jumlahQty = 0;
  let totalNominal = 0;
  for (const it of list) {
    const qty = Math.max(0, Math.trunc(Number(it.jumlah) || 0));
    const harga = Math.max(0, Math.trunc(Number(it.harga) || 0));
    jumlahQty += qty;
    totalNominal += qty * harga;
  }
  return {
    jumlahItem: list.length,
    jumlahQty,
    totalNominal,
  };
};

// ---------------- Validasi & Payload Builders ----------------

export const validasiMenu = ({ nama_menu, kategori, harga, foto_url }) => {
  const nama = String(nama_menu ?? '').trim();
  if (!nama) return 'Nama menu wajib diisi.';
  if (nama.length < BATAS_KANTIN.NAMA_MENU_MIN) {
    return `Nama menu minimal ${BATAS_KANTIN.NAMA_MENU_MIN} karakter.`;
  }
  if (nama.length > BATAS_KANTIN.NAMA_MENU_MAX) {
    return `Nama menu maksimal ${BATAS_KANTIN.NAMA_MENU_MAX} karakter.`;
  }
  if (!KATEGORI_SAH.has(kategori)) {
    return 'Kategori menu harus salah satu dari makanan, minuman, snack, atau lainnya.';
  }
  const hargaNum = Number(harga);
  if (harga === '' || harga === null || harga === undefined || !Number.isInteger(hargaNum) || hargaNum < 0) {
    return 'Harga menu harus berupa bilangan bulat rupiah minimal 0.';
  }
  const url = String(foto_url ?? '').trim();
  if (url) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return 'URL foto menu harus diawali http:// atau https://.';
      }
    } catch {
      return 'Format URL foto menu tidak valid.';
    }
  }
  return '';
};

export const bangunPayloadMenu = ({ nama_menu, kategori, harga, is_tersedia, foto_url }) => {
  const url = String(foto_url ?? '').trim();
  return {
    nama_menu: String(nama_menu ?? '').trim(),
    kategori,
    harga: Math.trunc(Number(harga)),
    is_tersedia: Boolean(is_tersedia),
    foto_url: url || null,
  };
};

export const validasiPinForm = ({ pin_baru, pin_lama, punyaPin }) => {
  if (punyaPin) {
    if (!pin_lama || !POLA_PIN.test(String(pin_lama))) {
      return 'PIN lama wajib diisi berupa tepat 6 digit angka.';
    }
  }
  if (!pin_baru || !POLA_PIN.test(String(pin_baru))) {
    return 'PIN baru harus terdiri dari tepat 6 digit angka (0-9).';
  }
  return '';
};

export const bangunPayloadPin = ({ pin_baru, pin_lama, punyaPin }) => {
  const payload = { pin_baru: String(pin_baru) };
  if (punyaPin) payload.pin_lama = String(pin_lama);
  return payload;
};

export const validasiLimitForm = ({ tanpaBatas, limit_harian }) => {
  if (tanpaBatas) return '';
  const angka = Number(limit_harian);
  if (limit_harian === '' || limit_harian === null || limit_harian === undefined) {
    return 'Masukkan nominal limit harian atau pilih Tanpa Batas.';
  }
  if (!Number.isInteger(angka) || angka < 0) {
    return 'Limit belanja harian harus berupa bilangan bulat non-negatif.';
  }
  return '';
};

export const bangunPayloadLimit = ({ tanpaBatas, limit_harian }) => ({
  limit_harian: tanpaBatas ? null : Math.trunc(Number(limit_harian)),
});

export const validasiTopup = ({ siswa, nominal, catatan }) => {
  if (!siswa?.id) return 'Pilih siswa penerima top-up terlebih dahulu.';
  const angka = Number(nominal);
  if (!Number.isInteger(angka) || angka <= 0) {
    return 'Nominal top-up harus berupa bilangan bulat lebih dari 0 rupiah.';
  }
  if (String(catatan ?? '').trim().length > BATAS_KANTIN.CATATAN_MAX) {
    return `Catatan maksimal ${BATAS_KANTIN.CATATAN_MAX} karakter.`;
  }
  return '';
};

export const bangunPayloadTopup = ({ siswaId, nominal, idempotencyKey, catatan }) => {
  const teks = String(catatan ?? '').trim();
  return {
    siswa_id: siswaId,
    nominal: Math.trunc(Number(nominal)),
    idempotency_key: idempotencyKey,
    ...(teks ? { catatan: teks } : {}),
  };
};

export const validasiCheckout = ({ siswa, dompet, pemakaianHariIni = 0, keranjang, pin, unitAktif = true, now = new Date() }) => {
  if (!unitAktif) return 'Unit kantin sedang dinonaktifkan sehingga transaksi kasir dikunci sementara.';
  if (!siswa?.id) return 'Pilih atau scan kartu siswa terlebih dahulu.';
  if (!dompet) return 'Siswa ini belum memiliki dompet aktif. Silakan top-up atau atur PIN dompet terlebih dahulu.';
  if (!dompet.is_aktif) return 'Dompet siswa sedang dinonaktifkan.';
  if (!dompet.punya_pin) return 'PIN dompet siswa belum diatur. Atur PIN terlebih dahulu di menu Dompet Siswa.';
  if (dompet.terkunci_sampai && new Date(dompet.terkunci_sampai).getTime() > now.getTime()) {
    return 'Dompet terkunci sementara akibat batas percobaan PIN salah.';
  }
  const { jumlahItem, totalNominal } = hitungRingkasanKeranjang(keranjang);
  if (jumlahItem === 0) return 'Keranjang belanja masih kosong.';
  if (totalNominal <= 0) return 'Total belanja harus lebih dari Rp 0.';
  if (Number(dompet.saldo) < totalNominal) {
    return `Saldo siswa (${formatRupiah(dompet.saldo)}) tidak mencukupi total belanja (${formatRupiah(totalNominal)}).`;
  }
  const sisa = sisaLimitHarian(dompet, pemakaianHariIni);
  if (sisa !== null && totalNominal > sisa) {
    return `Total belanja melebihi sisa limit harian siswa (${formatRupiah(sisa)}).`;
  }
  if (!POLA_PIN.test(String(pin ?? ''))) {
    return 'PIN siswa wajib berupa 6 digit angka.';
  }
  return '';
};

export const bangunPayloadCheckout = ({ siswaId, pin, keranjang, idempotencyKey, catatan }) => {
  const teks = String(catatan ?? '').trim();
  return {
    siswa_id: siswaId,
    pin: String(pin),
    items: (keranjang || []).map((it) => ({
      menu_id: Number(it.menu_id),
      jumlah: Math.trunc(Number(it.jumlah)),
    })),
    idempotency_key: idempotencyKey,
    ...(teks ? { catatan: teks } : {}),
  };
};

export const validasiReversal = ({ transaksi, alasan }) => {
  if (!transaksi?.id) return 'Transaksi tidak valid.';
  if (transaksi.jenis_transaksi !== 'BELANJA') {
    return 'Hanya transaksi BELANJA yang dapat dilakukan reversal.';
  }
  if (transaksi.reversal) {
    return 'Transaksi ini sudah pernah direversal.';
  }
  const teks = String(alasan ?? '').trim();
  if (teks.length < BATAS_KANTIN.ALASAN_REVERSAL_MIN) {
    return `Alasan reversal minimal ${BATAS_KANTIN.ALASAN_REVERSAL_MIN} karakter.`;
  }
  if (teks.length > BATAS_KANTIN.ALASAN_REVERSAL_MAX) {
    return `Alasan reversal maksimal ${BATAS_KANTIN.ALASAN_REVERSAL_MAX} karakter.`;
  }
  return '';
};

export const bangunPayloadReversal = ({ alasan, idempotencyKey }) => ({
  alasan: String(alasan ?? '').trim(),
  idempotency_key: idempotencyKey,
});

// ---------------- Gerbang Konteks & Galat ----------------

export const pesanGalatKantin = (err, fallback = 'Terjadi kesalahan saat memproses permintaan.') => {
  const data = err?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length > 0) return data.errors.join(', ');
  if (data?.msg) return data.msg;
  if (data?.message) return data.message;
  return fallback;
};

/** Menafsirkan status GET /api/v1/kantin/profil untuk GerbangKonteksKantin. */
export const bacaStatusGerbangKantin = ({ isError, error, profilData }) => {
  if (isError) {
    const httpStatus = error?.response?.status;
    const kode = error?.response?.data?.kode;
    if (httpStatus === 404 || kode === 'KANTIN_TIDAK_DITEMUKAN') {
      return {
        status: 'tautan_belum_ada',
        judul: 'Akun admin kantin belum ditautkan ke unit kantin',
        keterangan:
          error?.response?.data?.msg ||
          'Hubungi Admin Sekolah untuk menautkan akun Anda ke unit kantin terlebih dahulu.',
        unitAktif: false,
      };
    }
    if (httpStatus === 403) {
      return {
        status: 'terlarang',
        judul: 'Akses Portal Admin Kantin ditolak',
        keterangan:
          error?.response?.data?.msg ||
          'Akun admin kantin Anda sedang dinonaktifkan atau tidak memiliki akses ke portal ini.',
        unitAktif: false,
      };
    }
    return {
      status: 'galat',
      judul: 'Gagal memuat profil unit kantin',
      keterangan: pesanGalatKantin(error, 'Periksa koneksi internet Anda lalu coba lagi.'),
      unitAktif: false,
    };
  }

  const unitAktif = Boolean(profilData?.kantin?.is_aktif);
  return {
    status: 'ok',
    judul: '',
    keterangan: unitAktif
      ? ''
      : 'Unit kantin sedang dinonaktifkan oleh Admin Sekolah. Anda tetap dapat melihat profil, riwayat transaksi, pencairan, dan laporan rekonsiliasi, namun kasir POS, kelola menu, dan dompet siswa dikunci sementara.',
    unitAktif,
  };
};
