import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bacaKodeSel, kunciSel, petaKehadiran, kodeEfektif, rekapSiswa, rekapPertemuan, selUntukSemuaHadir,
  terapkanIsian, hitungPengosonganKode, susunMuatanSimpan, uraiTanggal, tanggalPanjang, tanggalPendek,
  namaZona, periksaTanggalPertemuan, idKronologis, perluUrutKronologis, labelLm,
} from './kehadiran.js';

test('bacaKodeSel: kode, huruf kecil, spasi, dan nama status Absenin', () => {
  const k = (t) => bacaKodeSel(t).kode;
  assert.equal(k('H'), 'H');
  assert.equal(k(' s '), 'S');
  assert.equal(k('i'), 'I');
  assert.equal(k('a'), 'A');
  assert.equal(k('Hadir'), 'H');
  assert.equal(k('terlambat'), 'H');
  assert.equal(k('Sakit'), 'S');
  assert.equal(k('IZIN'), 'I');
  assert.equal(k('Alpa'), 'A');
  assert.equal(k('alpha'), 'A');
  assert.equal(k('TK'), 'A');
  assert.equal(k('tanpa   keterangan'), 'A');
});

test('bacaKodeSel: kosong berarti belum dicatat, bukan alpa', () => {
  for (const t of ['', '   ', null, undefined]) assert.deepEqual(bacaKodeSel(t), { kode: null });
});

test('bacaKodeSel: libur dan isian asing ditolak dengan pesan', () => {
  assert.match(bacaKodeSel('L').galat, /libur/);
  assert.match(bacaKodeSel('libur').galat, /libur/);
  for (const t of ['X', 'HH', '1', '0', 'hadirr', 'T', 'TKA']) assert.match(bacaKodeSel(t).galat, /H, S, I, atau A/, t);
  assert.equal(bacaKodeSel('toString').galat !== undefined, true, 'nama properti objek bukan kode');
  assert.equal(bacaKodeSel('constructor').galat !== undefined, true);
});

const siswa = [{ id: 1 }, { id: 2 }, { id: 3 }];
const pert = [{ id: 10, nomor: 1, tanggal: '2026-08-03' }, { id: 11, nomor: 2, tanggal: '2026-08-04' }];
const server = petaKehadiran([
  { siswa_id: 1, pertemuan_id: 10, kode: 'H' },
  { siswa_id: 2, pertemuan_id: 10, kode: 'A' },
  { siswa_id: 1, pertemuan_id: 11, kode: 'S' },
]);

test('petaKehadiran dan kodeEfektif: isian menimpa server, kosong menimpa jadi kosong, salah ketik tidak dihitung', () => {
  assert.equal(server.get(kunciSel(2, 10)), 'A');
  assert.deepEqual(kodeEfektif('2:10', {}, server), { kode: 'A', galat: null });
  assert.deepEqual(kodeEfektif('2:10', { '2:10': 'i' }, server), { kode: 'I', galat: null });
  assert.deepEqual(kodeEfektif('2:10', { '2:10': '' }, server), { kode: null, galat: null });
  assert.equal(kodeEfektif('2:10', { '2:10': 'z' }, server).kode, null);
  assert.ok(kodeEfektif('2:10', { '2:10': 'z' }, server).galat);
  assert.deepEqual(kodeEfektif('3:10', {}, server), { kode: null, galat: null });
});

test('rekapSiswa dan rekapPertemuan menghitung yang tercatat saja', () => {
  assert.deepEqual(rekapSiswa(1, pert, {}, server), { H: 1, S: 1, I: 0, A: 0, tercatat: 2 });
  assert.deepEqual(rekapSiswa(3, pert, {}, server), { H: 0, S: 0, I: 0, A: 0, tercatat: 0 });
  assert.deepEqual(rekapPertemuan(10, siswa, {}, server), { H: 1, S: 0, I: 0, A: 1, belum: 1 });
  assert.deepEqual(rekapPertemuan(11, siswa, { '2:11': 'a', '3:11': 'q' }, server), { H: 0, S: 1, I: 0, A: 1, belum: 1 });
  // isian yang belum disimpan ikut terlihat; sel kosong yang ditimpakan mengurangi
  assert.deepEqual(rekapSiswa(2, pert, { '2:10': '' }, server), { H: 0, S: 0, I: 0, A: 0, tercatat: 0 });
});

