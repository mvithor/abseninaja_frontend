---
name: anti-slop-id
description: Menyunting atau memeriksa teks pemasaran berbahasa Indonesia agar tidak terbaca generik, bertele-tele, atau seperti dihasilkan mesin, sambil menandai klaim yang belum terbukti. Gunakan untuk copy landing page, judul, CTA, FAQ, caption, dan pesan. Pemicu: "anti slop", "rapikan copy", "hilangkan gaya AI", "cek klaim", "apakah ini terdengar generik", "sunting tulisan ini". Dua mode: Sunting (default) dan Deteksi.
---

# Anti-slop untuk teks Indonesia

Tujuan: teks yang spesifik, jujur, dan terdengar seperti ditulis orang yang paham sekolah. Skill ini menyunting seminimal mungkin, menjaga suara penulis, dan tidak menambah fakta.

Pola dan daftar di bawah disusun untuk bahasa Indonesia, terinspirasi dari pola umum tulisan generik. Ini bukan terjemahan skill bahasa Inggris mana pun. Daftar kata hanya penanda untuk dicurigai, bukan larangan mutlak: kata yang membawa makna konkret boleh tetap.

## Aturan tetap untuk proyek Absenin Aja

1. Jangan memakai karakter emdash. Pakai koma, titik, titik dua, atau tanda kurung.
2. Teks tampil memakai istilah **murid**, bukan siswa. Nama variabel, kunci API, dan URL tidak berubah.
3. Tanpa kata **Anda**. Pakai kalimat tanpa kata ganti, atau **Bapak/Ibu** bila subjek perlu disebut.
4. Jangan mengarang angka, testimoni, nama sekolah, logo mitra, penghargaan, atau kutipan. Bila datanya belum ada, tulis `[VERIFIKASI]` dan sebutkan apa yang perlu dicek.
5. Jangan menyalin teks situs lain. Boleh meniru struktur dan urutan, kalimatnya harus baru.

## Mode

**Sunting (default).** Pengguna menempel draf. Keluarkan draf yang sudah disunting, lalu bagian **Yang diubah** berisi daftar singkat (pola yang dibuang dan klaim yang ditandai).

**Deteksi.** Pengguna meminta audit tanpa penulisan ulang. Sebut tiap pola yang muncul, kutip barisnya, beri perbaikan dalam beberapa kata. Jangan menulis ulang, jangan memberi skor, dan jangan menebak apakah teks ditulis mesin. Tawarkan menyunting setelahnya.

## Alur Sunting

1. Baca seluruh draf. Jika tidak ada draf, minta ditempelkan.
2. Tentukan poin inti dan ciri suara yang dijaga (kosakata, ritme, humor, tingkat formalitas). Jika poin inti tidak jelas, tanyakan satu hal: untuk siapa dan di bagian halaman mana teks ini dipakai.
3. Buang pola di bawah. Ganti dengan fakta konkret bila ada di draf. Bila fakta tidak ada, hapus kalimatnya atau tandai `[VERIFIKASI]`. Jangan menambah fakta baru.
4. Periksa dengan daftar cek di akhir. Perbaiki yang gagal.
5. Keluarkan draf lengkap, lalu **Yang diubah**.

## Pola yang dipangkas

