// Peta nilai ke koordinat y pada grafik tren peraga LAD (mock/lad/TrenNilaiMock).
// Satu sumbu linear untuk semua garis dan titik (murid, rata-rata kelas, KKTP),
// supaya tinggi titik sebanding dengan angkanya. Ruang SVG 360 x 150; garis
// bantu di y 30, 75, dan 120 (nilai 90, 75, dan 60).
export const SUMBU_TREN = { min: 60, max: 90, yAtas: 30, yBawah: 120 };

// Nilai di luar sumbu dijepit ke tepi. Hasil dibulatkan satu desimal.
export function yDariNilai(nilai, sumbu = SUMBU_TREN) {
  const { min, max, yAtas, yBawah } = sumbu;
  const dijepit = Math.min(max, Math.max(min, nilai));
  const t = (dijepit - min) / (max - min);
  return Math.round((yBawah - t * (yBawah - yAtas)) * 10) / 10;
}
