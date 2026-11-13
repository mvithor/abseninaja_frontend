import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { IconDownload, IconHistory, IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import PerhatianChips from 'src/components/pemetaan-siswa/PerhatianChips';
import ExportProfilBkDialog from 'src/components/pemetaan-siswa/ExportProfilBkDialog';
import { BK_API, DIMENSI, isBelumDiisi, labelJenisKelamin, teksNis } from 'src/components/pemetaan-siswa/pemetaanConfig';

const Baris = ({ label, children }) => (
  <Box sx={{ display: 'flex', gap: 2, py: 0.5 }}>
    <Typography variant="body2" color="text.secondary" sx={{ width: 150, flexShrink: 0 }}>{label}</Typography>
    <Typography variant="body2" component="div" sx={{ fontWeight: 500 }}>{children ?? '-'}</Typography>
  </Box>
);

Baris.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node };

// Isi tiap dimensi pada profil lengkap siswa.
const ISI_DIMENSI = {
  ekonomi: (d) => (
    <>
      <Baris label="Penghasilan ortu">{d.label}</Baris>
      <Baris label="Pekerjaan ayah">{d.pekerjaan_ayah}</Baris>
      <Baris label="Pekerjaan ibu">{d.pekerjaan_ibu}</Baris>
      <Baris label="Jumlah tanggungan">{d.tanggungan ? `${d.tanggungan} orang` : null}</Baris>
      <Baris label="Bantuan sosial">{d.bantuan?.length ? d.bantuan.join(', ') : isBelumDiisi(d) ? null : 'Tidak ada'}</Baris>
    </>
  ),
  geografis: (d) => (
    <>
      <Baris label="Alamat">{[d.desa, d.kecamatan && `Kec. ${d.kecamatan}`].filter(Boolean).join(', ') || null}</Baris>
      <Baris label="Jarak ke sekolah">{d.jarak_km != null ? `${d.jarak_km} km (${d.label})` : d.label}</Baris>
      <Baris label="Waktu tempuh">{d.waktu_tempuh_menit ? `± ${d.waktu_tempuh_menit} menit` : null}</Baris>
    </>
  ),
  kesehatan: (d) => (
    <>
      <Baris label="Status">{d.label}</Baris>
      <Baris label="Kondisi">{d.kondisi?.length ? d.kondisi.join(', ') : isBelumDiisi(d) ? null : 'Tidak ada'}</Baris>
      <Baris label="Alergi">{d.alergi || (isBelumDiisi(d) ? null : 'Tidak ada')}</Baris>
      <Baris label="Golongan darah">{d.golongan_darah}</Baris>
    </>
  ),
  kendaraan: (d) => (
    <>
      <Baris label="Moda ke sekolah">{d.label}</Baris>
      <Baris label="Punya SIM">{d.punya_sim == null ? null : d.punya_sim ? 'Ya' : 'Tidak'}</Baris>
    </>
  ),
  ekskul: (d) => (
    <Baris label="Ekskul diikuti">
      {d.daftar?.length ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {d.daftar.map((e) => <Chip key={e} label={e} size="small" />)}
        </Box>
      ) : (
        'Tidak mengikuti ekskul'
      )}
    </Baris>
  ),
};

// Profil pemetaan lengkap satu siswa. Data rinci (pekerjaan ortu, alamat, kesehatan) hanya
// diambil saat drawer dibuka, tidak ikut di daftar, karena sifatnya sensitif.
const DetailSiswaDrawer = ({ siswa, onClose, sembunyikanRiwayat = false }) => {
  const navigate = useNavigate();
  const [unduh, setUnduh] = useState(null);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bk-pemetaan-siswa-detail', siswa?.id],
    queryFn: async () => {
      const res = await axiosInstance.get(`${BK_API}/pemetaan/siswa/${siswa.id}`);
      return res.data?.data;
    },
    enabled: !!siswa?.id,
  });

  return (
    <Drawer anchor="right" open={Boolean(siswa)} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', p: 3, pb: 2 }}>
        <Box>
          <Typography variant="h5">{siswa?.nama}</Typography>
          <Typography variant="body2" color="text.secondary">
            {teksNis(siswa?.nis)} · {siswa?.kelas?.nama || '-'} · {labelJenisKelamin(siswa?.jenis_kelamin)}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <IconX size={18} />
        </IconButton>
      </Box>
      <Divider />

      <Box sx={{ display: 'flex', gap: 1, px: 3, py: 1.5 }}>
        {!sembunyikanRiwayat && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<IconHistory size={16} />}
            onClick={() => navigate(`/dashboard/guru-bk/riwayat-siswa/${siswa?.id}`)}
            disabled={!siswa}
            sx={{ textTransform: 'none' }}
          >
            Riwayat Permasalahan
          </Button>
        )}
        <Button
          size="small"
          variant="outlined"
          startIcon={<IconDownload size={16} />}
          onClick={() => setUnduh(siswa)}
          disabled={!siswa}
          sx={{ textTransform: 'none' }}
        >
          Unduh Profil
        </Button>
      </Box>
      <Divider />

      <Box sx={{ p: 3, overflowY: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">{error?.response?.data?.msg || 'Profil siswa gagal dimuat.'}</Alert>
        ) : data ? (
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Faktor perlu perhatian ({data.perhatian?.length || 0})
              </Typography>
              {data.perhatian?.length ? (
                <PerhatianChips perhatian={data.perhatian} />
              ) : (
                <Typography variant="body2" color="text.secondary">Tidak ada faktor yang perlu perhatian khusus.</Typography>
              )}
            </Box>

            {DIMENSI.map((d) => {
              const Icon = d.icon;
              const perhatian = data.perhatian?.some((p) => p.dimensi === d.kode);
              return (
                <Box key={d.kode}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Icon size={18} />
                    <Typography variant="subtitle1" fontWeight={600}>{d.label}</Typography>
                    {perhatian && <Chip label="Perlu perhatian" color="warning" size="small" variant="outlined" />}
                  </Box>
                  {data[d.kode] ? ISI_DIMENSI[d.kode](data[d.kode]) : <Typography variant="body2">-</Typography>}
                </Box>
              );
            })}
          </Stack>
        ) : null}
      </Box>
      <ExportProfilBkDialog key={unduh?.id} siswa={unduh} onClose={() => setUnduh(null)} />
    </Drawer>
  );
};

DetailSiswaDrawer.propTypes = {
  siswa: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  sembunyikanRiwayat: PropTypes.bool,
};

export default DetailSiswaDrawer;
