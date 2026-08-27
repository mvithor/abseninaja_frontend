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
} from '@mui/material';
import { IconDownload, IconUpload, IconFileSpreadsheet, IconX, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@mui/material';
import CancelButton from 'src/components/button-group/CancelButton';
import axiosInstance from 'src/utils/axiosInstance';

const ALLOWED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];
const MAX_SIZE = 5 * 1024 * 1024;

const SiswaImportForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showKelas, setShowKelas] = useState(false);

  const { data: kelasList = [] } = useQuery({
    queryKey: ['kelasReferensi'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/v1/admin-sekolah/kelas');
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
    const dropped = e.dataTransfer.files[0];
    handleFileSelect(dropped);
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const response = await axiosInstance.get('/api/v1/admin-sekolah/import/template/siswa', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_import_siswa.xlsx';
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
      const { data } = await axiosInstance.post('/api/v1/admin-sekolah/import/siswa', formData);
      setImportResult(data);
      if (data.gagal === 0) {
        setSuccess(data.msg || `Semua ${data.berhasil} data berhasil diimport`);
        setTimeout(() => navigate('/dashboard/admin-sekolah/siswa'), 3000);
      } else {
        setSuccess('');
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
            variant="contained"
            startIcon={isDownloading ? <CircularProgress size={14} color="inherit" /> : <IconDownload size={16} />}
            onClick={handleDownloadTemplate}
            disabled={isDownloading}
            sx={{ textTransform: 'none', bgcolor: '#973BE0', color: '#fff', '&:hover': { bgcolor: '#7d2dbd', color: '#fff' }, '&.Mui-disabled': { bgcolor: '#973BE0', opacity: 0.7, color: '#fff' } }}
          >
            {isDownloading ? 'Mengunduh...' : 'Download Template'}
          </Button>
        </Box>

        {/* Referensi nama kelas */}
        {kelasList.length > 0 && (
          <Box sx={{ mt: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
            <Box
              onClick={() => setShowKelas((v) => !v)}
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
                Referensi nama kelas yang valid untuk kolom <code>nama_kelas</code>
              </Typography>
              {showKelas ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </Box>
            <Collapse in={showKelas}>
              <Box sx={{ px: 2, py: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {kelasList.map((k) => (
                  <Chip
                    key={k.id}
                    label={k.nama_kelas}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.72rem' }}
                  />
                ))}
              </Box>
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
                onClick={(e) => { e.stopPropagation(); setFile(null); setImportResult(null); setError(''); setSuccess(''); }}
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
              bgcolor: importResult.gagal === 0
                ? 'success.lighter'
                : importResult.berhasil === 0
                ? 'error.lighter'
                : 'warning.lighter',
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              {importResult.gagal === 0
                ? `Semua ${importResult.berhasil} data berhasil diimport`
                : importResult.berhasil === 0
                ? `Tidak ada data yang berhasil diimport (${importResult.gagal} gagal)`
                : `${importResult.berhasil} data berhasil, ${importResult.gagal} data gagal`}
            </Typography>
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
                          {Array.isArray(item.alasan)
                            ? item.alasan.join(', ')
                            : item.alasan}
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
          startIcon={isImporting ? <CircularProgress size={14} color="inherit" /> : <IconUpload size={16} />}
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

export default SiswaImportForm;