test('selUntukSemuaHadir: hanya sel yang belum dicatat, tidak menimpa catatan server atau isian', () => {
  assert.deepEqual(selUntukSemuaHadir(10, siswa, {}, server), ['3:10']);
  assert.deepEqual(selUntukSemuaHadir(11, siswa, {}, server), ['2:11', '3:11']);
  assert.deepEqual(selUntukSemuaHadir(11, siswa, { '2:11': 'S' }, server), ['3:11']);
  // sel server yang sedang dikosongkan di layar dihitung belum dicatat
  assert.deepEqual(selUntukSemuaHadir(10, siswa, { '2:10': '' }, server), ['2:10', '3:10']);
  // sel salah ketik dianggap sudah diisi (guru harus memperbaikinya sendiri)
  assert.deepEqual(selUntukSemuaHadir(10, siswa, { '3:10': 'zz' }, server), []);
});

test('terapkanIsian: sama dengan server membersihkan sel; beda menyimpan teks apa adanya', () => {
  assert.deepEqual(terapkanIsian({}, '1:10', 'h', server), {}, 'huruf kecil setara H di server');
  assert.deepEqual(terapkanIsian({ '1:10': 'S' }, '1:10', 'H', server), {});
  assert.deepEqual(terapkanIsian({}, '1:10', 'S', server), { '1:10': 'S' });
  assert.deepEqual(terapkanIsian({}, '3:10', '', server), {}, 'kosong di atas sel kosong tidak berubah');
  assert.deepEqual(terapkanIsian({}, '3:10', 'z', server), { '3:10': 'z' }, 'salah ketik tetap dicatat agar terlihat');
  assert.deepEqual(terapkanIsian({ '3:10': 'H' }, '1:10', 'S', server), { '3:10': 'H', '1:10': 'S' });
});

test('hitungPengosonganKode: hanya sel server yang dikosongkan', () => {
  assert.equal(hitungPengosonganKode({ '1:10': '', '2:10': ' ', '3:10': '' }, server), 2);
  assert.equal(hitungPengosonganKode({ '1:10': 'S', '3:10': '' }, server), 0);
  assert.equal(hitungPengosonganKode({ '1:10': 'zz' }, server), 0);
});

test('susunMuatanSimpan: per pertemuan, kosong menjadi null, salah ketik dilewati, urut siswa', () => {
  const m = susunMuatanSimpan({ '2:11': 'tk', '1:11': 's', '1:10': '', '3:10': 'zz' });
  assert.deepEqual([...m.keys()].sort(), [10, 11]);
  assert.deepEqual(m.get(11), [{ siswa_id: 1, kode: 'S' }, { siswa_id: 2, kode: 'A' }]);
  assert.deepEqual(m.get(10), [{ siswa_id: 1, kode: null }]);
  assert.equal(susunMuatanSimpan({}).size, 0);
});

test('uraiTanggal: hanya tanggal kalender nyata', () => {
  assert.deepEqual(uraiTanggal('2026-10-26'), { y: 2026, m: 10, d: 26 });
  assert.deepEqual(uraiTanggal('2028-02-29'), { y: 2028, m: 2, d: 29 });
  for (const t of ['2026-02-30', '2027-02-29', '2026-13-01', '26-10-2026', '', null, undefined, '2026-1-5']) assert.equal(uraiTanggal(t), null, String(t));
});

test('tanggalPanjang dan tanggalPendek tidak bergantung pada zona peramban', () => {
  assert.equal(tanggalPanjang('2026-10-26'), 'Senin, 26 Oktober 2026');
  assert.equal(tanggalPanjang('2026-10-27'), 'Selasa, 27 Oktober 2026');
  assert.equal(tanggalPanjang('2028-02-29'), 'Selasa, 29 Februari 2028');
  assert.equal(tanggalPanjang('2027-01-01'), 'Jumat, 1 Januari 2027');
  assert.equal(tanggalPanjang('bukan'), 'bukan');
  assert.equal(tanggalPendek('2026-08-03'), '03/08');
  assert.equal(tanggalPendek('x'), 'x');
});

