import Grid from '@mui/material/Grid';
import {
  Box,
  InputAdornment,
  CircularProgress,
  MenuItem,
  Chip,
  Link as MuiLink,
  Tooltip,
} from '@mui/material';
import { IconUser, IconIdBadge2, IconMail } from '@tabler/icons-react';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CancelButton from 'src/components/button-group/CancelButton';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';

// ===== Helpers Lampiran =====
const isPdfUrl = (url = '') => /\.pdf($|\?)/i.test(url);
const isCloudinaryImage = (url = '') =>
  /res\.cloudinary\.com\/[^/]+\/image\/upload\//i.test(url);
const toCloudinaryThumb = (
  url,
  opts = 'c_thumb,w_56,h_56,f_auto,q_auto'
) => (isCloudinaryImage(url) ? url.replace('/upload/', `/upload/${opts}/`) : url);

const STATUS_PERIZINAN_OPTIONS = [
  { value: 'Menunggu', label: 'Menunggu' },
  { value: 'Disetujui', label: 'Disetujui' },
  { value: 'Ditolak', label: 'Ditolak' },
];

const PerizinanPegawaiEditForm = ({
  perizinanData,
  handleChange,
  handleSubmit,
  handleCancel,
  isLoading,
}) => {
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
        {/* Identitas Pegawai (read-only) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="nama_pegawai" sx={{ mt: 3 }}>Nama Pegawai</CustomFormLabel>
          <CustomOutlinedInput
            id="nama_pegawai"
            name="nama_pegawai"
            value={perizinanData.nama_pegawai || ''}
            startAdornment={<InputAdornment position="start"><IconUser /></InputAdornment>}
            fullWidth
            readOnly
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="email_pegawai" sx={{ mt: 3 }}>Email Pegawai</CustomFormLabel>
          <CustomOutlinedInput
            id="email_pegawai"
            name="email_pegawai"
            value={perizinanData.email_pegawai || ''}
            startAdornment={<InputAdornment position="start"><IconMail /></InputAdornment>}
            fullWidth
            readOnly
          />
        </Grid>

        {/* Kategori (read-only) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="kategori" sx={{ mt: 1.85 }}>Kategori Pegawai</CustomFormLabel>
          <CustomOutlinedInput
            id="kategori"
            name="kategori"
            value={perizinanData.kategori || ''}
            startAdornment={<InputAdornment position="start"><IconIdBadge2 /></InputAdornment>}
            fullWidth
            readOnly
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="sub_kategori" sx={{ mt: 1.85 }}>Sub Kategori Pegawai</CustomFormLabel>
          <CustomOutlinedInput
            id="sub_kategori"
            name="sub_kategori"
            value={perizinanData.sub_kategori || ''}
            fullWidth
            readOnly
          />
        </Grid>

        {/* Jenis Izin (read-only) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="jenis_izin" sx={{ mt: 1.85 }}>Jenis Izin</CustomFormLabel>
          <CustomOutlinedInput
            id="jenis_izin"
            name="jenis_izin"
            value={perizinanData.jenis_izin || ''}
            fullWidth
            readOnly
          />
        </Grid>

        {/* Tanggal Izin (display string dari BE, sesuai format "dd-MM-yyyy s.d dd-MM-yyyy") */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="tanggal_izin" sx={{ mt: 1.85 }}>
            Tanggal Izin
          </CustomFormLabel>
          <CustomOutlinedInput
            id="tanggal_izin"
            name="tanggal_izin"
            value={perizinanData.tanggal_izin || '-'}
            fullWidth
            readOnly
          />
        </Grid>

        {/* Alasan (read-only) */}
        <Grid size={{ xs: 12, md: 12 }}>
          <CustomFormLabel htmlFor="alasan" sx={{ mt: 1.5 }}>Keterangan / Alasan</CustomFormLabel>
          <CustomOutlinedInput
            id="alasan"
            name="alasan"
            value={perizinanData.alasan || ''}
            fullWidth
            multiline
            minRows={3}
            readOnly
          />
        </Grid>

        {/* Lampiran (preview only) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="lampiran" sx={{ mt: 1.5 }}>Lampiran</CustomFormLabel>
          {perizinanData.lampiran ? (
            isPdfUrl(perizinanData.lampiran) ? (
              <Tooltip title="Lihat PDF">
                <MuiLink
                  href={perizinanData.lampiran}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="none"
                >
                  <Chip
                    icon={<PictureAsPdfIcon fontSize="small" />}
                    label="Lihat PDF"
                    variant="outlined"
                    sx={{ cursor: 'pointer' }}
                  />
                </MuiLink>
              </Tooltip>
            ) : (
              <Tooltip title="Lihat gambar">
                <MuiLink
                  href={perizinanData.lampiran}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="none"
                  sx={{ display: 'inline-flex' }}
                >
                  <img
                    src={toCloudinaryThumb(perizinanData.lampiran)}
                    alt="Lampiran"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 6,
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </MuiLink>
              </Tooltip>
            )
          ) : (
            <CustomOutlinedInput id="lampiran" value="-" readOnly fullWidth />
          )}
        </Grid>

        {/* ======= FIELD YANG BISA DIEDIT ADMIN ======= */}

        {/* Status (editable) */}
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

        {/* Catatan Admin (editable) */}
        <Grid size={{ xs: 12, md: 12 }}>
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
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }}>
        <SubmitButton type="submit">Simpan</SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default PerizinanPegawaiEditForm;
