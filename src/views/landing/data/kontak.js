// GANTI dengan kontak resmi Absenin Aja sebelum tayang.
// Nilai di bawah ini dummy, dipindahkan dari Landing.jsx (yang tetap memegang salinannya).
// Setelah nilainya diganti, ubah KONTAK_RESMI menjadi true. Selama false, footer
// menampilkan kontak sebagai teks biasa dan waLink() serta mailLink tidak
// menghasilkan tautan, sehingga tidak ada tombol yang mengarah ke nomor dummy.
export const KONTAK_RESMI = false;

export const CONTACT = {
  whatsappNumber: '6281234567890', // format internasional tanpa tanda +
  whatsappDisplay: '0812-3456-7890',
  email: 'halo@abseninaja.com',
};

export const WA_PESAN_AWAL = 'Halo Absenin Aja, saya ingin tahu lebih lanjut tentang platform sekolah Anda.';

export const waLink = (pesan = WA_PESAN_AWAL) =>
  KONTAK_RESMI ? `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(pesan)}` : undefined;

export const mailLink = KONTAK_RESMI ? `mailto:${CONTACT.email}` : undefined;
