import { useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Box, Button, CircularProgress, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { pesanGalat } from '../api';
import KartuAngka from './KartuAngka';
import SebaranTp from './SebaranTp';
import TrenNr from './TrenNr';
import KehadiranLm from './KehadiranLm';
import PerhatianTeratas from './PerhatianTeratas';
import ProyekStatus from './ProyekStatus';
import PerluDilengkapi from './PerluDilengkapi';
import { warnaRingkasan } from './gayaRingkasan';

const gulirKe = (el) => {
  if (!el) return;
  const kurang = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: kurang ? 'auto' : 'smooth', block: 'center' });
  el.focus({ preventScroll: true });
};

/**
 * Tab Ringkasan (FR-10, L-2): landing kelas. Semua angka dari satu respons server (`ringkasan`) yang memakai
 * evaluasi yang sama dengan tab Perlu Perhatian, jadi angka di sini dan di daftar tidak mungkin berbeda.
 * Panel ini tidak menghitung penanda; ia menyusun, dan setiap angka membuka tab atau profil sumbernya.
 *
 * `onPindah(tab, opsi)` membuka tab lain; `opsi.sorot` ({lm, tp}) menyorot kolom TP di tab Nilai.
 */
export default function RingkasanPanel({
  ringkasan, siswa, lm, nilaiTp, onPindah, onBukaProfil,
}) {
  const w = warnaRingkasan(useTheme());
  const lengkapiRef = useRef(null);
  const {
    data, isLoading, error, refetch, isFetching,
  } = ringkasan;

  if (isLoading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }} role="status" aria-label="Memuat ringkasan kelas">
        <CircularProgress size={28} />
      </Box>
    );
  }
  if (error) {
    return (
      <Alert severity="error" action={<Button color="inherit" onClick={() => refetch()} disabled={isFetching}>Coba lagi</Button>}>
        {pesanGalat(error, 'Ringkasan kelas belum dapat dimuat.')}
      </Alert>
    );
  }
  if (!data) return null;

  const { kartu } = data;
  const bukaNilai = (sorot) => onPindah('nilai', { sorot: sorot ?? null });

  if (data.struktur_kosong) {
    return (
      <Alert severity="info" action={<Button color="inherit" onClick={() => onPindah('struktur')}>Isi struktur</Button>}>
        Kelas ini belum memiliki lingkup materi dan TP, jadi belum ada yang dapat diringkas.
      </Alert>
    );
  }
  if (kartu.jumlah_siswa === 0 && data.galat.length === 0) {
    return (
      <Alert severity="info" action={<Button color="inherit" onClick={() => onPindah('siswa')}>Isi siswa</Button>}>
        Kelas ini belum memiliki siswa, jadi belum ada yang dapat diringkas.
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 } }}>
      {data.galat.length > 0 && (
        <Alert severity="warning">
          {`${data.galat.length} siswa tidak dapat dievaluasi karena datanya bermasalah. Mereka tidak berarti aman: `}
          {data.galat.slice(0, 5).map((g) => g.nama ?? `ID ${g.siswa_id}`).join(', ')}
          {data.galat.length > 5 ? ', dan lainnya.' : '.'}
        </Alert>
      )}

      <KartuAngka
        data={data}
        onBukaPerhatian={() => onPindah('perhatian')}
        onBukaLengkapi={() => gulirKe(lengkapiRef.current)}
      />

      <SebaranTp data={data} siswa={siswa} lm={lm} nilaiTp={nilaiTp} onBukaNilai={bukaNilai} />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 2.5 }, alignItems: 'stretch' }}>
        <TrenNr data={data} />
        <KehadiranLm data={data} onBukaKehadiran={() => onPindah('kehadiran')} />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 2.5 }, alignItems: 'flex-start' }}>
        <PerhatianTeratas data={data} onBukaProfil={onBukaProfil} onBukaSemua={() => onPindah('perhatian')} />
        <Box sx={{ flex: '1 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 } }}>
          <ProyekStatus data={data} onBukaProyek={() => onPindah('proyek')} />
          <PerluDilengkapi
            ref={lengkapiRef}
            data={data}
            onBuka={(b) => onPindah(b.tab, { sorot: b.sorot })}
          />
        </Box>
      </Box>

      <Typography sx={{ fontSize: 13, color: w.sekunder, borderTop: `1px solid ${w.garis}`, borderRadius: 0, pt: 1.75, lineHeight: '20px' }}>
        {`Dihitung dengan aturan versi ${data.aturan_versi} memakai batas nilai yang Anda tetapkan di tab Struktur. Satu siswa dihitung sekali pada kartu Perlu perhatian, menurut pola utamanya. Gambar hanya penegas: semua angka tertulis dan bisa dicetak hitam-putih.`}
      </Typography>
    </Box>
  );
}

RingkasanPanel.propTypes = {
  ringkasan: PropTypes.shape({
    data: PropTypes.object,
    isLoading: PropTypes.bool,
    error: PropTypes.any,
    refetch: PropTypes.func,
    isFetching: PropTypes.bool,
  }).isRequired,
  siswa: PropTypes.array.isRequired,
  lm: PropTypes.array.isRequired,
  nilaiTp: PropTypes.array.isRequired,
  onPindah: PropTypes.func.isRequired,
  onBukaProfil: PropTypes.func.isRequired,
};
