import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { IconBuildingStore, IconLock } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import { bacaStatusGerbangKantin } from './kantin';
import { useKonteksKantin } from './useKonteksKantin';

const PesanGerbang = ({ icon, judul, children }) => {
  const Icon = icon;
  return (
    <PageContainer title="Portal Admin Kantin" description="Portal Admin Kantin">
      <ParentCard title="Portal Admin Kantin">
        <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
          <Icon size={48} color="#7C8FAC" />
          <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
            {judul}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto' }}>
            {children}
          </Typography>
        </Box>
      </ParentCard>
    </PageContainer>
  );
};

PesanGerbang.propTypes = {
  icon: PropTypes.elementType.isRequired,
  judul: PropTypes.string.isRequired,
  children: PropTypes.node,
};

// Gerbang rute Portal Admin Kantin. Menangani akun yang belum tertaut unit kantin (404)
// atau dinonaktifkan (403). Saat unit kantin nonaktif sementara, admin tetap dapat melihat
// ringkasan, transaksi, pencairan, dan rekonsiliasi sambil menampilkan peringatan jelas.
const GerbangKonteksKantin = () => {
  const { data: profil, isLoading, isError, error, refetch, isFetching } = useKonteksKantin();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
        <CircularProgress />
      </Box>
    );
  }

  const gerbang = bacaStatusGerbangKantin({ isError, error, profilData: profil });

  if (gerbang.status === 'tautan_belum_ada') {
    return (
      <PesanGerbang icon={IconBuildingStore} judul={gerbang.judul}>
        {gerbang.keterangan}
      </PesanGerbang>
    );
  }

  if (gerbang.status === 'terlarang') {
    return (
      <PesanGerbang icon={IconLock} judul={gerbang.judul}>
        {gerbang.keterangan}
      </PesanGerbang>
    );
  }

  if (gerbang.status === 'galat') {
    return (
      <PageContainer title="Portal Admin Kantin" description="Portal Admin Kantin">
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()} disabled={isFetching}>
              Coba lagi
            </Button>
          }
        >
          {gerbang.keterangan}
        </Alert>
      </PageContainer>
    );
  }

  return (
    <>
      {!gerbang.unitAktif && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {gerbang.keterangan}
        </Alert>
      )}
      <Outlet context={{ profil, unitAktif: gerbang.unitAktif }} />
    </>
  );
};

export default GerbangKonteksKantin;
