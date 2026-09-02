// src/components/dashboards-kepala-jurusan/detail/BreakdownBehaviorCard.jsx
import { Box, Typography, LinearProgress, useTheme } from '@mui/material';

// [KOREKSI DARI MOCKUP] Mockup pakai "Kehadiran Harian" + "Kehadiran
// Per-Mapel" terpisah — TIDAK MUNGKIN, backend sudah menggabungkan
// keduanya jadi satu skor 'kehadiran' sebelum disimpan (lihat
// hitungSkorKehadiranBulan). Di sini ditampilkan 4 komponen yang
// SUNGGUHAN ada: Kehadiran (gabungan), Ketepatan, Perizinan, Sikap Kerja.
const KOMPONEN_LABEL = {
  kehadiran: 'Kehadiran',
  ketepatan: 'Ketepatan Tugas',
  perizinan: 'Perizinan',
  sikap_kerja: 'Sikap Kerja',
};
const KOMPONEN_ORDER = ['kehadiran', 'ketepatan', 'perizinan', 'sikap_kerja'];

const BreakdownBehaviorCard = ({ behaviorPerKomponen, ambangBehavior }) => {
  const theme = useTheme();
  const ambangNum = Number(ambangBehavior) || 0;

  const items = KOMPONEN_ORDER.map((key) => ({
    key, label: KOMPONEN_LABEL[key], skor: behaviorPerKomponen?.[key] ?? null,
  }));
  const tersedia = items.filter((i) => i.skor !== null);
  const semuaDiAtas = tersedia.length > 0 && tersedia.every((i) => i.skor >= ambangNum);

  return (
    <Box sx={{ p: 2.5, borderRadius: '10px', backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[1] }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.3 }}>
        <Typography variant="subtitle1" fontWeight={700}>Breakdown Behavior Score</Typography>
        {tersedia.length > 0 && (
          <Box sx={{ px: 1, py: 0.3, borderRadius: '6px', backgroundColor: semuaDiAtas ? '#34C75914' : '#FF7B0114' }}>
            <Typography variant="caption" sx={{ color: semuaDiAtas ? '#059669' : '#D97706', fontWeight: 700 }}>
              {semuaDiAtas ? `Semua di atas ${Math.round(ambangNum)}` : 'Ada di bawah ambang'}
            </Typography>
          </Box>
        )}
      </Box>
      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 2 }}>
        Data otomatis dari Absensi & Perizinan
      </Typography>

      {items.map((item) => {
        const belumAda = item.skor === null;
        const skorBulat = belumAda ? 0 : Math.round(item.skor);
        const diAtas = !belumAda && item.skor >= ambangNum;
        return (
          <Box key={item.key} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" fontWeight={600}>{item.label}</Typography>
              <Typography variant="body2" fontWeight={700} sx={{ color: belumAda ? 'text.disabled' : (diAtas ? '#059669' : '#DC2626') }}>
                {belumAda ? 'Tidak tersedia' : skorBulat}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={skorBulat}
              sx={{
                height: 6, borderRadius: 4,
                backgroundColor: theme.palette.mode === 'dark' ? 'action.hover' : '#F1F1F4',
                opacity: belumAda ? 0.3 : 1,
                '& .MuiLinearProgress-bar': { borderRadius: 4, backgroundColor: diAtas ? '#34A853' : '#DC2626' },
              }}
            />
          </Box>
        );
      })}

      <Box sx={{ p: 1.2, borderRadius: '8px', backgroundColor: theme.palette.mode === 'dark' ? 'action.hover' : '#F5F3FF', border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : '#E0D9FA'}` }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Skor Behavior merupakan rata-rata tertimbang dengan bobot lebih tinggi pada 6 bulan terakhir.
        </Typography>
      </Box>
    </Box>
  );
};

export default BreakdownBehaviorCard;