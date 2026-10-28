import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import KartuBagian from './KartuBagian';
import { CETAK, gayaTautan, warnaRingkasan } from './gayaRingkasan';
import { barisKehadiran, kalimatSeringAlpa } from './ringkasan';

/**
 * Alpa per LM sebagai persentase CATATAN kehadiran (bukan pertemuan x siswa), karena pertemuan yang tidak tercatat
 * untuk seorang siswa tidak masuk penyebut. Skala batang tertulis di bawahnya dan naik bila ada LM yang melewati 10%.
 */
export default function KehadiranLm({ data, onBukaKehadiran }) {
  const w = warnaRingkasan(useTheme());
  const { skala, baris } = useMemo(() => barisKehadiran(data.kehadiran), [data.kehadiran]);
  const penutup = kalimatSeringAlpa(data.kehadiran);

  return (
    <KartuBagian
      id="kehadiran-lm"
      judul="Kehadiran per lingkup materi"
      keterangan="Batang menunjukkan alpa (A), yang menentukan pola Sering alpa. Sakit dan izin ditulis terpisah."
      sx={{ flex: { md: '1 1 420px' } }}
    >
      {baris.length === 0 ? (
        <Typography sx={{ fontSize: 14, color: w.sekunder }}>Belum ada pertemuan. Tambahkan pertemuan di tab Kehadiran.</Typography>
      ) : (
        <>
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {baris.map((b) => (
              <Box component="li" key={String(b.lm)} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, fontSize: 14, flexWrap: 'wrap' }}>
                  <span>
                    <b style={{ fontWeight: 600 }}>{b.judul}</b>
                    <Box component="span" sx={{ color: w.sekunder }}>{` · ${b.pertemuan} pertemuan`}</Box>
                  </span>
                  <b>{b.alpa === 'Belum ada catatan' ? b.alpa : `Alpa ${b.alpa}`}</b>
                </Box>
                <Box
                  role="img"
                  aria-label={`${b.judul}: alpa ${b.alpa}, ${b.sakitIzin}`}
                  sx={{ height: 14, borderRadius: '3px', bgcolor: w.garisLembut, overflow: 'hidden', ...CETAK }}
                >
                  <Box sx={{ width: `${b.lebar}%`, height: '100%', bgcolor: w.navy, borderRadius: '3px', ...CETAK }} />
                </Box>
                <Typography sx={{ fontSize: 13, color: w.sekunder }}>{b.sakitIzin}</Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ fontSize: 12, color: w.sekunder, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <span>0%</span>
            <span>{`skala sampai ${skala}% dari catatan kehadiran`}</span>
          </Box>
        </>
      )}
      <Box sx={{ borderTop: `1px solid ${w.garis}`, borderRadius: 0, pt: 1.5, fontSize: 14, color: w.ink }}>
        {`${penutup.teks} `}
        <Box component="button" type="button" onClick={onBukaKehadiran} sx={gayaTautan(w)}>Buka kehadiran</Box>
      </Box>
    </KartuBagian>
  );
}

KehadiranLm.propTypes = { data: PropTypes.object.isRequired, onBukaKehadiran: PropTypes.func.isRequired };
