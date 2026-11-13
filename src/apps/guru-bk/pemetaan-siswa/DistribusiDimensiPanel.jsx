import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import { Box, Button, LinearProgress, Paper, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { IconAlertTriangle } from '@tabler/icons-react';
import DistribusiKategoriChart from 'src/components/pemetaan-siswa/DistribusiKategoriChart';
import { DIMENSI } from 'src/components/pemetaan-siswa/pemetaanConfig';

// Tab per dimensi + grafik distribusi kategori. Klik bar = filter tabel ke kategori itu.
const DistribusiDimensiPanel = ({ ringkasan, isLoading, dimensi, kategori, onPilihDimensi, onPilihKategori, onLihatPerhatian }) => {
  const dataDimensi = ringkasan?.dimensi?.find((d) => d.kode === dimensi);
  const meta = DIMENSI.find((d) => d.kode === dimensi);
  const total = ringkasan?.total_siswa || 0;
  const persenPerhatian = total ? Math.round(((dataDimensi?.jumlah_perhatian || 0) / total) * 100) : 0;

  return (
    <Paper variant="outlined" sx={{ mb: 3 }}>
      <Tabs
        value={dimensi}
        onChange={(_e, v) => onPilihDimensi(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ px: 1, borderBottom: 1, borderColor: 'divider' }}
      >
        {DIMENSI.map((d) => {
          const Icon = d.icon;
          const jumlah = ringkasan?.dimensi?.find((x) => x.kode === d.kode)?.jumlah_perhatian;
          return (
            <Tab
              key={d.kode}
              value={d.kode}
              iconPosition="start"
              icon={<Icon size={18} />}
              label={jumlah ? `${d.label} (${jumlah})` : d.label}
              sx={{ textTransform: 'none', minHeight: 52 }}
            />
          );
        })}
      </Tabs>

      <Grid container spacing={3} sx={{ p: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          {isLoading || !dataDimensi ? (
            <Skeleton variant="rounded" height={220} />
          ) : (
            <DistribusiKategoriChart
              kategori={dataDimensi.kategori}
              total={total}
              kategoriAktif={kategori}
              onPilihKategori={(kode) => onPilihKategori(kode === kategori ? '' : kode)}
            />
          )}
          <Typography variant="caption" color="text.secondary">
            Klik bar untuk memfilter tabel. ⚠ = kategori yang perlu perhatian BK.
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6">{meta?.label}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{meta?.keterangan}</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <IconAlertTriangle size={18} />
            <Typography variant="subtitle2">Perlu perhatian</Typography>
          </Box>
          {isLoading ? (
            <Skeleton width="60%" />
          ) : (
            <>
              <Typography variant="h3">
                {dataDimensi?.jumlah_perhatian ?? 0}
                <Typography component="span" variant="body1" color="text.secondary"> / {total} siswa</Typography>
              </Typography>
              <LinearProgress variant="determinate" value={persenPerhatian} sx={{ height: 8, borderRadius: 4, my: 1 }} />
              <Typography variant="body2" color="text.secondary">{persenPerhatian}% siswa pada lingkup ini</Typography>
            </>
          )}
          <Button
            size="small"
            variant="outlined"
            onClick={onLihatPerhatian}
            disabled={!dataDimensi?.jumlah_perhatian}
            sx={{ mt: 2, textTransform: 'none' }}
          >
            Tampilkan siswa yang perlu perhatian
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

DistribusiDimensiPanel.propTypes = {
  ringkasan: PropTypes.object,
  isLoading: PropTypes.bool,
  dimensi: PropTypes.string.isRequired,
  kategori: PropTypes.string,
  onPilihDimensi: PropTypes.func.isRequired,
  onPilihKategori: PropTypes.func.isRequired,
  onLihatPerhatian: PropTypes.func.isRequired,
};

export default DistribusiDimensiPanel;
