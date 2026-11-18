// Logika murni formulir konversi landing (Jadwalkan Demo dan Akun Guru Mandiri):
// pembersihan, validasi, normalisasi, dan penyusunan payload.
//
// SENGAJA TANPA JSX, React, MUI, atau Vite (tanpa import.meta.env): diuji dengan
//   node --test src/views/landing/lib/
// tanpa dependensi tambahan. Satu-satunya impor adalah data/formulir.js (data
// murni tanpa impor), memakai ekstensi .js agar dikenali Node.
//
// Privasi: tidak ada console, penyimpanan, atau efek samping di sini. Isian
// hanya dibaca dan dikembalikan sebagai nilai baru.
import { KOLOM_JEBAKAN, PESAN_GALAT, SKEMA } from '../data/formulir.js';

const BATAS_MASUKAN_WA = 30; // panjang teks mentah, sebelum dinormalisasi
const BATAS_EMAIL_LOKAL = 64;
const BATAS_EMAIL = 254;

function daftarKolom(jenis) {
  // Object.hasOwn: "constructor", "toString", "__proto__" bukan jenis formulir.
  if (typeof jenis !== 'string' || !Object.hasOwn(SKEMA, jenis)) {
    throw new Error(`Jenis formulir tidak dikenal: ${String(jenis)}`);
  }
  return SKEMA[jenis];
}

const FORMAT_UNICODE = /^\p{Cf}$/u;

// Pangkas spasi, gabungkan spasi berulang (termasuk tab dan baris baru) menjadi
// satu, dan buang karakter kendali serta karakter format Unicode (kategori Cf:
// U+200B, U+200D, U+FEFF, U+202E, dst.) yang tak kasatmata atau membalik arah
// teks. Dibuang SEBELUM pemangkasan, jadi isian yang hanya berisi karakter
// tak kasatmata menjadi kosong. Nilai bukan teks menjadi ''. Semua tahap linear.
export function bersihkan(nilai) {
  if (typeof nilai !== 'string') return '';
  let hasil = '';
  let spasiTertunda = false;
  for (const ch of nilai) {
    const kode = ch.codePointAt(0);
    if (kode === 9 || kode === 10 || kode === 13 || ch.trim() === '') {
      // spasi, tab, baris baru, NBSP, dan sejenisnya: satu spasi, tidak di awal
      spasiTertunda = hasil.length > 0;
    } else if (kode >= 32 && kode !== 127 && !FORMAT_UNICODE.test(ch)) {
      if (spasiTertunda) hasil += ' ';
      spasiTertunda = false;
      hasil += ch;
    }
    // karakter kendali dan format lain dibuang
  }
  return hasil;
}

// Nomor WhatsApp Indonesia ke bentuk `628xxxxxxxxx`, atau null bila tidak valid.
// Diterima: `08xx`, `+62 8xx`, `62 8xx`, `0062 8xx`, dan penulisan dengan nol
// di depan setelah kode negara (`+62 0812...`, `62 0812...`), dengan spasi,
// tanda hubung, titik, dan kurung. Syarat: 9 sampai 13 digit setelah 62,
// diawali 8. `+` hanya di awal dan harus diikuti 62.
export function normalisasiWhatsapp(masuk) {
  if (typeof masuk !== 'string') return null;
  const s = masuk.trim();
  if (s.length === 0 || s.length > BATAS_MASUKAN_WA) return null;

  let digit = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c >= '0' && c <= '9') {
      digit += c;
    } else if (c === '+') {
      if (i !== 0) return null;
    } else if (c === '-' || c === '.' || c === '(' || c === ')' || c.trim() === '') {
      // pemisah yang diabaikan
    } else {
      return null;
    }
  }

  const berPlus = s[0] === '+';
  let sisa;
  if (!berPlus && digit.startsWith('0062')) sisa = digit.slice(4);
  else if (digit.startsWith('62')) sisa = digit.slice(2);
  else if (!berPlus && digit.startsWith('0')) sisa = digit.slice(1);
  else return null;
  // Penulisan "+62 0812...": satu nol di depan setelah kode negara dibuang.
  if (digit.startsWith('62') || digit.startsWith('0062')) {
    if (sisa.charAt(0) === '0') sisa = sisa.slice(1);
  }

  if (sisa.charAt(0) !== '8') return null;
  if (sisa.length < 9 || sisa.length > 13) return null;
  return `62${sisa}`;
}

// Pemeriksaan email sederhana tanpa ekspresi reguler: satu `@`, bagian lokal dan
// domain tidak kosong, domain punya titik di tengah, tanpa spasi atau titik
// ganda. Bukan pengganti verifikasi oleh server.
export function emailValid(masuk) {
  if (typeof masuk !== 'string') return false;
  const s = masuk.trim();
  if (s.length < 5 || s.length > BATAS_EMAIL) return false;
  for (let i = 0; i < s.length; i++) {
    const kode = s.charCodeAt(i);
    if (kode <= 32 || kode === 127) return false;
  }
  const at = s.indexOf('@');
  if (at < 1 || at !== s.lastIndexOf('@')) return false;
  const lokal = s.slice(0, at);
  const domain = s.slice(at + 1);
  if (lokal.length > BATAS_EMAIL_LOKAL) return false;
  if (lokal.startsWith('.') || lokal.endsWith('.') || lokal.includes('..')) return false;
  if (domain.length < 3 || domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) return false;
  const titik = domain.lastIndexOf('.');
  if (titik < 1 || domain.length - titik - 1 < 2) return false;
  const bagian = domain.split('.');
  return bagian.every((b) => b.length > 0 && !b.startsWith('-') && !b.endsWith('-'));
}

