import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';

import ProfilSiswaDetailHeader from 'src/components/dashboard-kepala-jurusan/detail/ProfilSiswaDetailHeader';
import DimensiScoreCard from 'src/components/dashboard-kepala-jurusan/detail/DimensiScoreCard';
import ProfilDiagnostikCard from 'src/components/dashboard-kepala-jurusan/detail/ProfilDiagnostikCard';
import BreakdownBehaviorCard from 'src/components/dashboard-kepala-jurusan/detail/BreakdownBehaviorCard';
import KesiapanPklCard from 'src/components/dashboard-kepala-jurusan/detail/KesiapanPklCard';
import UnitKompetensiCard from 'src/components/dashboard-kepala-jurusan/detail/UnitKompetensiCard';
import RekomendasiIntervensiCard from 'src/components/dashboard-kepala-jurusan/detail/RekomendasiIntervensiCard';
import CatatanRencanaPklCard from 'src/components/dashboard-kepala-jurusan/detail/CatatanRencanaPklCard';
import TrenSkorChart from 'src/components/dashboard-kepala-jurusan/detail/TrenSkorChart';

// Presentational murni: tidak fetching, tidak punya query state.
// Semua data datang dari props `data` (bentuknya sama persis dengan
// res.data.data dari GET /api/v1/kepala-jurusan/profile-siswa/:siswaId).
const ProfilSiswaDetailContent = ({ data }) => {
  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <ProfilSiswaDetailHeader header={data.header} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <DimensiScoreCard
            title="Dimensi 1 — Behavior"
            subtitle="Behavior Score"
            score={data.behavior_score_cumulative}
            ambang={data.kesiapan_pkl.behavior.ambang}
            siap={data.kesiapan_pkl.behavior.siap}
            footerText="Otomatis dari Absensi"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ProfilDiagnostikCard
            profilStatus={data.header.profil_status}
            behaviorScore={data.behavior_score_cumulative}
            competencyScore={data.competency_score_cumulative}
            ambangBehavior={data.kesiapan_pkl.behavior.ambang}
            ambangCompetency={data.kesiapan_pkl.competency.ambang}
            behaviorSiap={data.kesiapan_pkl.behavior.siap}
            competencySiap={data.kesiapan_pkl.competency.siap}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <DimensiScoreCard
            title="Dimensi 2 — Competency"
            subtitle="Skor Kompetensi"
            score={data.competency_score_cumulative}
            ambang={data.kesiapan_pkl.competency.ambang}
            siap={data.kesiapan_pkl.competency.siap}
            overridden={data.kesiapan_pkl.competency.overridden}
            unitKritisCount={data.kesiapan_pkl.competency.unit_kritis_inti_count}
            footerText="Input guru per unit SKKNI"
          />
        </Grid>
      </Grid>

      {/* [DIRESTRUKTUR] Sebelumnya dua Grid container terpisah (baris
          Breakdown+Kesiapan, lalu baris UnitKompetensi+Rekomendasi) —
          karena Kesiapan PKL lebih tinggi dari Breakdown Behavior, baris
          kedua (Unit Kompetensi) terpaksa mulai setelah SELURUH baris
          pertama selesai, menyisakan jeda kosong di bawah kartu yang
          lebih pendek. Sekarang jadi DUA KOLOM independen (kiri:
          Breakdown → Unit Kompetensi, kanan: Kesiapan PKL → Rekomendasi
          → Catatan) — tiap kolom mengalir sesuai tinggi kontennya
          sendiri, tidak terikat tinggi kolom sebelahnya. */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <BreakdownBehaviorCard
              behaviorPerKomponen={data.behavior_per_komponen}
              ambangBehavior={data.kesiapan_pkl.behavior.ambang}
            />
            <UnitKompetensiCard daftarUnit={data.daftar_unit} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <KesiapanPklCard
              kesiapanPkl={data.kesiapan_pkl}
              estimasiSlotPkl={data.estimasi_slot_pkl}
              industriDirekomendasikan={data.industri_direkomendasikan}
            />
            <RekomendasiIntervensiCard rekomendasiIntervensi={data.rencana_pkl?.rekomendasi_intervensi} />
            <CatatanRencanaPklCard catatan={data.rencana_pkl?.catatan_rencana_pkl} />
          </Box>
        </Grid>
      </Grid>

      <TrenSkorChart
        tren={data.tren_skor}
        ambangBehavior={data.kesiapan_pkl.behavior.ambang}
        ambangCompetency={data.kesiapan_pkl.competency.ambang}
      />
    </Box>
  );
};

ProfilSiswaDetailContent.propTypes = {
  data: PropTypes.shape({
    header: PropTypes.object.isRequired,
    behavior_score_cumulative: PropTypes.number,
    competency_score_cumulative: PropTypes.number,
    behavior_per_komponen: PropTypes.object,
    daftar_unit: PropTypes.array,
    kesiapan_pkl: PropTypes.object.isRequired,
    estimasi_slot_pkl: PropTypes.object,
    industri_direkomendasikan: PropTypes.object,
    rencana_pkl: PropTypes.object,
    tren_skor: PropTypes.object,
  }).isRequired,
};

export default ProfilSiswaDetailContent;