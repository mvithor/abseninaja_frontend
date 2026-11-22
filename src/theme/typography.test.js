import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Penjaga kebocoran font: tema aplikasi tidak boleh menyebut Poppins. Poppins dimuat
// oleh LandingLayout dan bertahan di <head> selama sesi SPA, jadi sebutan Poppins di
// tema membuat seluruh dashboard berganti font setelah pengguna membuka landing.
// Berkas dibaca sebagai teks karena Typography.jsx tidak bisa diimpor langsung oleh node.
const sumber = readFileSync(new URL('./Typography.jsx', import.meta.url), 'utf8');
const baris = sumber.split('\n').find((b) => /^\s*fontFamily\s*:/.test(b)) || '';

test('tema aplikasi memiliki satu pengaturan fontFamily', () => {
  assert.notEqual(baris, '', 'baris fontFamily tidak ditemukan di Typography.jsx');
});

test('fontFamily tema aplikasi tidak menyebut Poppins', () => {
  assert.ok(!/poppins/i.test(baris), `fontFamily masih menyebut Poppins: ${baris.trim()}`);
});

test('fontFamily tema aplikasi tanpa titik koma di dalam string', () => {
  const nilai = baris.match(/fontFamily\s*:\s*(["'`])(.*?)\1/);
  assert.ok(nilai, 'nilai fontFamily bukan string literal');
  assert.ok(!nilai[2].includes(';'), `ada titik koma di dalam nilai: ${nilai[2]}`);
});

test('tema aplikasi memakai font sistem atau tumpukan yang dimuat index.html', () => {
  const nilai = baris.match(/fontFamily\s*:\s*(["'`])(.*?)\1/)[2];
  assert.match(nilai, /sans-serif/);
});
