import { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import WhatsAppSession from "src/apps/admin-sekolah/whatsApp/WhatsAppSession";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import socket from "src/utils/socket";

const fetchWhatsApp = async () => {
  const response = await axiosInstance.get('/api/v1/admin-sekolah/wa/session');
  return response.data.data;
};

const WhatsAppList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loadingConnect, setLoadingConnect] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  const queryClient = useQueryClient();

  const { data: whatsApp = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ['whatsApp'],
    queryFn: fetchWhatsApp,
    onError: (error) => {
      const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
      setError(errorMessage);
    }
  });

  useEffect(() => {
    if (!socket) return;

    const handleQr = ({ sekolah_id, qr }) => {
      if (String(currentSessionId) === String(sekolah_id)) {
        setQrCode(qr);
        setOpenQrDialog(true);
      }
    };

    const handleConnected = async ({ sekolah_id }) => {
      // 🔄 Update cache React Query agar status langsung berubah tanpa reload
      queryClient.setQueryData(['whatsApp'], (prev) => {
        if (!prev) return prev;
        return prev.map((item) =>
          String(item.sekolah_id) === String(sekolah_id)
            ? { ...item, status: 'connected' }
            : item
        );
      });

      if (String(currentSessionId) === String(sekolah_id)) {
        setSuccess('Berhasil terhubung ke WhatsApp');
        setOpenQrDialog(false);
        setQrCode('');
        setCurrentSessionId(null);
        setLoadingConnect(false);
      }
    };

    const handleDisconnected = async ({ sekolah_id }) => {
      // 🔄 Update cache agar status langsung "disconnected"
      queryClient.setQueryData(['whatsApp'], (prev) => {
        if (!prev) return prev;
        return prev.map((item) =>
          String(item.sekolah_id) === String(sekolah_id)
            ? { ...item, status: 'disconnected' }
            : item
        );
      });

      if (String(currentSessionId) === String(sekolah_id)) {
        setError('Koneksi WhatsApp terputus, silakan scan ulang QR');
      }
    };

    const handleSessionError = ({ sekolah_id, message }) => {
      if (String(currentSessionId) === String(sekolah_id)) {
        setError(message || 'Terjadi kesalahan pada sesi WhatsApp.');
        setLoadingConnect(false);
      }
    };

    socket.on('qr', handleQr);
    socket.on('sessionConnected', handleConnected);
    socket.on('sessionDisconnected', handleDisconnected);
    socket.on('sessionError', handleSessionError);

    return () => {
      socket.off('qr', handleQr);
      socket.off('sessionConnected', handleConnected);
      socket.off('sessionDisconnected', handleDisconnected);
      socket.off('sessionError', handleSessionError);
    };
  }, [currentSessionId, queryClient]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleConnect = async (sekolahId) => {
    try {
      setCurrentSessionId(String(sekolahId));
      setLoadingConnect(true);
      setOpenQrDialog(true);
      setQrCode('');
      await axiosInstance.get(`/api/v1/admin-sekolah/wa/${sekolahId}/qr`);
    } catch (error) {
      console.error('Gagal memulai koneksi:', error);
      setError("Gagal memulai koneksi");
      setLoadingConnect(false);
      setOpenQrDialog(false);
    }
  };

  const handleLogout = async (sekolahId) => {
    try {
      setLoadingLogout(true);
      await axiosInstance.delete(`/api/v1/admin-sekolah/wa/${sekolahId}/logout`);
      // 🔄 Patch cache agar langsung "disconnected" tanpa nunggu refetch
      queryClient.setQueryData(['whatsApp'], (prev) => {
        if (!prev) return prev;
        return prev.map((item) =>
          String(item.sekolah_id) === String(sekolahId)
            ? { ...item, status: 'disconnected' }
            : item
        );
      });
      setSuccess("Berhasil logout dari WhatsApp");
      setCurrentSessionId(null);
    } catch (error) {
      console.error(error);
      setError("Gagal logout dari WhatsApp");
    } finally {
      setLoadingLogout(false);
    }
  };

  const handleShowQR = async (sekolahId) => {
    try {
      setCurrentSessionId(String(sekolahId));
      const response = await axiosInstance.get(`/api/v1/admin-sekolah/wa/${sekolahId}/qr`);
      if (response.data?.qr) {
        setQrCode(response.data.qr);
        setOpenQrDialog(true);
      }
    } catch (error) {
      console.error(error);
      setError("Gagal mengambil QR code");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const globalLoading = isLoading || loadingConnect || loadingLogout;

  return (
    <PageContainer title="WhatsApp Session" description="Manajemen Koneksi WhatsApp">
      <ParentCard title="Koneksi WhatsApp Admin Sekolah">
        <Alerts error={error || (isError && queryError?.message)} success={success} />

        <WhatsAppSession
          scan={whatsApp}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          isLoading={globalLoading}
          isError={isError}
          errorMessage={error}
          handleConnect={handleConnect}
          handleLogout={handleLogout}
          handleShowQR={handleShowQR}
        />

        {/* Dialog QR Code */}
        <Dialog open={openQrDialog} onClose={() => setOpenQrDialog(false)} maxWidth="sm" fullWidth>
          <DialogContent sx={{ textAlign: 'center' }}>
            {qrCode ? (
              <img
                src={qrCode}
                alt="QR Code WhatsApp"
                style={{ width: 300, height: 300 }}
              />
            ) : (
              <Box textAlign="center" my={5}>
                Loading QR Code...
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenQrDialog(false)} variant="contained">
              Tutup
            </Button>
          </DialogActions>
        </Dialog>
      </ParentCard>
    </PageContainer>
  );
};

export default WhatsAppList;
