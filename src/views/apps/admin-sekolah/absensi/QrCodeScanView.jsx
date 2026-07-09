import { Container, Typography, Box } from "@mui/material";
import QRCodeScanner from "src/apps/admin-sekolah/absensi/Add/QrCodeScanner";
import axiosInstance from "src/utils/axiosInstance";
import Alerts from "src/components/alerts/Alerts";
import { useState, useEffect, useRef } from "react";

// [FIX] useQuery + fetchPengaturanJam dihapus — tidak diperlukan lagi
// Keputusan masuk vs pulang diserahkan ke server (sudah tau timezone sekolah)
const QrCodeScanView = () => {
  const [error, setError] = useState("");
  const resetErrorTimeout = useRef(null);

  useEffect(() => {
    if (error) {
      clearTimeout(resetErrorTimeout.current);
      resetErrorTimeout.current = setTimeout(() => setError(""), 1500);
    }
    return () => clearTimeout(resetErrorTimeout.current);
  }, [error]);

  const handleScanSuccess = async (text) => {
    const lines = text.split("\n");
    let kode_qr = null;
    lines.forEach((line) => {
      if (line.startsWith("Kode QR:")) {
        // [FIX] slice(1).join(':') — preserve value yang mengandung ':' (misal UUID)
        kode_qr = line.split(":").slice(1).join(":").trim();
      }
    });

    if (!kode_qr) {
      return { success: false, error: "QR Code tidak valid atau tidak mengandung Kode QR." };
    }

    // [FIX] Hapus client-side time comparison — itu root cause bug WIT
    //
    // Bug lama:
    //   currentTime = browser WIB time  (08:30)
    //   jamMasuk    = parsed as WIB     (10:30 WIT → diparse WIB → salah 2 jam)
    //   08:30 >= 10:30 → false → panggil /pulang → server: "belum absen masuk" → ERROR
    //
    // Fix: coba /masuk dulu; server tau timezone sekolah dan putuskan sendiri.
    // Jika siswa sudah masuk hari ini, eskalasi ke /pulang.
    try {
      await axiosInstance.post("/api/v1/admin-sekolah/absensi/masuk", { kode_qr });
      return { success: true };
    } catch (errMasuk) {
      const msgMasuk = errMasuk.response?.data?.msg || "";

      // Eskalasi ke pulang HANYA jika siswa sudah punya record masuk hari ini
      // (bukan "belum waktunya absen", bukan "QR tidak valid", dll.)
      if (msgMasuk.toLowerCase().includes("sudah memiliki absensi")) {
        try {
          await axiosInstance.post("/api/v1/admin-sekolah/absensi/pulang", { kode_qr });
          return { success: true };
        } catch (errPulang) {
          const msgPulang = errPulang.response?.data?.msg || "Gagal absen pulang.";
          // [FIX] Tampilkan dua pesan sekaligus — user tau konteks lengkap:
          // "sudah absen masuk" + status pulang dari server (belum waktunya / sudah pulang / dsb)
          // Pemisah ". " supaya terbaca natural sebagai dua kalimat terpisah
          return {
            success: false,
            error: `${msgMasuk}. ${msgPulang}`,
          };
        }
      }

      return {
        success: false,
        error: msgMasuk || "Gagal memproses absensi.",
      };
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 1 }}>
      <Typography variant="h4" align="center" gutterBottom>
        QR Code Scanner
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Alerts error={error} />
      </Box>
      <QRCodeScanner
        onScanSuccess={handleScanSuccess}
        onScanError={(msg) => setError(msg)}
        setErrorGlobal={setError}
        disabled={!!error}
      />
    </Container>
  );
};

export default QrCodeScanView;