// GERBANG RILIS: GANTI dengan kontak resmi Absenin Aja sebelum tayang.
// Nilai di bawah ini dummy, dipindahkan dari Landing.jsx (yang tetap memegang salinannya).
// Setelah nilainya diganti, ubah KONTAK_RESMI menjadi true. Selama false:
//  - produksi: footer TIDAK menampilkan baris WhatsApp dan email sama sekali;
//  - DEV (import.meta.env.DEV): baris tampil sebagai teks biasa supaya tata
//    letak bisa diperiksa;
//  - waLink() dan mailLink tidak menghasilkan tautan, jadi tidak ada wa.me atau
//    mailto yang mengarah ke nomor dummy.
export const KONTAK_RESMI = false;

// Baris kontak ikut dirender hanya bila kontaknya resmi, atau saat DEV (sebagai teks).
export const KONTAK_TAMPIL = KONTAK_RESMI || import.meta.env.DEV;

export const CONTACT = {
  whatsappNumber: '6281234567890', // format internasional tanpa tanda +
  whatsappDisplay: '0812-3456-7890',
  email: 'halo@abseninaja.com',
};

// Alamat kantor (halaman Tentang Kami). Sama seperti WhatsApp dan email: DUMMY, dan
// hanya tampil bila KONTAK_TAMPIL (kontak resmi, atau DEV). Ganti dengan alamat
// resmi bersama kontak di atas.
// DUMMY wajib diganti sebelum main
export const ALAMAT = 'Jl. Contoh No. 10, Bandar Lampung';

export const WA_PESAN_AWAL = 'Halo Absenin Aja, saya ingin tahu lebih lanjut tentang platform sekolah Anda.';

export const waLink = (pesan = WA_PESAN_AWAL) =>
  KONTAK_RESMI ? `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(pesan)}` : undefined;

export const mailLink = KONTAK_RESMI ? `mailto:${CONTACT.email}` : undefined;
