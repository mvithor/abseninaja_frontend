// Tes peta nilai ke koordinat grafik tren (lib/tren.js).
// Jalankan: node --test src/views/landing/lib/
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SUMBU_TREN, yDariNilai } from './tren.js';

describe('yDariNilai', () => {
  it('nilai batas sumbu jatuh di tepi atas dan bawah', () => {
    assert.equal(yDariNilai(SUMBU_TREN.max), SUMBU_TREN.yAtas);
    assert.equal(yDariNilai(SUMBU_TREN.min), SUMBU_TREN.yBawah);
  });

  it('nilai 75 tepat di garis bantu tengah (y 75)', () => {
    assert.equal(yDariNilai(75), 75);
  });

  it('linear: selisih nilai yang sama memberi selisih y yang sama', () => {
    assert.equal(yDariNilai(70) - yDariNilai(80), yDariNilai(80) - yDariNilai(90));
  });

  it('nilai lebih tinggi berarti y lebih kecil (naik di layar)', () => {
    assert.ok(yDariNilai(84) < yDariNilai(73.3));
    assert.ok(yDariNilai(73.3) < yDariNilai(68));
  });

  it('nilai di luar sumbu dijepit', () => {
    assert.equal(yDariNilai(120), SUMBU_TREN.yAtas);
    assert.equal(yDariNilai(10), SUMBU_TREN.yBawah);
  });

  it('dibulatkan satu desimal', () => {
    assert.equal(yDariNilai(73.3), 80.1);
  });
});
