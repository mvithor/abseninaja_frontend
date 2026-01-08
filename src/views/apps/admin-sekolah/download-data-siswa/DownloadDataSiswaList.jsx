import { useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress
} from "@mui/material";
import Alerts from "src/components/alerts/Alerts";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import DownloadDataSiswaTable from "src/apps/admin-sekolah/download-data-siswa/DownloadDataSiswaTable";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchKelas = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/admin-sekolah/kelas');
    return response.data.data;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching kelas:', error);
    }
    throw new Error('Terjadi kesalahan saat mengambil data kelas. Silakan coba lagi.');
  }
};

const DownloadDataSiswaList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadKelasName, setDownloadKelasName] = useState("");

  const { data: kelas = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ['kelas'],
    queryFn: fetchKelas,
    onError: (error) => {
      const errorMessage = error?.message || "Terjadi kesalahan saat memuat data";
      setError(errorMessage);
    }
  });

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const normalizeNamaKelas = (nama) => {
    return nama
      .toUpperCase()
      .replace(/\s+/g, ' ')
      .replace(/(\d+)([A-Za-z]+)/, '$1 $2')
      .trim();
  };

  const filteredKelas = (Array.isArray(kelas) ? kelas : [])
    .map((k) => ({
      ...k,
      normalizedNamaKelas: normalizeNamaKelas(k.nama_kelas)
    }))
    .filter((k) =>
      k.normalizedNamaKelas.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const romanToInt = (roman) => {
        const romanMap = { I: 1, V: 5, X: 10, L: 50, C: 100 };
        let value = 0;

        for (let i = 0; i < roman.length; i++) {
          const current = romanMap[roman[i]];
          const next = romanMap[roman[i + 1]];

          if (next > current) {
            value += next - current;
            i++;
          } else {
            value += current;
          }
        }
        return value;
      };

      const intA = romanToInt(a.normalizedNamaKelas.split(' ')[0]) || 0;
      const intB = romanToInt(b.normalizedNamaKelas.split(' ')[0]) || 0;

      if (intA !== intB) {
        return intA - intB;
      }

      return a.normalizedNamaKelas.localeCompare(b.normalizedNamaKelas);
    });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const extractFilenameFromDisposition = (contentDisposition) => {
    try {
      if (!contentDisposition) return null;

      // contoh: attachment; filename="Data_Siswa_VII_A.pdf"
      const match = /filename\*?=(?:UTF-8'')?("?)([^";]+)\1/i.exec(contentDisposition);
      if (!match || !match[2]) return null;

      return decodeURIComponent(match[2]);
    } catch {
      return null;
    }
  };

  const handleDownload = async (kelasId) => {
    try {
      const kelasRow = filteredKelas.find((k) => k.id === kelasId) || null;
      setDownloadKelasName(kelasRow?.nama_kelas || '');
      setDownloadDialogOpen(true);
      setDownloadLoading(true);
      setError('');
      setSuccess('');

      const response = await axiosInstance.get(`/api/v1/admin-sekolah/download/data-siswa-kelas`, {
        params: { kelas_id: kelasId },
        responseType: 'blob',
      });

      const contentDisposition = response?.headers?.['content-disposition'] || response?.headers?.['Content-Disposition'];
      const filename =
        extractFilenameFromDisposition(contentDisposition) ||
        `Data_Siswa_${normalizeNamaKelas(kelasRow?.nama_kelas || 'Kelas')}.pdf`;

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      setSuccess('File PDF berhasil diunduh');
      setTimeout(() => setSuccess(''), 2500);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Download error:', error);
      }

      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        error?.message ||
        'Gagal mengunduh PDF. Silakan coba lagi.';

      setError(msg);
      setTimeout(() => setError(''), 3000);
    } finally {
      setDownloadLoading(false);
      setTimeout(() => {
        setDownloadDialogOpen(false);
        setDownloadKelasName('');
      }, 600);
    }
  };

  const handleCloseDownloadDialog = () => {
    if (downloadLoading) return; // jangan biarkan user nutup pas lagi download
    setDownloadDialogOpen(false);
    setDownloadKelasName('');
  };

  return (
    <PageContainer title="Download Data Siswa" description="Download Data Siswa per Kelas">
      <ParentCard title="Download Data Siswa">
        <Alerts error={error} success={success} />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            width: '100%',
            mb: 2,
            mt: -2
          }}
        >
          <SearchButton
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari Kelas"
          />
        </Box>

        <DownloadDataSiswaTable
          kelasData={filteredKelas}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleRowsPerPageChange}
          handleDownload={handleDownload}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
        />
      </ParentCard>

      <Dialog
        open={downloadDialogOpen}
        onClose={handleCloseDownloadDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              py: 2
            }}
          >
            <CircularProgress />
            <Typography variant="h6" align="center">
              Sedang menyiapkan PDF{downloadKelasName ? ` untuk ${downloadKelasName}` : ''}...
            </Typography>
            <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
              Jangan tutup halaman ini sampai proses selesai.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCloseDownloadDialog}
            disabled={downloadLoading}
          >
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default DownloadDataSiswaList;
