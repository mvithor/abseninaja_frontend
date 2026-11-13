import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { IconLock, IconUserOff } from "@tabler/icons-react";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import { portalLainSelain } from "src/portals/registry";
import { useKonteksBk } from "./useKonteksBk";

const Pesan = ({ icon, judul, children }) => {
  const Icon = icon;
  return (
    <PageContainer title="Portal Guru BK" description="Portal Guru BK">
      <ParentCard title="Portal Guru BK">
        <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
          <Icon size={48} color="#94A3B8" />
          <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
            {judul}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {children}
          </Typography>
        </Box>
      </ParentCard>
    </PageContainer>
  );
};

// Gerbang semua halaman portal Guru BK. Server menolak semua endpoint BK (kecuali /konteks) untuk
// pegawai yang bukan anggota Tim BK atau yang dinonaktifkan, jadi halaman tidak dirender dan
// tidak memanggil endpoint lain pada dua kondisi itu.
//
// Bila akun masih memegang portal lain (mis. Guru Mapel), pengguna langsung dialihkan ke sana dan
// daftar persona disegarkan, supaya menu BK hilang tanpa menunggu siklus /konteks berikutnya.
const GerbangKonteksBk = () => {
  const user = useSelector((state) => state.user);
  const queryClient = useQueryClient();
  const {
    data: konteks,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useKonteksBk();

  const ditolak =
    (isError && error?.response?.status === 403) || (konteks && !konteks.aktif);
  const portalLain = ditolak ? portalLainSelain(user, "guru-bk") : null;

  useEffect(() => {
    if (ditolak) queryClient.invalidateQueries({ queryKey: ["konteks"] });
  }, [ditolak, queryClient]);

  if (portalLain) return <Navigate to={portalLain.path} replace />;

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 240,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    if (error?.response?.status === 403) {
      return (
        <Pesan icon={IconLock} judul="Anda belum terdaftar di Tim BK">
          Hubungi koordinator BK agar Anda ditambahkan ke Tim BK beserta kelas
          tanggung jawabnya.
        </Pesan>
      );
    }
    return (
      <PageContainer title="Portal Guru BK" description="Portal Guru BK">
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              Coba lagi
            </Button>
          }
        >
          {error?.response?.data?.msg ||
            "Profil BK gagal dimuat. Periksa koneksi lalu coba lagi."}
        </Alert>
      </PageContainer>
    );
  }

  if (konteks && !konteks.aktif) {
    return (
      <Pesan icon={IconUserOff} judul="Akun BK Anda dinonaktifkan koordinator">
        Anda tidak dapat membuka data siswa, jurnal, pengaduan, maupun jadwal.
        Hubungi koordinator BK untuk mengaktifkan kembali akun Anda.
      </Pesan>
    );
  }

  return <Outlet />;
};

export default GerbangKonteksBk;
