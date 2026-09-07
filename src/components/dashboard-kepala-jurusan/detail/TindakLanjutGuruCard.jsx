import PropTypes from 'prop-types';
import { Box, Typography, Chip, Button, Stack, useTheme } from '@mui/material';
import { IconUserBolt, IconTools, IconArrowRight } from '@tabler/icons-react';
import { STATUS_PROFIL_CONFIG } from '../sga/KuadranConfig';

// Status siswa yang memicu munculnya kartu ini. Selain ini (mis.
// SIAP_PENUH / DATA_BELUM_CUKUP) kartu tidak dirender sama sekali.
const STATUS_BERMASALAH = ['RISIKO_BEHAVIOR', 'RISIKO_COMPETENCY', 'RISIKO_GANDA'];

// Label komponen behavior — konsisten dengan BreakdownBehaviorCard.
const KOMPONEN_BEHAVIOR_LABEL = {
  kehadiran: 'Kehadiran',
  ketepatan: 'Ketepatan Tugas',
  perizinan: 'Perizinan',
  sikap_kerja: 'Sikap Kerja',
};
const KOMPONEN_ORDER = ['kehadiran', 'ketepatan', 'perizinan', 'sikap_kerja'];

// Status unit kompetensi yang dianggap perlu penuntasan oleh guru produktif.
const STATUS_UNIT_PERLU = { LEMAH: 'Lemah', KRITIS: 'Kritis' };