// Nilai awal semua kolom (termasuk kolom jebakan) untuk keadaan formulir.
export function nilaiAwal(jenis) {
  const awal = { [KOLOM_JEBAKAN]: '' };
  daftarKolom(jenis).forEach((k) => {
    awal[k.nama] = k.awal ?? '';
  });
  return awal;
}

function galatKolom(kolom, mentah) {
  const v = bersihkan(mentah);
  if (v === '') return kolom.wajib ? (kolom.jenis === 'pilihan' ? PESAN_GALAT.wajibPilih(kolom.label) : PESAN_GALAT.wajibIsi(kolom.label)) : null;

  if (kolom.jenis === 'pilihan') {
    return kolom.opsi.some((o) => o.nilai === v) ? null : PESAN_GALAT.pilihanTidakDikenal(kolom.label);
  }
  if (kolom.jenis === 'whatsapp') {
    return normalisasiWhatsapp(v) === null ? PESAN_GALAT.whatsapp : null;
  }
  if (kolom.maks && v.length > kolom.maks) return PESAN_GALAT.terlaluPanjang(kolom.label, kolom.maks);
  if (kolom.jenis === 'email' && !emailValid(v)) return PESAN_GALAT.email;
  return null;
}

// Validasi semua kolom. `galat` memuat pesan per nama kolom (hanya yang
// bermasalah); `kolomPertama` = kolom bergalat pertama menurut urutan skema,
// untuk memindahkan fokus.
export function validasi(jenis, nilai) {
  const galat = {};
  let kolomPertama = null;
  daftarKolom(jenis).forEach((kolom) => {
    const pesan = galatKolom(kolom, nilai?.[kolom.nama]);
    if (pesan) {
      galat[kolom.nama] = pesan;
      if (kolomPertama === null) kolomPertama = kolom.nama;
    }
  });
  return { valid: kolomPertama === null, galat, kolomPertama };
}

// Payload bersih untuk dikirim: hanya kolom skema (kolom jebakan dan kunci lain
// dibuang), teks dipangkas, kolom opsional kosong dihilangkan, WhatsApp menjadi
// `628...`, email menjadi huruf kecil. Dipanggil setelah validasi lolos.
export function susunPayload(jenis, nilai) {
  const payload = {};
  daftarKolom(jenis).forEach((kolom) => {
    const v = bersihkan(nilai?.[kolom.nama]);
    if (v === '') return;
    if (kolom.jenis === 'whatsapp') {
      const wa = normalisasiWhatsapp(v);
      if (wa !== null) payload[kolom.nama] = wa; // tidak valid: dibuang, bukan null
    } else if (kolom.jenis === 'email') payload[kolom.nama] = v.toLowerCase();
    else payload[kolom.nama] = v;
  });
  return payload;
}

// Kolom jebakan terisi (bukan hanya spasi): pengirim mencurigakan (bot, atau
// pengisi otomatis). Hanya menjadi penanda; lihat siapkanKirim.
export function jebakanTerisi(nilai) {
  return bersihkan(nilai?.[KOLOM_JEBAKAN]) !== '';
}

// Keputusan satu langkah saat formulir dikirim:
//  { status: 'galat', galat, kolomPertama }       -> tampilkan galat, fokus ke kolom
//  { status: 'siap', payload }                    -> kirim payload
//  { status: 'siap', payload, curiga: true }      -> kirim, kolom jebakan terisi
//
// Data pengguna TIDAK PERNAH dibuang. Pengisi otomatis peramban atau ekstensi
// bisa mengisi kolom jebakan pada pengguna asli; membuang formulir mereka diam-diam
// lebih mahal daripada menerima sebagian spam. Karena itu kolom jebakan hanya
// menjadi penanda `curiga` di amplop (di luar `payload`) agar server dapat
// menyaringnya. Validasi tetap berjalan lebih dulu dan galat tampil normal
// (pengguna nyata yang terkena isian otomatis harus tetap bisa memperbaiki
// formulirnya); ini tidak membocorkan petunjuk tambahan karena kolom jebakan
// tidak ikut divalidasi. Kunci `curiga` tidak ada bila kolom jebakan kosong.
export function siapkanKirim(jenis, nilai) {
  const hasil = validasi(jenis, nilai);
  if (!hasil.valid) return { status: 'galat', galat: hasil.galat, kolomPertama: hasil.kolomPertama };
  const siap = { status: 'siap', payload: susunPayload(jenis, nilai) };
  if (jebakanTerisi(nilai)) siap.curiga = true;
  return siap;
}

// Id kirim untuk idempotensi: dibuat sekali per instance formulir dan dipakai
// ulang pada percobaan ulang. `crypto.randomUUID()` bila ada; fallback ke
// getRandomValues, lalu ke Math.random (tidak perlu kuat secara kriptografi,
// hanya perlu unik untuk satu sesi). Bentuk UUID versi 4.
export function buatIdKirim(kripto = globalThis.crypto) {
  if (kripto && typeof kripto.randomUUID === 'function') return kripto.randomUUID();
  const b = new Uint8Array(16);
  if (kripto && typeof kripto.getRandomValues === 'function') kripto.getRandomValues(b);
  else for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0'));
  return `${h.slice(0, 4).join('')}-${h.slice(4, 6).join('')}-${h.slice(6, 8).join('')}-${h.slice(8, 10).join('')}-${h.slice(10).join('')}`;
}
