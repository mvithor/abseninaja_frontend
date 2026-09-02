import { Box, Typography, useTheme, Chip, Stack, Divider } from '@mui/material';
import {
  IconCheck, IconX, IconClock, IconTrendingDown, IconAlertTriangle, IconBuilding,
} from '@tabler/icons-react';

const StatusBox = ({ ok, label, keterangan }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '8px', backgroundColor: ok ? '#34C75914' : '#FF383C14', mb: 1.2 }}>
    <Box sx={{ width: 30, height: 30, borderRadius: '8px', backgroundColor: ok ? '#34A853' : '#FF383C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {ok ? <IconCheck size={18} color="#fff" /> : <IconX size={18} color="#fff" />}
    </Box>
    <Box>
      <Typography variant="body2" fontWeight={700}>{label}</Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{keterangan}</Typography>
    </Box>
  </Box>
);

// Mapping status hitungEstimasiSiapPkl -> warna & ikon. SUDAH_SIAP dan
// ESTIMASI_TERHITUNG dianggap sinyal positif (hijau/biru), ESTIMASI_KASAR
// netral-kuning, PERLU_INTERVENSI & TREN_MENURUN negatif-merah,
// DATA_KURANG netral-abu.
const ESTIMASI_STYLE = {
  SUDAH_SIAP: { warna: '#34A853', Icon: IconCheck },
  ESTIMASI_TERHITUNG: { warna: '#0A84FF', Icon: IconClock },
  ESTIMASI_KASAR: { warna: '#FF9F0A', Icon: IconClock },
  PERLU_INTERVENSI: { warna: '#FF383C', Icon: IconAlertTriangle },
  TREN_MENURUN: { warna: '#FF383C', Icon: IconTrendingDown },
  DATA_KURANG: { warna: '#8E8E93', Icon: IconClock },
};

const DIMENSI_LABEL = { behavior: 'Behavior', competency: 'Kompetensi' };

// [DIREVISI] estimasiSlotPkl adalah objek DUA DIMENSI
// { behavior: { status, pesan }, competency: { status, pesan } } — bukan
// satu alasan tunggal seperti stub lama. Siswa bisa siap di satu sisi
// tapi belum di sisi lain, jadi tiap dimensi diproyeksikan terpisah.
const EstimasiSiapPklBox = ({ estimasiSlotPkl }) => {
  const dims = ['behavior', 'competency'].filter((d) => estimasiSlotPkl?.[d]);

  if (dims.length === 0) {
    return (
      <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: 'action.hover', border: (t) => `1px dashed ${t.palette.divider}`, mb: 1.2 }}>
        <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', display: 'block', mb: 0.3 }}>Estimasi Siap PKL</Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>Belum tersedia.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: 'action.hover', mb: 1.2 }}>
      <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>Estimasi Siap PKL</Typography>
      <Stack spacing={1}>
        {dims.map((d) => {
          const item = estimasiSlotPkl[d];
          const style = ESTIMASI_STYLE[item.status] || ESTIMASI_STYLE.DATA_KURANG;
          const { Icon } = style;
          return (
            <Box key={d} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ width: 22, height: 22, borderRadius: '6px', backgroundColor: style.warna, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.2 }}>
                <Icon size={14} color="#fff" />
              </Box>
              <Box>
                <Typography variant="caption" fontWeight={700} sx={{ display: 'block' }}>{DIMENSI_LABEL[d]}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.pesan}</Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

// industriDirekomendasikan:
//   { tersedia: false, alasan } ATAU
//   { tersedia: true, pratinjau: true, catatan, kandidat: [{ mitra_id,
//     nama_industri, match_score_final, tingkat_keyakinan,
//     konteks_riwayat: { total, berhasil } | null }] }
const IndustriRekomendasiBox = ({ industriDirekomendasikan }) => {
  if (!industriDirekomendasikan?.tersedia || !industriDirekomendasikan.kandidat?.length) {
    return (
      <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: 'action.hover', border: (t) => `1px dashed ${t.palette.divider}` }}>
        <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', display: 'block', mb: 0.3 }}>Industri yang Direkomendasikan</Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {industriDirekomendasikan?.alasan || 'Belum ada mitra yang cocok untuk profil ini saat ini.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: 'action.hover' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1 }}>
        <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary' }}>Industri yang Direkomendasikan</Typography>
        {industriDirekomendasikan.pratinjau && (
          <Chip
            label="Pratinjau — bukan keputusan resmi"
            size="small"
            sx={{ height: 18, fontSize: '0.65rem', backgroundColor: '#FF9F0A22', color: '#B25E00', fontWeight: 700 }}
          />
        )}
      </Box>

      <Stack spacing={1}>
        {industriDirekomendasikan.kandidat.map((k) => (
          <Box key={k.mitra_id} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 1, borderRadius: '6px', backgroundColor: (t) => t.palette.background.paper }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '6px', backgroundColor: '#5E5CE6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconBuilding size={16} color="#fff" />
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} noWrap>{k.nama_industri}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Skor kecocokan {Math.round(k.match_score_final)} · {k.tingkat_keyakinan}
                {k.konteks_riwayat ? ` · Riwayat ${k.konteks_riwayat.berhasil} dari ${k.konteks_riwayat.total} berhasil` : ''}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      {industriDirekomendasikan.catatan && (
        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 1 }}>
          {industriDirekomendasikan.catatan}
        </Typography>
      )}
    </Box>
  );
};