const TindakLanjutGuruCard = ({
  profilStatus,
  behaviorPerKomponen,
  ambangBehavior,
  daftarUnit,
  namaSiswa,
  onTindakLanjut,
}) => {
  const theme = useTheme();

  // Kartu hanya untuk siswa yang berstatus risiko.
  if (!STATUS_BERMASALAH.includes(profilStatus)) return null;

  const cfg = STATUS_PROFIL_CONFIG[profilStatus] || STATUS_PROFIL_CONFIG.RISIKO_GANDA;
  const perluBehavior = profilStatus === 'RISIKO_BEHAVIOR' || profilStatus === 'RISIKO_GANDA';
  const perluCompetency = profilStatus === 'RISIKO_COMPETENCY' || profilStatus === 'RISIKO_GANDA';

  const ambangNum = Number(ambangBehavior) || 0;

  // Komponen behavior yang skornya di bawah ambang — inilah kekurangan
  // yang perlu dibina oleh wali kelas / guru BK.
  const komponenBermasalah = perluBehavior
    ? KOMPONEN_ORDER
        .map((key) => ({ key, label: KOMPONEN_BEHAVIOR_LABEL[key], skor: behaviorPerKomponen?.[key] }))
        .filter((k) => k.skor !== null && k.skor !== undefined && k.skor < ambangNum)
    : [];

  // Unit kompetensi berstatus Lemah/Kritis — perlu penguatan oleh guru
  // produktif pengampu unit tersebut.
  const unitBermasalah = perluCompetency
    ? [...(daftarUnit || [])]
        .filter((u) => STATUS_UNIT_PERLU[u.status_unit])
        .sort((a, b) => (a.ketercapaian_unit ?? 0) - (b.ketercapaian_unit ?? 0))
    : [];

  const handleClick = (payload) => {
    if (typeof onTindakLanjut === 'function') {
      onTindakLanjut({ ...payload, profilStatus, namaSiswa });
    }
  };

  const adaBehavior = komponenBermasalah.length > 0;
  const adaCompetency = unitBermasalah.length > 0;

  return (
    <Box sx={{ p: 2.5, borderRadius: '10px', backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[1], borderTop: `3px solid ${cfg.color}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.3 }}>
        <Typography variant="subtitle1" fontWeight={700}>Tindak Lanjut ke Guru</Typography>
        <Chip size="small" label={cfg.label} sx={{ backgroundColor: cfg.color, color: '#fff', fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
      </Box>
      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 2 }}>
        Arahkan penuntasan kekurangan siswa ke guru yang bersangkutan
      </Typography>

      {/* Tidak ada kekurangan yang terdeteksi walau status risiko —
          bisa terjadi bila skor agregat rendah tapi tiap komponen/unit
          sudah di ambang, atau data belum lengkap. */}
      {!adaBehavior && !adaCompetency && (
        <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: 'action.hover' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Belum ada komponen atau unit spesifik yang bisa dieskalasi. Tinjau kembali rincian behavior & unit kompetensi.
          </Typography>
        </Box>
      )}

      {adaBehavior && (
        <Box sx={{ mb: adaCompetency ? 2 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '8px', backgroundColor: '#FF7B0114', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconUserBolt size={16} color="#FF7B01" />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={700}>Pembinaan Perilaku</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Wali Kelas / Guru BK</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 2, rowGap: 0.8, mb: 1.2 }}>
            {komponenBermasalah.map((k) => (
              <Box key={k.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 600 }}>{k.label}</Typography>
                <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 700 }}>{Math.round(k.skor)}</Typography>
              </Box>
            ))}
          </Box>

          <Button
            fullWidth
            variant="outlined"
            size="small"
            endIcon={<IconArrowRight size={16} />}
            onClick={() => handleClick({
              jenis: 'behavior',
              target: 'WALI_KELAS_BK',
              targetLabel: 'Wali Kelas / Guru BK',
              komponen: komponenBermasalah.map((k) => k.key),
            })}
            sx={{ color: '#D97706', borderColor: '#FF7B0155', '&:hover': { borderColor: '#FF7B01', backgroundColor: '#FF7B010A' } }}
          >
            Tindak Lanjut ke Wali Kelas / BK
          </Button>
        </Box>
      )}

      {adaCompetency && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '8px', backgroundColor: '#2388FF14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconTools size={16} color="#2388FF" />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={700}>Penguatan Kompetensi</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Guru Produktif pengampu unit</Typography>
            </Box>
          </Box>

          <Stack spacing={1}>
            {unitBermasalah.map((unit) => {
              const kritis = unit.status_unit === 'KRITIS';
              const warna = kritis ? '#DC2626' : '#D97706';
              const bg = kritis ? '#FF383C14' : '#FF7B0114';
              return (
                <Box key={unit.kode_unit} sx={{ p: 1.2, borderRadius: '8px', backgroundColor: bg }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                    <Box sx={{ minWidth: 0, pr: 1 }}>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>{unit.kode_unit}</Typography>
                      <Typography variant="body2" fontWeight={700}>{unit.judul_unit}</Typography>
                    </Box>
                    <Chip size="small" label={`${STATUS_UNIT_PERLU[unit.status_unit]} · ${Math.round(unit.ketercapaian_unit)}`} sx={{ backgroundColor: warna, color: '#fff', fontWeight: 700, fontSize: '0.66rem', height: 22, flexShrink: 0 }} />
                  </Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    endIcon={<IconArrowRight size={16} />}
                    onClick={() => handleClick({
                      jenis: 'competency',
                      target: 'GURU_PRODUKTIF',
                      targetLabel: 'Guru Produktif',
                      kodeUnit: unit.kode_unit,
                      judulUnit: unit.judul_unit,
                      statusUnit: unit.status_unit,
                    })}
                    sx={{ color: warna, borderColor: `${warna}55`, '&:hover': { borderColor: warna, backgroundColor: `${warna}0A` } }}
                  >
                    Tindak Lanjut ke Guru Produktif
                  </Button>
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

TindakLanjutGuruCard.propTypes = {
  profilStatus: PropTypes.string,
  behaviorPerKomponen: PropTypes.object,
  ambangBehavior: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  daftarUnit: PropTypes.array,
  namaSiswa: PropTypes.string,
  onTindakLanjut: PropTypes.func,
};

export default TindakLanjutGuruCard;
