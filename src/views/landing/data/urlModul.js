// Tautan modul SMK (Prakersa). Berkas ini sengaja kecil dan tanpa impor: data
// halaman (untukSekolah.js, beranda.js) mengimpornya, dan node:test bisa memuat
// data itu langsung. Bila diimpor dari ./nav, node ikut memuat lib/gerbang.js yang
// membaca import.meta.env (tidak ada di node). data/nav.js mengekspor ulang
// URL_MODUL_SMK dari sini, jadi pemakai lama tidak berubah.
export const URL_MODUL_SMK = 'https://prakersa.abseninaja.com/';
