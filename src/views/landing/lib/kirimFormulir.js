// Adaptor pengiriman formulir konversi landing. Satu-satunya tempat yang
// berbicara ke jaringan.
//
// GERBANG RILIS (wajib beres sebelum landing masuk `main`):
//  1. Endpoint formulir di backend BELUM ADA. Setelah ada, isi
//     VITE_LANDING_FORM_URL (variabel build, bukan rahasia) dengan URL HTTPS-nya.
//  2. Kontak resmi (KONTAK_RESMI di data/kontak.js) harus beres, karena panel
//     "Formulir belum aktif" menaut ke WhatsApp hanya bila kontaknya resmi.
//
// Perilaku (satu bendera penentu: flags.formulirAktif di theme/tokens.js, yang
// memakai endpointValid yang sama dengan berkas ini):
//  - VITE_LANDING_FORM_URL valid (https; lib/endpoint.js) -> POST JSON
//    `{ jenis, payload, idKirim, curiga? }` ke URL itu. Tanpa cookie atau
//    kredensial (credentials: 'omit'), tanpa referrer, redirect: 'error',
//    batas waktu 15 detik, dapat dibatalkan lewat `signal`. Respons dengan
//    status bukan 2xx, `redirected`, atau content-type text/html ditolak
//    ('ditolak'). `idKirim` = id idempotensi yang sama pada percobaan ulang.
//    `curiga` hanya ada (true) bila kolom jebakan terisi.
//  - Tidak valid atau kosong, dan DEV -> SIMULASI: tunda sekitar 900 ms lalu
//    sukses. Pemicu gagal terkontrol: nama yang setelah dipangkas dan diubah ke
//    huruf kecil sama dengan "uji gagal" menolak dengan kode 'jaringan'.
//    Data tidak ke mana-mana.
//  - Tidak valid atau kosong, dan PRODUKSI -> menolak dengan kode 'nonaktif'.
//    Tidak pernah berpura-pura sukses: UI tidak boleh menampilkan "terkirim"
//    untuk data yang tidak pergi ke mana-mana.
//
// CATATAN UNTUK ENDPOINT (syarat sisi server): bila server menulis isian ke
// Google Sheets atau CSV, awali setiap sel yang dimulai dengan `=`, `+`, `-`,
// atau `@` dengan apostrof (') supaya tidak dieksekusi sebagai rumus (CSV/formula
// injection). Klien hanya memangkas dan membersihkan, tidak menetralkan rumus.
//
// Privasi: payload tidak pernah dicatat (tanpa console), tidak disimpan, tidak
// masuk URL, dan tidak ada pelacak. Pesan galat tidak memuat isi payload.
//
// Kode galat (`galat.kode`): 'nonaktif' | 'dibatalkan' | 'waktu' | 'jaringan' | 'ditolak'.
// Pengalihan (redirect) ditolak oleh fetch (redirect: 'error') dan muncul sebagai
// 'jaringan'; cabang `redirected` hanya pertahanan lapis kedua.
// Argumen `opsi` selain `signal`, `idKirim`, dan `curiga` hanya untuk pengujian.

import { endpointValid } from './endpoint.js';

export const BATAS_WAKTU_MS = 15000;
export const TUNDA_SIMULASI_MS = 900;
// Dibandingkan setelah trim dan huruf kecil.
export const NAMA_PEMICU_GAGAL = 'uji gagal';

export class GalatKirim extends Error {
  constructor(kode) {
    super(`Pengiriman formulir gagal: ${kode}`);
    this.name = 'GalatKirim';
    this.kode = kode;
  }
}

// Tunda yang bisa dibatalkan lewat signal.
function tunda(ms, signal) {
  return new Promise((selesai, tolak) => {
    if (signal?.aborted) {
      tolak(new GalatKirim('dibatalkan'));
      return;
    }
    const waktu = setTimeout(() => {
      signal?.removeEventListener('abort', batal);
      selesai();
    }, ms);
    function batal() {
      clearTimeout(waktu);
      tolak(new GalatKirim('dibatalkan'));
    }
    signal?.addEventListener('abort', batal, { once: true });
  });
}

async function kirimKeServer(url, amplop, signal, fetchFn, batasWaktu) {
  const kendali = new AbortController();
  let kehabisanWaktu = false;
  const dariLuar = () => kendali.abort();
  if (signal?.aborted) throw new GalatKirim('dibatalkan');
  signal?.addEventListener('abort', dariLuar, { once: true });
  const pewaktu = setTimeout(() => {
    kehabisanWaktu = true;
    kendali.abort();
  }, batasWaktu);

  try {
    const respons = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(amplop),
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
      redirect: 'error',
      signal: kendali.signal,
    });
    if (!respons.ok || respons.redirected) throw new GalatKirim('ditolak');
    const jenisIsi = respons.headers?.get?.('content-type');
    if (typeof jenisIsi === 'string' && jenisIsi.toLowerCase().includes('text/html')) throw new GalatKirim('ditolak');
    return { ok: true };
  } catch (e) {
    if (e instanceof GalatKirim) throw e;
    if (kehabisanWaktu) throw new GalatKirim('waktu');
    if (signal?.aborted) throw new GalatKirim('dibatalkan');
    throw new GalatKirim('jaringan');
  } finally {
    clearTimeout(pewaktu);
    signal?.removeEventListener('abort', dariLuar);
  }
}

// kirimFormulir(jenis, payload, { signal }) -> Promise<{ ok: true }>; menolak
// dengan GalatKirim.
export async function kirimFormulir(jenis, payload, opsi = {}) {
  const {
    signal,
    idKirim,
    curiga = false,
    url = import.meta.env?.VITE_LANDING_FORM_URL,
    dev = Boolean(import.meta.env?.DEV),
    fetchFn = (...argumen) => fetch(...argumen),
    batasWaktu = BATAS_WAKTU_MS,
    tundaSimulasi = TUNDA_SIMULASI_MS,
  } = opsi;

  const endpoint = endpointValid(url, { dev });
  if (endpoint) {
    const amplop = { jenis, payload };
    if (typeof idKirim === 'string' && idKirim !== '') amplop.idKirim = idKirim;
    if (curiga === true) amplop.curiga = true;
    return kirimKeServer(endpoint, amplop, signal, fetchFn, batasWaktu);
  }

  if (dev) {
    await tunda(tundaSimulasi, signal);
    if (typeof payload?.nama === 'string' && payload.nama.trim().toLowerCase() === NAMA_PEMICU_GAGAL) {
      throw new GalatKirim('jaringan');
    }
    return { ok: true };
  }

  throw new GalatKirim('nonaktif');
}
