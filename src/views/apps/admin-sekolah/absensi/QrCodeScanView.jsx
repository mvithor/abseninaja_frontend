import { Container, Typography, Box } from "@mui/material";
import QRCodeScanner from "src/apps/admin-sekolah/absensi/Add/QrCodeScanner";
import axiosInstance from "src/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import Alerts from "src/components/alerts/Alerts";
import { useState, useEffect, useRef } from "react";

const fetchPengaturanJam = async () => {
  const response = await axiosInstance.get("/api/v1/admin-sekolah/pengaturan-jam");
  return response.data.data;
};

const QrCodeScanView = () => {
  const { data: pengaturanJam, isLoading, isError } = useQuery({
    queryKey: ["pengaturanJam"],
    queryFn: fetchPengaturanJam,
  });

  const [error, setError] = useState("");
  const resetErrorTimeout = useRef(null);

  useEffect(() => {
    if (error) {
      clearTimeout(resetErrorTimeout.current);
      resetErrorTimeout.current = setTimeout(() => {
        setError("");
      }, 1500);
    }
    return () => clearTimeout(resetErrorTimeout.current);
  }, [error]);

  const handleScanSuccess = async (text) => {
    const lines = text.split("\n");
    let kode_qr = null;

    lines.forEach((line) => {
      if (line.startsWith("Kode QR:")) {
        kode_qr = line.split(":")[1].trim();
      }
    });

    if (!kode_qr) {
      return { success: false, error: "QR Code tidak valid atau tidak mengandung Kode QR." };
    }

    if (!pengaturanJam) {
      return { success: false, error: "Pengaturan jam tidak tersedia." };
    }

    

    const currentDate = new Date();
    const currentTime = new Date(`${currentDate.toISOString().split("T")[0]}T${currentDate.toTimeString().split(" ")[0]}`);
    const jamMasuk = new Date(`${currentDate.toISOString().split("T")[0]}T${pengaturanJam.jam_masuk}`);
    const jamPulang = new Date(`${currentDate.toISOString().split("T")[0]}T${pengaturanJam.jam_pulang}`);

    const endpoint =
      currentTime >= jamMasuk && currentTime < jamPulang
        ? "/api/v1/admin-sekolah/absensi/masuk"
        : "/api/v1/admin-sekolah/absensi/pulang";

        try {
            await axiosInstance.post(endpoint, { kode_qr });
            return { success: true };
          } catch (err) {
            const messageFromServer = err.response?.data?.msg;
            return {
              success: false,
              error: messageFromServer || "Anda sudah melakukan absensi hari ini.",
            };
          }          
  };

  const handleScanError = (message) => {
    setError(message);
  };

  if (isLoading) return <Typography>Loading pengaturan jam...</Typography>;
  if (isError) return <Typography>Error loading pengaturan jam.</Typography>;

  return (
    <Container maxWidth="sm" sx={{ mt: 1 }}>
      <Typography variant="h4" align="center" gutterBottom>
        QR Code Scanner
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Alerts error={error}/>
       </Box>
      <QRCodeScanner
        onScanSuccess={handleScanSuccess}
        onScanError={handleScanError}
        setErrorGlobal={setError}
        disabled={!!error}
      />

    </Container>
  );
};

export default QrCodeScanView;