1. **Kontras biner.** "Bukan sekadar X, melainkan Y." Tulis Y langsung.
2. **Pembuka basa-basi.** "Di era digital ini," "Tidak dapat dipungkiri bahwa," "Perlu diketahui bahwa." Mulai dari poinnya.
3. **Pengantar yang memuji diri.** "Banyak sekolah keliru soal ini." Hapus pengantar, biarkan klaim berdiri dengan buktinya.
4. **Titik dua dramatis.** "Hasilnya: efisiensi." Jadikan kalimat biasa. Titik dua hanya untuk daftar, label, dan kutipan.
5. **Klausa penutup yang berlagak analisis.** "...sehingga menciptakan ekosistem yang berdampak." Ganti dengan akibat konkret, atau hapus.
6. **Pujian kepentingan kosong.** "Langkah penting menuju transformasi pendidikan." Ganti dengan fakta.
7. **Sumber samar.** "Banyak ahli sepakat," "Berbagai studi menunjukkan." Sebut sumbernya atau hapus klaimnya.
8. **Kata kerja yang membesar-besarkan.** "Berperan sebagai jembatan," "memegang peranan kunci." Pakai "adalah", "punya", atau kata kerja langsung.
9. **Ganti-ganti istilah** untuk hal yang sama (platform, sistem, aplikasi, solusi). Pilih satu istilah dan ulangi.
10. **Daftar negatif.** "Bukan kertas. Bukan rekap manual. Tapi satu sistem." Tulis hasil akhirnya saja.
11. **Fragmen dramatis berderet.** "Cepat. Rapi. Akurat." Pakai kalimat lengkap.
12. **Tiga serangkai refleks.** "Lebih rapi, cepat, dan berbasis data." Pertahankan hanya butir yang benar dan bisa dibuktikan.
13. **Irama seragam.** Panjang kalimat dan susunan paragraf yang berulang. Variasikan sesuai isi.
14. **Pembuka retoris.** "Bagaimana jika sekolah bisa...?" Sampaikan poinnya.
15. **Kalimat penutup yang terdengar dalam.** Aforisme di akhir paragraf. Hapus dan akhiri dengan kalimat konkret yang sudah ada. Jangan diganti metafora lain.
16. **Ringkasan yang mengulang.** "Singkatnya," "Dengan demikian." Akhiri pada poin konkret atau langkah berikutnya.
17. **Format berlebihan.** Emoji di judul, huruf tebal di tengah kalimat, butir yang lebih baik berupa kalimat, judul di atas bagian yang hanya dua kalimat.

## Kata dan frasa yang dicurigai

Periksa apakah ada isi konkret di baliknya. Jika tidak, buang atau ganti.

- Kata besar: solusi, inovatif, revolusioner, terdepan, unggul, terpadu, holistik, komprehensif, optimal, memberdayakan, transformasi, ekosistem, seamless, next-level.
- Kata kerja pengisi: mengoptimalkan, memfasilitasi, memanfaatkan, mengakselerasi, menghadirkan, mewujudkan.
- Penguat kosong: sangat, sekali, benar-benar, tentunya, pada dasarnya, sejatinya.
- Frasa pengisi: "dalam rangka," "di era digital," "tidak dapat dipungkiri," "perlu diketahui," "ke depannya," "berbasis data" (tanpa menyebut datanya).
- Janji tanpa bukti: "terbaik," "tercepat," "satu-satunya," "100% aman," "tanpa kendala," "dijamin."

## Klaim yang harus ditandai

Tandai `[VERIFIKASI]` di teks dan catat di **Yang diubah** untuk:

1. Angka (jumlah sekolah, pengguna, persen, jam, rupiah, tahun mulai).
2. Klaim legal atau keamanan (PSE, enkripsi, lokasi server, sertifikasi).
3. Klaim layanan (pendampingan, tanpa biaya tambahan, waktu respons, lama implementasi).
4. Nama sekolah, logo, testimoni, atau penghargaan.
5. Superlatif dan perbandingan dengan pihak lain.

## Daftar cek sebelum menyerahkan

1. Poin penulis dipertahankan, tanpa klaim, contoh, atau angka baru.
2. Suara dan kosakata penulis tetap terdengar.
3. Kalimat yang sudah kuat tidak diubah demi keseragaman.
4. Pemotongan sebanding dengan slop, tanpa pemadatan berlebihan.
5. Setiap kalimat punya satu tugas dan bisa dibuktikan atau dibayangkan.
6. Kalimat umum yang bisa dipasang di situs sekolah mana pun sudah dibuat spesifik atau dibuang.
7. Kalimat aktif dengan subjek yang jelas dipakai bila mungkin.
8. Tidak ada emdash, tidak ada kata "Anda", istilah murid dipakai.
9. Semua klaim yang butuh bukti sudah ditandai.
10. Hasil enak dibacakan keras-keras kepada rekan.

## Batas skill ini

1. Tidak menilai apakah tulisan berasal dari mesin. Pendeteksi semacam itu menebak.
2. Tidak menggantikan tinjauan manusia atas klaim legal dan angka.
3. Untuk struktur halaman dan pilihan judul, pakai skill `copywriting`. Skill ini dipakai sesudahnya sebagai tahap penyuntingan.