// [FIX] Keterangan kompetensi sekarang bandingkan angka asli dulu
// (skorMemenuhiAmbang), baru tentukan kalimat mana yang dipakai —
// sebelumnya `overridden` langsung dianggap berarti "skor sudah cukup",
// padahal overridden dan skor-di-bawah-ambang bisa terjadi BERSAMAAN
// (skor memang rendah, DAN ada unit Kritis) — persis bug yang sama
// dengan DimensiScoreCard, ditemukan lewat skenario skor 64 < ambang 70.
const buildKeteranganKompetensi = (competency) => {
  const skor = Number(competency.skor);
  const ambang = Number(competency.ambang);
  const skorMemenuhiAmbang = !Number.isNaN(skor) && skor >= ambang;

  if (competency.overridden) {
    return skorMemenuhiAmbang
      ? `Skor ${Math.round(skor)} sudah ≥ ambang ${Math.round(ambang)}, namun ${competency.unit_kritis_inti_count} unit inti berstatus Kritis`
      : `Skor ${Math.round(skor)} < ambang ${Math.round(ambang)}, dan ${competency.unit_kritis_inti_count} unit inti berstatus Kritis`;
  }

  return `Skor ${Math.round(skor)} ${skorMemenuhiAmbang ? '≥' : '<'} threshold ${Math.round(ambang)}`;
};

const KesiapanPklCard = ({ kesiapanPkl, estimasiSlotPkl, industriDirekomendasikan }) => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 2.5, borderRadius: '10px', backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[1] }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Kesiapan PKL</Typography>

      <StatusBox
        ok={kesiapanPkl.behavior.siap}
        label={kesiapanPkl.behavior.siap ? 'Behavior Siap' : 'Behavior Belum Siap'}
        keterangan={`Skor ${Math.round(kesiapanPkl.behavior.skor)} ${kesiapanPkl.behavior.siap ? '≥' : '<'} threshold ${Math.round(Number(kesiapanPkl.behavior.ambang))}`}
      />
      <StatusBox
        ok={kesiapanPkl.competency.siap}
        label={kesiapanPkl.competency.siap ? 'Kompetensi Siap' : 'Kompetensi Belum Siap'}
        keterangan={buildKeteranganKompetensi(kesiapanPkl.competency)}
      />

      <Divider sx={{ my: 1.5 }} />

      <EstimasiSiapPklBox estimasiSlotPkl={estimasiSlotPkl} />
      <IndustriRekomendasiBox industriDirekomendasikan={industriDirekomendasikan} />
    </Box>
  );
};

export default KesiapanPklCard;