test('namaZona', () => {
  assert.equal(namaZona('Asia/Jakarta'), 'WIB');
  assert.equal(namaZona('Asia/Makassar'), 'WITA');
  assert.equal(namaZona('Asia/Jayapura'), 'WIT');
  assert.equal(namaZona('Pacific/Kiritimati'), 'Pacific/Kiritimati');
  assert.equal(namaZona(null), '');
});

test('periksaTanggalPertemuan: kalender nyata, tidak boleh setelah hari ini sekolah, peringatan tanggal kembar', () => {
  const hari = '2026-10-26';
  assert.deepEqual(periksaTanggalPertemuan('2026-10-26', hari, []), {});
  assert.deepEqual(periksaTanggalPertemuan('2026-08-03', hari, []), {});
  assert.match(periksaTanggalPertemuan('2026-10-27', hari, []).galat, /belum berlangsung/);
  assert.match(periksaTanggalPertemuan('2026-10-27', hari, []).galat, /Senin, 26 Oktober 2026/, 'menyebut hari ini menurut sekolah');
  assert.match(periksaTanggalPertemuan('2026-02-30', hari, []).galat, /tidak ada di kalender/);
  assert.match(periksaTanggalPertemuan('', hari, []).galat, /wajib/);
  assert.match(periksaTanggalPertemuan('2026-08-03', hari, pert).peringatan, /P1/);
  assert.deepEqual(periksaTanggalPertemuan('2026-08-03', hari, pert, 10), {}, 'mengubah pertemuan itu sendiri bukan kembar');
  // tanggal yang sama boleh di hari yang sama dengan hari ini sekolah (batas)
  assert.deepEqual(periksaTanggalPertemuan('2026-10-27', '2026-10-27', []), {});
  // hariIni tidak sah: server yang memutuskan, klien tidak menolak
  assert.deepEqual(periksaTanggalPertemuan('2026-10-27', undefined, []), {});
});

test('perbedaan zona: tanggal yang masih hari ini di WIT sudah besok di WIB ditolak sesuai hariIni dari server', () => {
  assert.deepEqual(periksaTanggalPertemuan('2026-10-27', '2026-10-27', []), {}); // sekolah WIT sudah tanggal 27
  assert.ok(periksaTanggalPertemuan('2026-10-27', '2026-10-26', []).galat); // sekolah WIB masih tanggal 26
});

test('idKronologis dan perluUrutKronologis', () => {
  const urut = [
    { id: 1, nomor: 1, tanggal: '2026-08-03' },
    { id: 2, nomor: 2, tanggal: '2026-08-03' },
    { id: 3, nomor: 3, tanggal: '2026-08-10' },
  ];
  assert.deepEqual(idKronologis(urut), [1, 2, 3]);
  assert.equal(perluUrutKronologis(urut), false);
  const acak = [
    { id: 1, nomor: 1, tanggal: '2026-08-10' },
    { id: 2, nomor: 2, tanggal: '2026-08-03' },
    { id: 3, nomor: 3, tanggal: '2026-08-03' },
  ];
  assert.deepEqual(idKronologis(acak), [2, 3, 1]);
  assert.equal(perluUrutKronologis(acak), true);
  assert.equal(perluUrutKronologis([]), false);
  // tanggal sama: nomor yang menentukan, bukan urutan masuk larik
  const kembar = [
    { id: 9, nomor: 2, tanggal: '2026-08-03' },
    { id: 8, nomor: 1, tanggal: '2026-08-03' },
  ];
  assert.deepEqual(idKronologis(kembar), [8, 9]);
  assert.equal(perluUrutKronologis(kembar), false, 'nomor sudah sesuai urutan tanggal lalu nomor');
  assert.deepEqual(idKronologis(urut), [1, 2, 3], 'tidak mengubah masukan');
  assert.deepEqual(urut.map((p) => p.id), [1, 2, 3]);
});

test('labelLm', () => {
  const lm = [{ id: 7, urutan: 2 }];
  assert.equal(labelLm(lm, 7), 'LM 2');
  assert.equal(labelLm(lm, null), null);
  assert.equal(labelLm(lm, 99), null);
  assert.equal(labelLm(undefined, 7), null);
});
