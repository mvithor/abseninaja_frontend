// Fungsi murni untuk tombol geser bar tab (BarTabGradasi, prop `panah`): tab tetangga dan
// keadaan nonaktif di ujung. Tanpa React dan tanpa impor. Diuji di lib/geserTab.test.js.
// `tab` = [{ id }] sesuai urutan tampil. Hanya butir ber-`id` berupa teks tidak kosong yang
// dihitung; butir lain (null, tanpa id, id kosong atau bukan teks) dilewati, bukan
// menghentikan geser. `aktifId` yang tidak ada dianggap tab pertama (sama dengan roving
// tabindex BarTabGradasi).
//
// "Nonaktif" di sini hanya status. BarTabGradasi menampilkannya lewat `aria-disabled`
// (bukan atribut `disabled`) dan mengabaikan klik, supaya tombol yang sedang fokus tidak
// kehilangan fokus saat tab aktif mencapai ujung.

const idSah = (t) => typeof t?.id === 'string' && t.id !== '';

function tabSah(tab) {
  return Array.isArray(tab) ? tab.filter(idSah) : [];
}

function indeksAktif(sah, aktifId) {
  if (sah.length === 0) return -1;
  const i = sah.findIndex((t) => t.id === aktifId);
  return i === -1 ? 0 : i;
}

// Id tab di sebelah tab aktif: arah -1 (kiri) atau 1 (kanan). Di ujung, daftar kosong,
// atau arah selain -1 dan 1 -> null (tidak berputar, berbeda dari panah papan ketik).
export function tabTetangga(tab, aktifId, arah) {
  if (arah !== -1 && arah !== 1) return null;
  const sah = tabSah(tab);
  const i = indeksAktif(sah, aktifId);
  if (i === -1) return null;
  const n = i + arah;
  return n >= 0 && n < sah.length ? sah[n].id : null;
}

// Tombol mana yang nonaktif: kiri di tab pertama, kanan di tab terakhir. Daftar kosong:
// keduanya nonaktif.
export function panahNonaktif(tab, aktifId) {
  return { kiri: tabTetangga(tab, aktifId, -1) === null, kanan: tabTetangga(tab, aktifId, 1) === null };
}
