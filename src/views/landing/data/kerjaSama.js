// Teks dan daftar halaman Kerja Sama (`/kerja-sama`). Disalin apa adanya dari
// desain kanvas (Kerja-Sama.dc.html dan Kerja-Sama-Seluler.dc.html). Teks dua
// versi berbentuk { web, mobile }. Tanda bintang pada judul (*kata*) = kata
// berwarna aksen. Kolom formulir ada di data/formulir.js (SKEMA.kerjaSama).
//
// `verifikasi` (true atau teks label) = klaim yang belum diverifikasi. Penandanya
// tampil hanya bila flags.tampilkanPenandaDesain menyala.
//
// Halaman digerbang oleh PERUSAHAAN_DIRILIS (lib/gerbang.js) dan tidak boleh
// tampil di produksi sebelum isinya ditinjau.
//
// DUMMY wajib diganti sebelum main:
//  - "Dibalas lewat WhatsApp" (hero) dan "Data dipakai hanya untuk membalas"
//    (jaminan formulir): janji balasan dan penggunaan data, butuh tinjauan hukum
//    UU PDP sebelum rilis
//  - tiga bentuk kerja sama (penawaran yang belum dikonfirmasi)
//  - CTA: tombol kedua "Ajukan Kerja Sama" bukan dari desain (desain memuat dua
//    tombol "Jadwalkan Demo"); perlu keputusan dan tinjauan copywriter.
import { IconBriefcase, IconLock, IconMail, IconSchool, IconUsers } from '@tabler/icons-react';

// Teks meta tidak ada di desain: judul memakai pola halaman lain, deskripsi =
// subjudul hero desain.
export const META = {
  title: 'Kerja Sama | Absenin Aja',
  description: 'Pilih bentuk kerja sama yang paling sesuai dengan kebutuhan Anda.',
};

export const HERO = {
  eyebrow: 'Perusahaan · Kerja Sama',
  judul: 'Bekerja sama *untuk sekolah.*',
  sub: {
    web: 'Pilih bentuk kerja sama yang paling sesuai dengan kebutuhan Anda.',
    mobile: 'Pilih bentuk kerja sama yang sesuai.',
  },
  fakta: [
    { ikon: IconUsers, label: 'Sekolah dan yayasan' },
    { ikon: IconSchool, label: 'Komunitas guru' },
    { ikon: IconBriefcase, label: 'Mitra industri' },
    { ikon: IconMail, label: 'Dibalas lewat WhatsApp', verifikasi: 'Verifikasi janji balasan lewat WhatsApp' }, // DUMMY wajib diganti sebelum main
  ],
};

export const BENTUK = {
  id: 'judul-bentuk',
  eyebrow: 'Tiga bentuk',
  judul: 'Pilih yang *paling dekat*',
  butir: [
    {
      ikon: IconUsers,
      judul: 'Sekolah dan yayasan',
      deskripsi: 'Penerapan di beberapa sekolah sekaligus.',
      tag: ['Beberapa sekolah'],
    },
    {
      ikon: IconSchool,
      judul: 'Komunitas guru',
      deskripsi: {
        web: 'Pelatihan dan penggunaan analitik pembelajaran bersama.',
        mobile: 'Pelatihan dan analitik pembelajaran.',
      },
      tag: ['Pelatihan'],
    },
    {
      ikon: IconBriefcase,
      judul: 'Mitra industri',
      deskripsi: 'Untuk SMK, lewat Prakersa.',
      tag: ['PKL'],
    },
  ],
};

export const FORMULIR = {
  id: 'ajukan-kerja-sama',
  eyebrow: 'Ajukan kerja sama',
  judul: 'Ceritakan *rencana Anda.*',
  sub: {
    web: 'Tim kami membalas lewat WhatsApp atau email.',
    mobile: 'Dibalas lewat WhatsApp atau email.',
  },
  formulir: {
    judul: 'Formulir kerja sama',
    teksKirim: 'Kirim Pengajuan',
    // Teks pada tautan WhatsApp keadaan "Formulir belum aktif". Tidak ada di desain.
    pesanWa: 'Halo Absenin Aja, saya ingin mengajukan kerja sama.',
    // Teks keadaan terkirim tidak ada di desain: memakai kalimat proses dari desain
    // (sama dengan sub bagian ini), seperti Akun Guru Mandiri.
    terkirim: {
      sub: {
        web: 'Tim kami membalas lewat WhatsApp atau email.',
        mobile: 'Dibalas lewat WhatsApp atau email.',
      },
    },
    // DUMMY wajib diganti sebelum main: kalimat privasi desain; butuh tinjauan hukum UU PDP.
    jaminan: [{ ikon: IconLock, label: 'Data dipakai hanya untuk membalas', verifikasi: 'Verifikasi kalimat privasi (UU PDP)' }],
  },
};

// SIMPANGAN DARI DESAIN: desain memuat dua tombol berlabel "Jadwalkan Demo" (web dan
// seluler). Tombol kedua diganti "Ajukan Kerja Sama" (teks baru, bukan dari desain;
// perlu ditinjau copywriter) dengan jangkar ke bagian formulir halaman ini.
export const CTA = {
  judul: 'Punya ide kerja sama lain?',
  sub: 'Kami terbuka. Kirim saja pengajuannya.',
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Ajukan Kerja Sama', href: `#${FORMULIR.id}` },
};
