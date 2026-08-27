import Grid from '@mui/material/Grid';
import {
  Box,
  Typography,
  CircularProgress,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CancelButton from 'src/components/button-group/CancelButton';

// Katalog label FITUR_KEYS belum ada di response backend — ini fallback
// humanisasi tampilan saja (underscore -> spasi, title case), BUKAN nama
// resmi fitur. Kalau nanti ada field label/deskripsi dari server, pakai itu.
const humanizeFiturKey = (key = '') =>
  key
    .toLowerCase()
    .split('_')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');

const formatUpdatedAt = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  // Format lokal browser — bukan timezone_sekolah-aware seperti pola
  // resolveSekolahTZ di endpoint lain. Untuk timestamp toggle fitur ini
  // cukup, tapi sengaja dicatat karena timezone itu first-class concern
  // di project ini dan saya gak mau diam-diam beda pola tanpa alasan.
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

const FiturSekolahEditForm = ({
  meta,
  fiturList,
  onToggle,
  togglingKey,
  handleCancel,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="120px">
        <CircularProgress />
      </Box>
    );
  }

  const enabledKeys = new Set(fiturList.filter((f) => f.enabled).map((f) => f.fitur_key));

  // Dependent aktif dihitung dari data yang sama (dependencies tiap item),
  // dibalik jadi "siapa yang butuh key ini". Mencerminkan lapis 1 hard-block
  // di backend (getDependentsOf) — tujuannya supaya switch dinonaktifkan
  // DULU di UI sebelum user sempat kena 409, bukan gantiin validasi backend.
  const activeDependentsOf = (fiturKey) =>
    fiturList
      .filter((f) => f.enabled && (f.dependencies || []).includes(fiturKey))
      .map((f) => f.fitur_key);

  return (
    <Box sx={{ mt: -1 }}>
      <Grid container spacing={2} rowSpacing={1} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Nama Sekolah</CustomFormLabel>
          <Typography variant="body1" sx={{ pt: 1, fontWeight: 500 }}>
            {meta?.nama || '—'}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Bentuk Pendidikan</CustomFormLabel>
          <Typography variant="body1" sx={{ pt: 1, fontWeight: 500 }}>
            {meta?.bentuk_pendidikan_kode || '—'}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="h6" gutterBottom>Fitur Tambahan</Typography>

      {fiturList.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Tidak ada fitur tambahan yang tersedia untuk bentuk pendidikan sekolah ini.
        </Typography>
      ) : (
        <Box sx={{ mt: 2 }}>
          {fiturList.map((f, index) => {
            const isToggling = togglingKey === f.fitur_key;
            const deps = f.dependencies || [];
            const missingDeps = deps.filter((d) => !enabledKeys.has(d));
            const dependents = activeDependentsOf(f.fitur_key);

            // Aktivasi diblok kalau dependency belum aktif. Deaktivasi
            // diblok kalau ada fitur lain yang masih aktif dan butuh ini.
            const blockedReason = !f.enabled && missingDeps.length > 0
              ? `Butuh aktif dulu: ${missingDeps.map(humanizeFiturKey).join(', ')}`
              : f.enabled && dependents.length > 0
              ? `Nonaktifkan dulu: ${dependents.map(humanizeFiturKey).join(', ')}`
              : null;

            const updatedLabel = formatUpdatedAt(f.updated_at);

            return (
              <Box key={f.fitur_key}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {humanizeFiturKey(f.fitur_key)}
                    </Typography>
                    {blockedReason && (
                      <Typography variant="caption" color="text.secondary">
                        {blockedReason}
                      </Typography>
                    )}
                    {!blockedReason && isToggling && (
                      <Typography variant="caption" color="text.secondary">
                        Menyimpan...
                      </Typography>
                    )}
                    {!blockedReason && !isToggling && updatedLabel && (
                      <Typography variant="caption" color="text.secondary">
                        Terakhir diubah: {updatedLabel}
                      </Typography>
                    )}
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={f.enabled}
                        disabled={isToggling || Boolean(blockedReason)}
                        onChange={(e) => onToggle(f.fitur_key, e.target.checked)}
                      />
                    }
                    label=""
                    sx={{ m: 0 }}
                  />
                </Box>
                {index < fiturList.length - 1 && <Divider />}
              </Box>
            );
          })}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }}>
        <CancelButton onClick={handleCancel}>Kembali</CancelButton>
      </Box>
    </Box>
  );
};

export default FiturSekolahEditForm;