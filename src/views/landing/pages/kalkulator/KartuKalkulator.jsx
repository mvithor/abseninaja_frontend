import { Suspense, lazy, useEffect, useReducer, useRef } from 'react';
import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import Tag from '../../components/Tag';
import LayarIntro from './LayarIntro';
import LayarSoal from './LayarSoal';
import LayarHasil from './LayarHasil';
import { AMBANG, HASIL, JAMINAN, JUMLAH_SOAL, OPSI, SOAL, TINGKAT } from '../../data/kalkulator';
import { hitungSkor, keadaanAwal, langkahHasil, reduksi, tingkat } from '../../lib/kalkulator.js';
import { colors, flags, gradients, radius, shadows } from '../../theme/tokens';
import { hanyaPembaca, resetDaftar } from '../../theme/sx';

// PRIVASI: jawaban TIDAK dikirim ke mana pun dan TIDAK disimpan. Semuanya hidup di
// memori komponen ini (useReducer) dan hilang saat halaman ditutup atau dimuat
// ulang. Tidak ada localStorage, sessionStorage, cookie, query string, permintaan
// jaringan, atau analitik di berkas ini maupun di lib/kalkulator.js. Karena itu
// klaim "Gratis", "Tanpa daftar", dan "Hasil langsung" di bawah kartu benar bagi
// implementasi ini. Jangan menambah pengiriman atau penyimpanan jawaban tanpa
// memperbarui klaim itu dan kebijakan privasi.
//
// Aksesibilitas: setiap pergantian keadaan (bukan saat halaman pertama dimuat)
// memindahkan fokus ke judul soal, judul hasil, atau paragraf pengantar, dan
// mengumumkan satu kalimat pendek lewat region aria-live sopan (nomor soal, atau
// skor dan tingkat). Gerak transisi dimatikan oleh aturan prefers-reduced-motion
// di LandingLayout.
//
// Pemilih "Lihat keadaan" dari desain hanya DEV: import dinamis di bawah
// import.meta.env.DEV (dibuang dari bundel produksi), tampil hanya bila
// flags.pratinjauTombolAktif.
const PemilihPratinjau = import.meta.env.DEV ? lazy(() => import('./PemilihPratinjau')) : null;

const BUAT_REDUKSI = (keadaan, aksi) => reduksi(keadaan, aksi, JUMLAH_SOAL);

function idKeadaan(langkah) {
  if (langkah === 0) return 'awal';
  return langkah === langkahHasil(JUMLAH_SOAL) ? 'hasil' : 'soal';
}

export default function KartuKalkulator() {
  const [keadaan, kirim] = useReducer(BUAT_REDUKSI, JUMLAH_SOAL, keadaanAwal);
  const { langkah, jawaban, bergerak } = keadaan;
  const fokusRef = useRef(null);
  const langkahLalu = useRef(langkah);

  // Fokus mengikuti pergantian langkah. Tidak jalan saat pemuatan pertama.
  useEffect(() => {
    if (langkahLalu.current === langkah) return;
    langkahLalu.current = langkah;
    fokusRef.current?.focus();
  }, [langkah]);

  const id = idKeadaan(langkah);
  const skor = hitungSkor(jawaban, JUMLAH_SOAL);
  const idTingkat = tingkat(skor.persen, AMBANG);
  const dataTingkat = TINGKAT[idTingkat];

  let pengumuman = '';
  if (bergerak && id === 'soal') pengumuman = `Pertanyaan ${langkah} dari ${JUMLAH_SOAL}`;
  if (bergerak && id === 'hasil') pengumuman = HASIL.pengumuman(skor.persen);

  return (
    <Seksi
      varian="terang"
      padAtas={{ xs: '24px', md: '48px' }}
      padBawah={{ xs: '44px', md: '88px' }}
      sx={{ background: gradients.hero }}
    >
      <Box
        sx={{
          boxSizing: 'border-box',
          maxWidth: 720,
          mx: 'auto',
          p: { xs: '24px', md: '36px' },
          borderRadius: radius.kartuXL,
          background: colors.white,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.formulir,
        }}
      >
        {id === 'awal' && <LayarIntro onMulai={() => kirim({ type: 'mulai' })} fokusRef={fokusRef} />}
        {id === 'soal' && (
          <LayarSoal
            key={langkah}
            nomor={langkah}
            total={JUMLAH_SOAL}
            soal={SOAL[langkah - 1]}
            opsi={OPSI}
            terpilih={jawaban[langkah - 1] ?? undefined}
            onPilih={(nilai) => kirim({ type: 'jawab', nilai })}
            onKembali={() => kirim({ type: 'kembali' })}
            fokusRef={fokusRef}
          />
        )}
        {id === 'hasil' && (
          <LayarHasil
            persen={skor.persen}
            namaTingkat={dataTingkat.label}
            saran={dataTingkat.saran}
            onUlangi={() => kirim({ type: 'ulangi' })}
            fokusRef={fokusRef}
          />
        )}
        <Box role="status" aria-live="polite" sx={hanyaPembaca}>
          {pengumuman}
        </Box>
        {PemilihPratinjau && flags.pratinjauTombolAktif && (
          <Suspense fallback={null}>
            <PemilihPratinjau
              aktif={id}
              onPilih={(k) => kirim({ type: 'muat', langkah: k.langkah, jawaban: k.jawaban })}
            />
          </Suspense>
        )}
      </Box>
      <Box
        component="ul"
        role="list"
        sx={{ ...resetDaftar, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', mt: '28px' }}
      >
        {JAMINAN.map((j) => (
          <li key={j}>
            <Tag sx={{ height: 32, fontSize: '13px' }}>{j}</Tag>
          </li>
        ))}
      </Box>
    </Seksi>
  );
}
