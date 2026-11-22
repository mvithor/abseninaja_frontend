// Sepuluh peran halaman Fitur Lengkap (urutan = urutan tab, naskah bagian C), satu berkas
// per tab supaya data tidak menjadi satu berkas ribuan baris. Diekspor ulang dari
// data/fitur.js sebagai PERAN. Import memakai ekstensi .js agar node:test bisa memuatnya.

import { PERAN_ADMIN } from './admin.js';
import { PERAN_GURU } from './guru.js';
import { PERAN_WALI } from './wali.js';
import { PERAN_MURID } from './murid.js';
import { PERAN_PMB } from './pmb.js';
import { PERAN_KANTIN } from './kantin.js';
import { PERAN_WAKA } from './waka.js';
import { PERAN_BK } from './bk.js';
import { PERAN_KEPSEK } from './kepsek.js';
import { PERAN_JURUSAN } from './jurusan.js';

export const PERAN = [PERAN_ADMIN, PERAN_GURU, PERAN_WALI, PERAN_MURID, PERAN_PMB, PERAN_KANTIN, PERAN_WAKA, PERAN_BK, PERAN_KEPSEK, PERAN_JURUSAN];
