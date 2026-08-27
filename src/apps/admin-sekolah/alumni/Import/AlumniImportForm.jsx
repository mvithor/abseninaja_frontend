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
  Alert,
  Button,
  Divider,
} from '@mui/material';
import {
  IconDownload,
  IconUpload,
  IconFileSpreadsheet,
  IconX,
  IconAlertCircle,
  IconTable,
} from '@tabler/icons-react';
import CancelButton from 'src/components/button-group/CancelButton';
import axiosInstance from 'src/utils/axiosInstance';

const ALLOWED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];
const MAX_SIZE = 10 * 1024 * 1024;

const SHEET_SISWA_COLS = [
  { key: 'nama', desc: 'Nama lengkap siswa' },
  { key: 'nis', desc: 'Nomor Induk Siswa' },
  { key: 'nisn', desc: 'Nomor Induk Siswa Nasional (opsional)' },
  { key: 'jenis_kelamin', desc: 'laki-laki / perempuan' },
  { key: 'tempat_lahir', desc: 'Kota tempat lahir' },
  { key: 'tanggal_lahir', desc: 'Format: YYYY-MM-DD' },
  { key: 'alamat', desc: 'Alamat lengkap' },
  { key: 'kelas_terakhir', desc: 'Nama kelas, misal: X IPA 1' },
  { key: 'tahun_lulus', desc: 'Contoh: 2024' },
];

const SHEET_WALI_COLS = [
  { key: 'nis_siswa', desc: 'NIS siswa pemilik wali (referensi ke Sheet Siswa)' },
  { key: 'nama_wali', desc: 'Nama lengkap wali' },
  { key: 'hubungan', desc: 'Ayah / Ibu / Kakak / Paman / Bibi / wali_lainnya' },
  { key: 'nomor_telepon', desc: 'No. telepon aktif' },
  { key: 'email', desc: 'Email wali (opsional)' },
  { key: 'is_wali_utama', desc: 'ya / tidak' },
  { key: 'pekerjaan', desc: 'Pekerjaan wali (opsional)' },
  { key: 'alamat', desc: 'Alamat wali (opsional)' },
];

const ColTable = ({ cols }) => (
  <TableContainer sx={{ maxHeight: 220 }}>
    <Table size="small" stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', width: 160 }}>Kolom</TableCell>
          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Keterangan</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {cols.map((c) => (
          <TableRow key={c.key} hover>
            <TableCell sx={{ fontSize: '0.75rem' }}>
              <code>{c.key}</code>
            </TableCell>
            <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{c.desc}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const AlumniImportForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const validateFile = (selectedFile) => {
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('File harus berformat .xlsx atau .xls');
      return false;
    }
    if (selectedFile.size > MAX_SIZE) {
      setError('Ukuran file maksimal 10 MB');
      return false;
    }
    return true;
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    setError('');
    setImportResult(null);
    if (validateFile(selectedFile)) setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const response = await axiosInstance.get('/api/v1/admin-sekolah/alumni/template', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_import_alumni.xlsx';
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
      const { data } = await axiosInstance.post('/api/v1/admin-sekolah/alumni/import', formData);
      setImportResult(data);
      if (data.gagal === 0) {
        setSuccess(data.msg || `Semua ${data.berhasil} data alumni berhasil diimport`);
        setTimeout(() => navigate('/dashboard/admin-sekolah/alumni'), 3000);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.msg;
      if (status === 400) setError(msg || 'File tidak valid atau format salah');
      else if (status === 413) setError('Ukuran file terlalu besar');
      else setError(msg || 'Terjadi kesalahan saat mengimport data');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Box sx={{ mt: -2 }}>
      <Alert
        severity="info"
        icon={<IconAlertCircle size={18} />}
        sx={{ mb: 3, fontSize: '0.82rem' }}
      >
        File Excel harus memiliki <strong>2 sheet</strong>:{' '}
        <strong>Sheet 1 — &quot;Siswa&quot;</strong> berisi data siswa, dan{' '}
        <strong>Sheet 2 — &quot;Wali Siswa&quot;</strong> berisi data orang tua / wali.
        Kolom <code>nis_siswa</code> di Sheet Wali Siswa digunakan sebagai penghubung ke data siswa.
        Gunakan file yang diekspor dari halaman ini atau download template di bawah.
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
              Format yang diterima: .xlsx / .xls &nbsp;|&nbsp; Maks: 10 MB
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={isDownloading ? <CircularProgress size={14} color="inherit" /> : <IconDownload size={16} />}
            onClick={handleDownloadTemplate}
            disabled={isDownloading}
            sx={{
              textTransform: 'none',
              bgcolor: '#973BE0',
              color: '#fff',
              '&:hover': { bgcolor: '#7d2dbd', color: '#fff' },
              '&.Mui-disabled': { bgcolor: '#973BE0', opacity: 0.7, color: '#fff' },
            }}
          >
            {isDownloading ? 'Mengunduh...' : 'Download Template'}
          </Button>
        </Box>

        {/* Info format sheet */}
        <Box sx={{ mt: 1.5, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Sheet Siswa */}
          <Box
            sx={{
              flex: 1,
              minWidth: 280,
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
              <IconTable size={14} />
              <Typography variant="caption" fontWeight={700}>
                Sheet 1 — <code>Siswa</code>
              </Typography>
              <Chip label="wajib" size="small" color="error" sx={{ height: 18, fontSize: '0.65rem', ml: 'auto' }} />
            </Box>
            <ColTable cols={SHEET_SISWA_COLS} />
          </Box>

          {/* Sheet Wali Siswa */}
          <Box
            sx={{
              flex: 1,
              minWidth: 280,
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
              <IconTable size={14} />
              <Typography variant="caption" fontWeight={700}>
                Sheet 2 — <code>Wali Siswa</code>
              </Typography>
              <Chip label="opsional" size="small" color="default" sx={{ height: 18, fontSize: '0.65rem', ml: 'auto' }} />
            </Box>
            <ColTable cols={SHEET_WALI_COLS} />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

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
                Format: .xlsx / .xls &nbsp;|&nbsp; Maks: 10 MB
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
                ? `Semua ${importResult.berhasil} alumni berhasil diimport`
                : importResult.berhasil === 0
                ? `Tidak ada data yang berhasil diimport (${importResult.gagal} gagal)`
                : `${importResult.berhasil} berhasil, ${importResult.gagal} gagal`}
            </Typography>
          </Box>

          {importResult.detail_gagal?.length > 0 && (
            <>
              <Typography variant="subtitle2" mb={1}>Detail Kegagalan:</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Sheet</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Baris</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Nama</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Alasan</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importResult.detail_gagal.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.sheet || '-'}</TableCell>
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
        <CancelButton onClick={() => navigate('/dashboard/admin-sekolah/alumni')}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default AlumniImportForm;
