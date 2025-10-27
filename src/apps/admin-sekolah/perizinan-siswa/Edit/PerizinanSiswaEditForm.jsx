import Grid from '@mui/material/Grid';
import {
  Box,
  InputAdornment,
  CircularProgress,
  MenuItem,
  Link as MuiLink,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
} from '@mui/material';
import { IconUser, IconBuilding, IconPhone, IconCategory, IconCategory2, IconClock } from '@tabler/icons-react';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CancelButton from 'src/components/button-group/CancelButton';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import axiosInstance from 'src/utils/axiosInstance';

const isPdfHint = (url = '') => /\.pdf($|\?)/i.test(url);

const STATUS_PERIZINAN_OPTIONS = [
  { value: 'Menunggu', label: 'Menunggu' },
  { value: 'Disetujui', label: 'Disetujui' },
  { value: 'Ditolak', label: 'Ditolak' },
];

const getFileName = (url = '') => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/');
      const raw = parts[parts.length - 1] || '';
      return decodeURIComponent(raw);
    } catch {
      const parts = url.split('?')[0].split('/');
      return decodeURIComponent(parts[parts.length - 1] || '');
    }
  };
  

const PerizinanSiswaEditForm = ({
  perizinanData,
  handleChange,
  handleSubmit,
  handleCancel,
  isLoading,
  perizinanId,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const loadTimerRef = useRef(null);

  const [signedUrl, setSignedUrl] = useState('');
  const [signedContentType, setSignedContentType] = useState('');
  const [loadingSigned, setLoadingSigned] = useState(false);
  const [signedError, setSignedError] = useState('');

  const lampiranUrl = perizinanData?.lampiran || '';
  const isPdf = useMemo(() => {
    if (signedContentType) return signedContentType.toLowerCase().includes('pdf');
    return isPdfHint(lampiranUrl);
  }, [signedContentType, lampiranUrl]);

  const fetchSignedUrl = useCallback(async () => {
    if (!perizinanId) return;
    setLoadingSigned(true);
    setSignedError('');
    setSignedUrl('');
    setSignedContentType('');
    try {
      const resp = await axiosInstance.get(`/api/v1/admin-sekolah/perizinan-siswa/${perizinanId}/lampiran-url`);
      const payload = resp?.data?.data || resp?.data || {};
      const { url, content_type } = payload || {};
      if (!url) throw new Error('URL lampiran tidak tersedia');
      setSignedUrl(url);
      setSignedContentType(content_type || '');
    } catch (e) {
      setSignedError(e?.response?.data?.msg || e?.message || 'Gagal memuat lampiran');
    } finally {
      setLoadingSigned(false);
    }
  }, [perizinanId]);

  const handleOpenPreview = useCallback(async (e) => {
    e?.preventDefault?.();
    setPdfLoaded(false);
    setSignedError('');
    setPreviewOpen(true);
    await fetchSignedUrl();
  }, [fetchSignedUrl]);

  const handleClosePreview = useCallback(() => setPreviewOpen(false), []);

  useEffect(() => {
    if (previewOpen && isPdf) {
      loadTimerRef.current = setTimeout(() => {
        if (!pdfLoaded) setPdfLoaded(false);
      }, 4000);
    }
    return () => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    };
  }, [previewOpen, isPdf, pdfLoaded]);

  const handleIframeLoad = useCallback(() => {
    setPdfLoaded(true);
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="40px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -5 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="nama_siswa" sx={{ mt: 3 }}>Nama Siswa</CustomFormLabel>
          <CustomOutlinedInput
            id="nama_siswa"
            name="nama_siswa"
            value={perizinanData.nama_siswa || '-'}
            startAdornment={<InputAdornment position="start"><IconUser /></InputAdornment>}
            fullWidth
            readOnly
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="kelas" sx={{ mt: 3 }}>Kelas</CustomFormLabel>
          <CustomOutlinedInput
            id="kelas"
            name="kelas"
            value={perizinanData.kelas || '-'}
            startAdornment={<InputAdornment position="start"><IconBuilding /></InputAdornment>}
            fullWidth
            readOnly
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="nama_wali_utama" sx={{ mt: 3 }}>Nama Wali Siswa</CustomFormLabel>
          <CustomOutlinedInput
            id="nama_wali_utama"
            name="nama_wali_utama"
            value={perizinanData.nama_wali_utama || '-'}
            startAdornment={<InputAdornment position="start"><IconUser /></InputAdornment>}
            fullWidth
            readOnly
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="nomor_telepon_wali" sx={{ mt: 3 }}>Nomor Telepon Wali</CustomFormLabel>
          <CustomOutlinedInput
            id="nomor_telepon_wali"
            name="nomor_telepon_wali"
            value={perizinanData.nomor_telepon_wali || '-'}
            startAdornment={<InputAdornment position="start"><IconPhone /></InputAdornment>}
            fullWidth
            readOnly
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="jenis_izin" sx={{ mt: 3 }}>Jenis Izin</CustomFormLabel>
          <CustomOutlinedInput
            id="jenis_izin"
            name="jenis_izin"
            value={perizinanData.jenis_izin || '-'}
            startAdornment={<InputAdornment position="start"><IconCategory /></InputAdornment>}
            fullWidth
            readOnly
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="kategori_izin" sx={{ mt: 3 }}>Kategori Izin</CustomFormLabel>
          <CustomOutlinedInput
            id="kategori_izin"
            name="kategori_izin"
            value={perizinanData.kategori_izin || '-'}
            startAdornment={<InputAdornment position="start"><IconCategory2 /></InputAdornment>}
            fullWidth
            readOnly
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="tanggal_izin" sx={{ mt: 3 }}>Tanggal Izin</CustomFormLabel>
          <CustomOutlinedInput
            id="tanggal_izin"
            name="tanggal_izin"
            value={perizinanData.tanggal_izin || '-'}
            startAdornment={<InputAdornment position="start"><IconClock /></InputAdornment>}
            fullWidth
            readOnly
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="diajukan" sx={{ mt: 3 }}>Diajukan Tanggal</CustomFormLabel>
          <CustomOutlinedInput
            id="diajukan"
            name="diajukan"
            value={perizinanData.diajukan || '-'}
            startAdornment={<InputAdornment position="start"><IconClock /></InputAdornment>}
            fullWidth
            readOnly
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="alasan" sx={{ mt: 1.5 }}>Keterangan / Alasan</CustomFormLabel>
          <CustomOutlinedInput
            id="alasan"
            name="alasan"
            value={perizinanData.alasan || ''}
            fullWidth
            multiline
            minRows={2}
            readOnly
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="catatan_admin" sx={{ mt: 1.5 }}>Catatan Admin</CustomFormLabel>
          <CustomOutlinedInput
            id="catatan_admin"
            name="catatan_admin"
            value={perizinanData.catatan_admin || ''}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={2}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
        <CustomFormLabel htmlFor="lampiran" sx={{ mt: 1.5 }}>
            Lampiran
        </CustomFormLabel>
        <Box
            onClick={perizinanData.lampiran ? handleOpenPreview : undefined}
            sx={{
            cursor: perizinanData.lampiran ? 'pointer' : 'default',
            '&:hover .lampiran-field': {
                borderColor: (theme) =>
                perizinanData.lampiran ? theme.palette.primary.main : undefined,
            },
            }}
            role={perizinanData.lampiran ? 'button' : undefined}
            aria-label="Buka preview lampiran"
        >
            <CustomOutlinedInput
            id="lampiran"
            className="lampiran-field"
            value={
                perizinanData.lampiran
                ? (getFileName(perizinanData.lampiran) || (isPdf ? 'Lampiran.pdf' : 'Lampiran'))
                : '-'
            }
            readOnly
            fullWidth
            startAdornment={
                <InputAdornment position="start">
                {isPdf ? (
                    <PictureAsPdfIcon fontSize="small" />
                ) : (
                    <ImageOutlinedIcon fontSize="small" />
                )}
                </InputAdornment>
            }
            endAdornment={
                perizinanData.lampiran ? (
                <InputAdornment position="end" sx={{ mr: 0.5 }}>
                    <Typography
                    variant="body2"
                    sx={{
                        color: (t) => t.palette.primary.main,
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontWeight: 600,
                        userSelect: 'none',
                        '&:hover': { opacity: 0.9 },
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPreview(e);
                    }}
                    >
                    Preview
                    </Typography>
                </InputAdornment>
                ) : null
            }
            />
        </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="status" sx={{ mt: 1.85 }}>Status</CustomFormLabel>
          <CustomSelect
            id="status"
            name="status"
            value={perizinanData.status || ''}
            onChange={handleChange}
            fullWidth
            required
          >
            {STATUS_PERIZINAN_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }}>
        <SubmitButton type="submit">Simpan</SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        fullWidth
        maxWidth="md"
        aria-labelledby="preview-lampiran-title"
      >
        <DialogTitle id="preview-lampiran-title" sx={{ pr: 6 }}>
          Preview Lampiran
          <IconButton aria-label="close" onClick={handleClosePreview} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {loadingSigned ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : signedError ? (
            <Typography color="error" variant="body2">{signedError}</Typography>
          ) : !signedUrl ? (
            <Typography variant="body2">URL lampiran tidak tersedia</Typography>
          ) : isPdf ? (
            <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: 'background.default', borderRadius: 1, overflow: 'hidden' }}>
              <iframe
                title="Lampiran PDF"
                src={signedUrl}     
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                loading="lazy"
                onLoad={handleIframeLoad}
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.default' }}>
              <img
                src={signedUrl}         
                alt="Lampiran"
                style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', borderRadius: 8 }}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </Box>
          )}
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'right' }}>
            {signedUrl ? (
              <MuiLink href={signedUrl} target="_blank" rel="noopener noreferrer" underline="hover">
                Buka di tab baru
              </MuiLink>
            ) : (
              'URL lampiran tidak tersedia'
            )}
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PerizinanSiswaEditForm;
