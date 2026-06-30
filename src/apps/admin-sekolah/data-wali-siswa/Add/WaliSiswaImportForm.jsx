import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  CircularProgress,
  Collapse,
  Alert,
  Button,
} from '@mui/material';
import {
  IconDownload,
  IconUpload,
  IconFileSpreadsheet,
  IconX,
  IconChevronDown,
  IconChevronUp,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import CancelButton from 'src/components/button-group/CancelButton';
import axiosInstance from 'src/utils/axiosInstance';

const ALLOWED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];
const MAX_SIZE = 5 * 1024 * 1024;

const HUBUNGAN_OPTIONS = ['Ayah', 'Ibu', 'Kakak', 'Paman', 'Bibi', 'wali_lainnya'];

const WaliSiswaImportForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showSiswa, setShowSiswa] = useState(false);

  const { data: siswaList = [], isError: siswaLoadError } = useQuery({
    queryKey: ['siswaReferensiWali'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/siswa');
      return res.data.data ?? res.data;
    },
  });

  const validateFile = (selectedFile) => {
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('File harus berformat .xlsx atau .xls');
      return false;
    }
    if (selectedFile.size > MAX_SIZE) {
      setError('Ukuran file maksimal 5 MB');
      return false;
    }
    return true;
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    setError('');
    setImportResult(null);
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const response = await axiosInstance.get('/api/v1/admin-sekolah/import/template/wali-siswa', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_import_wali_siswa.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Gagal mengunduh template. Silakan coba lagi.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Pilih file Excel terlebih dahulu');
      return;
    }
    setIsImporting(true);
    setImportResult(null);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await axiosInstance.post('/api/v1/admin-sekolah/import/wali-siswa', formData);
      setImportResult(data);
      if (data.gagal === 0) {
        setSuccess(data.msg || `Semua ${data.berhasil} data wali siswa berhasil diimport`);
        setTimeout(() => navigate('/dashboard/admin-sekolah/wali-siswa'), 3000);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.msg;
      if (status === 400) setError(msg || 'File tidak valid atau format salah');
      else if (status === 413) setError('Ukuran file maksimal 5 MB');
      else setError(msg || 'Terjadi kesalahan saat mengimport data');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Box sx={{ mt: -2 }}>
      {/* Peringatan urutan import */}
      <Alert
        severity="warning"
        icon={<IconAlertCircle size={18} />}
        sx={{ mb: 3, fontSize: '0.82rem' }}
      >
        <strong>Perhatian:</strong> Import wali siswa hanya bisa dilakukan{' '}
        <strong>setelah data siswa sudah diimport</strong>, karena kolom{' '}
        <code>nama_siswa</code> merujuk ke nama siswa yang sudah ada di sistem.
        Akun wali siswa yang berhasil dibuat akan memiliki status <strong>belum aktif</strong> — sistem otomatis mengirim link aktivasi via WhatsApp.
      </Alert>

      {/* Step 1 — Download Template */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={1}>
          Langkah 1 — Download Template Excel
        </Typography>
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              Download template, isi sesuai format, lalu upload di langkah 2.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Format yang diterima: .xlsx / .xls &nbsp;|&nbsp; Maks: 5 MB
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={isDownloading ? <CircularProgress size={14} /> : <IconDownload size={16} />}
            onClick={handleDownloadTemplate}
            disabled={isDownloading}
            sx={{
              textTransform: 'none',
              borderColor: '#973BE0',
              color: '#973BE0',
              '&:hover': { borderColor: '#7d2dbd', color: '#7d2dbd' },
            }}
          >
            {isDownloading ? 'Mengunduh...' : 'Download Template'}
          </Button>
        </Box>

        {/* Referensi nilai kolom */}
        <Box sx={{ mt: 1.5, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Referensi hubungan */}
          <Box
            sx={{
              flex: 1,
              minWidth: 220,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1,
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography variant="caption" fontWeight={600}>
                Nilai valid kolom <code>hubungan</code>
              </Typography>
            </Box>
            <Box sx={{ px: 2, py: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {HUBUNGAN_OPTIONS.map((h) => (
                <Chip key={h} label={h} size="small" variant="outlined" sx={{ fontSize: '0.72rem' }} />
              ))}
            </Box>
          </Box>

          {/* Referensi is_wali_utama */}
          <Box
            sx={{
              flex: 1,
              minWidth: 220,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
              <Typography variant="caption" fontWeight={600}>
                Nilai valid kolom <code>is_wali_utama</code>
              </Typography>
            </Box>
            <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 1 }}>
              <Chip label="ya" size="small" variant="outlined" color="success" sx={{ fontSize: '0.72rem' }} />
              <Chip label="tidak" size="small" variant="outlined" color="default" sx={{ fontSize: '0.72rem' }} />
            </Box>
          </Box>
        </Box>

        {/* Referensi nama siswa */}
        {!siswaLoadError && (
          <Box
            sx={{
              mt: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              onClick={() => setShowSiswa((v) => !v)}
              sx={{
                px: 2,
                py: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                bgcolor: 'action.hover',
              }}
            >
              <Typography variant="caption" fontWeight={600}>
                Referensi nama siswa untuk kolom <code>nama_siswa</code>{' '}
                {siswaList.length > 0 && (
                  <Typography component="span" variant="caption" color="text.secondary">
                    ({siswaList.length} siswa)
                  </Typography>
                )}
              </Typography>
              {showSiswa ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </Box>
            <Collapse in={showSiswa}>
              {siswaList.length === 0 ? (
                <Box sx={{ px: 2, py: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Belum ada data siswa. Import siswa terlebih dahulu sebelum import wali siswa.
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ maxHeight: 220 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Nama Siswa</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Kelas</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {siswaList.map((s) => (
                        <TableRow key={s.id} hover>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{s?.User?.name || '-'}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{s?.Kelas?.nama_kelas || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Collapse>
          </Box>
        )}
      </Box>

      {/* Step 2 — Upload File */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={1}>
          Langkah 2 — Upload File Excel
        </Typography>
        <Box
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          sx={{
            border: '2px dashed',
            borderColor: isDragging ? '#973BE0' : file ? 'success.main' : 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: file ? 'default' : 'pointer',
            bgcolor: isDragging ? 'action.hover' : 'transparent',
            transition: 'border-color 0.2s, background-color 0.2s',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
          {file ? (
            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
              <IconFileSpreadsheet size={22} color="#973BE0" />
              <Typography variant="body2" fontWeight={500}>{file.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                ({(file.size / 1024).toFixed(0)} KB)
              </Typography>
              <Box
                component="span"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setImportResult(null);
                  setError('');
                  setSuccess('');
                }}
                sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'error.main', ml: 0.5 }}
              >
                <IconX size={16} />
              </Box>
            </Box>
          ) : (
            <Box>
              <IconUpload size={32} color="#973BE0" style={{ marginBottom: 8 }} />
              <Typography variant="body2" color="text.secondary">
                Seret file ke sini atau <strong style={{ color: '#973BE0' }}>klik untuk memilih</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Format: .xlsx / .xls &nbsp;|&nbsp; Maks: 5 MB
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Import Result */}
      {importResult && (
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              mb: 2,
              bgcolor:
                importResult.gagal === 0
                  ? 'success.lighter'
                  : importResult.berhasil === 0
                  ? 'error.lighter'
                  : 'warning.lighter',
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              {importResult.gagal === 0
                ? `Semua ${importResult.berhasil} data wali siswa berhasil diimport`
                : importResult.berhasil === 0
                ? `Tidak ada data yang berhasil diimport (${importResult.gagal} gagal)`
                : `${importResult.berhasil} data berhasil, ${importResult.gagal} data gagal`}
            </Typography>
            {importResult.berhasil > 0 && (
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                Akun yang berhasil dibuat berstatus belum aktif — link aktivasi dikirim via WhatsApp.
              </Typography>
            )}
          </Box>

          {importResult.detail_gagal?.length > 0 && (
            <>
              <Typography variant="subtitle2" mb={1}>Detail Kegagalan:</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Baris</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Nama</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Alasan</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importResult.detail_gagal.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.baris}</TableCell>
                        <TableCell>{item.nama || '-'}</TableCell>
                        <TableCell>
                          {Array.isArray(item.alasan) ? item.alasan.join(', ') : item.alasan}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>
      )}

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        <Button
          variant="contained"
          startIcon={
            isImporting ? <CircularProgress size={14} color="inherit" /> : <IconUpload size={16} />
          }
          onClick={handleImport}
          disabled={isImporting || !file}
          sx={{
            textTransform: 'none',
            bgcolor: '#973BE0',
            '&:hover': { bgcolor: '#7d2dbd' },
            '&.Mui-disabled': { bgcolor: '#973BE0', opacity: 0.7, color: '#fff' },
          }}
        >
          {isImporting ? 'Mengimport...' : 'Import Data'}
        </Button>
        <CancelButton onClick={() => navigate(-1)}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default WaliSiswaImportForm;
