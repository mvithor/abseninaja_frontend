// Memilih bagian halaman yang sedang aktif untuk navigasi jangkar (scrollspy).
// Logika murni; IntersectionObserver ada di pages/analitik/useBagianAktif.js.
//
//  skor              : { idBagian: angka }. > 0 berarti bagian itu sedang
//                      memotong garis baca (tinggi irisan dalam piksel); 0 atau
//                      tidak ada berarti tidak.
//  urutan            : id bagian sesuai urutan di halaman.
//  sebelumnya        : bagian aktif sebelumnya (id atau null).
//  diAtasBagianPertama: true bila garis baca masih di atas bagian pertama.
//
// Aturan: skor tertinggi menang; bila seri, bagian yang lebih bawah menang
// (bagian yang baru masuk saat gulir turun). Bila tidak ada yang memotong garis
// baca: di atas bagian pertama berarti tidak ada yang aktif (null), selain itu
// bagian sebelumnya tetap aktif (garis berada di bagian tanpa tautan).
export function pilihBagianAktif({ skor, urutan, sebelumnya = null, diAtasBagianPertama = false }) {
  let terbaik = null;
  let nilai = 0;
  urutan.forEach((id) => {
    const s = skor[id] ?? 0;
    if (s > 0 && s >= nilai) {
      terbaik = id;
      nilai = s;
    }
  });
  if (terbaik) return terbaik;
  return diAtasBagianPertama ? null : sebelumnya;
}
