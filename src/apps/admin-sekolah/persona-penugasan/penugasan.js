// Logika murni halaman Penugasan Persona (tanpa React), supaya bisa diuji dengan node:test.
// Bentuk data mengikuti API backend /api/v1/admin-sekolah/persona-penugasan.

const STATUS_META = {
  aktif: { label: 'Aktif', bg: '#34C759', color: '#fff' },
  tidak_berlaku_saat_ini: { label: 'Tidak berlaku saat ini', bg: '#F48C06', color: '#fff' },
  dicabut: { label: 'Dicabut', bg: '#E0E0E0', color: '#424242' },
};

export const metaStatus = (status) =>
  STATUS_META[status] || { label: status || '-', bg: '#E0E0E0', color: '#424242' };

// Hanya penugasan yang belum dicabut yang bisa dicabut.
export const bisaDicabut = (item) => Boolean(item) && item.status !== 'dicabut';

const norm = (s) => String(s ?? '').toLowerCase();

// Cari berdasarkan nama pegawai, NIP, atau nama persona. Urutan dari server dipertahankan
// (terbaru dulu), tidak diurutkan abjad, karena penugasan terbaru yang paling dicari admin.
export const filterPenugasan = (daftar, kata) => {
  const q = norm(kata).trim();
  if (!Array.isArray(daftar)) return [];
  if (!q) return daftar;
  return daftar.filter((d) =>
    [d.pegawai?.nama, d.pegawai?.nip, d.label].some((v) => norm(v).includes(q)),
  );
};

// Catatan di kolom diisi dari server; format waktu mengikuti zona waktu sekolah.
export const formatWaktu = (iso, timeZone = 'Asia/Jakarta') => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(d);
  } catch {
    return d.toISOString();
  }
};

// Petunjuk yang ditampilkan di bawah pilihan persona, dan apakah pemberian harus ditahan.
// `persona` = satu entri dari katalog server; `tahunAjaranAktif` = {id,label} atau null.
export const petunjukPersona = (persona, tahunAjaranAktif) => {
  if (!persona) return { catatan: [], tahan: false, alasanTahan: '' };
  const catatan = [];
  let tahan = false;
  let alasanTahan = '';

  if (persona.perlu_tahun_ajaran) {
    if (!tahunAjaranAktif) {
      tahan = true;
      alasanTahan = 'Belum ada tahun ajaran aktif. Aktifkan tahun ajaran terlebih dahulu.';
    } else {
      catatan.push(
        `Berlaku untuk tahun ajaran ${tahunAjaranAktif.label}. Saat tahun ajaran berganti, penugasan ini tidak berlaku lagi dan perlu diberikan ulang.`,
      );
    }
  }
  if (persona.unik_per_sekolah) {
    catatan.push(
      `Hanya boleh ada satu ${persona.label} aktif per sekolah. Jika sudah ada, cabut penugasan lamanya terlebih dahulu.`,
    );
  }
  return { catatan, tahan, alasanTahan };
};

// Mengembalikan pesan galat, atau '' bila form siap dikirim.
export const validasiBeri = ({ pegawaiId, kode, katalog }) => {
  if (!kode) return 'Persona wajib dipilih.';
  const persona = katalog?.persona?.find((p) => p.kode === kode);
  if (!persona) return 'Persona tidak dikenal.';
  if (!pegawaiId) return 'Pegawai wajib dipilih.';
  const { tahan, alasanTahan } = petunjukPersona(persona, katalog?.tahun_ajaran_aktif || null);
  if (tahan) return alasanTahan;
  return '';
};

// Tahun ajaran sengaja TIDAK dikirim: server memakai tahun ajaran aktif untuk persona yang
// membutuhkannya, dan menolak (400) bila dikirim untuk persona yang tidak terikat tahun ajaran.
export const bangunPayloadBeri = ({ pegawaiId, kode, catatan }) => {
  const payload = { pegawai_id: Number(pegawaiId), kode_persona: kode };
  const teks = typeof catatan === 'string' ? catatan.trim() : '';
  if (teks) payload.catatan = teks;
  return payload;
};

// Pesan galat dari respons axios backend ({msg} atau {errors:[...]}).
export const pesanGalat = (err, fallback) => {
  const data = err?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length > 0) return data.errors.join(', ');
  if (data?.msg) return data.msg;
  return fallback;
};
