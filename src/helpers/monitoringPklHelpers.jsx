import { Typography, Tooltip, Chip, Box } from '@mui/material';
import { IconAlertTriangle, IconCheck, IconArrowRight } from '@tabler/icons-react';
import { RISK, NULL_GROUP } from 'src/components/dashboard-kepala-jurusan/pkl/PklPlacementConfig';
import { DRIFT_LABEL_STYLE } from 'src/utils/monitoringPklUtils';

const QuadrantChip = ({ code }) => {
  const cfg = RISK[code] || { color: NULL_GROUP.color, bg: NULL_GROUP.bg };
  return (
    <Chip
      size="small"
      label={code || '—'}
      sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: '0.75rem', borderRadius: '6px' }}
    />
  );
};

const DRIFT_ICON = { MEMBURUK: IconAlertTriangle, MEMBAIK: IconCheck, BERUBAH: IconArrowRight };

// Menangani 5 kasus: alumni (tidak dibandingkan), dibatalkan (cuma
// snapshot), SAMA (satu chip), drift (dua chip + panah), TIDAK_BERLAKU
// non-alumni (profil terkini belum bisa dihitung). Field `statusSiswa`/
// `status` boleh tidak ada di objek row (kasus Siswa PKL, yang secara
// struktural cuma berisi siswa aktif+penempatan aktif) — undefined!==
// 'alumni'/'dibatalkan' otomatis jatuh ke pengecekan drift biasa, jadi
// komponen ini aman dipakai untuk kedua bentuk data tanpa modifikasi.
export const KuadranCell = ({ row }) => {
  if (row.statusSiswa === 'alumni') {
    return <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>Sudah Lulus</Typography>;
  }
  if (row.status === 'dibatalkan') {
    return <QuadrantChip code={row.kuadranSaatPenempatan} />;
  }
  if (row.drift === 'SAMA') {
    return <QuadrantChip code={row.kuadranSekarang} />;
  }
  if (row.drift === 'TIDAK_BERLAKU') {
    return (
      <Tooltip title="Profil terkini belum bisa dihitung">
        <Box sx={{ display: 'inline-flex' }}>
          <QuadrantChip code={row.kuadranSaatPenempatan} />
        </Box>
      </Tooltip>
    );
  }
  const style = DRIFT_LABEL_STYLE[row.drift] || DRIFT_LABEL_STYLE.BERUBAH;
  const Icon = DRIFT_ICON[row.drift] || DRIFT_ICON.BERUBAH;
  return (
    <Tooltip title={`${style.label}: ${row.kuadranSaatPenempatan} → ${row.kuadranSekarang}`}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        <QuadrantChip code={row.kuadranSaatPenempatan} />
        <Icon size={14} color={style.color} />
        <QuadrantChip code={row.kuadranSekarang} />
      </Box>
    </Tooltip>
  );
};

export const EwsCell = ({ row }) => {
  if (!row.ewsAktif) return <Typography sx={{ fontSize: '1rem', color: 'text.disabled' }}>-</Typography>;
  return (
    <Tooltip title={row.ewsAlasan || 'EWS aktif'}>
      <Chip
        size="small"
        label="EWS"
        sx={{ backgroundColor: '#FFFBEB', color: '#B45309', fontWeight: 700, fontSize: '0.7rem', borderRadius: '6px' }}
      />
    </Tooltip>
  );
};

// [DIPERBAIKI, Opsi A] Kolom `status` di DB cuma pernah ditulis 'aktif'
// atau 'dibatalkan' — nilai ketiga 'selesai' yang didokumentasikan di
// model RiwayatPenempatanPkl tidak pernah diisi kode manapun (belum ada
// transisi otomatis saat siswa lulus). Label "Selesai" di bawah murni
// pendekatan TAMPILAN berdasarkan status siswa (alumni), BUKAN
// representasi nilai kolom `status` yang sebenarnya tersimpan — tooltip
// menjelaskan ini secara eksplisit supaya tidak menyesatkan Kajur.
export const StatusPenempatanChip = ({ row }) => {
  if (row.status === 'dibatalkan') {
    return (
      <Tooltip title={row.cancelReason ? `Alasan: ${row.cancelReason}` : ''}>
        <Chip size="small" label="Dibatalkan" sx={{ backgroundColor: '#F3F4F6', color: '#6B7280', fontWeight: 700, fontSize: '0.75rem', borderRadius: '6px' }} />
      </Tooltip>
    );
  }
  if (row.statusSiswa === 'alumni') {
    return (
      <Tooltip title="Siswa sudah lulus — status penempatan di database tetap 'aktif' (belum ada logika transisi otomatis ke 'selesai')">
        <Chip size="small" label="Selesai" sx={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.75rem', borderRadius: '6px' }} />
      </Tooltip>
    );
  }
  return <Chip size="small" label="Aktif" sx={{ backgroundColor: '#34C75914', color: '#34A853', fontWeight: 700, fontSize: '0.75rem', borderRadius: '6px' }} />;
};