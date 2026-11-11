import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Tooltip, Typography } from '@mui/material';
import { IconCalendarEvent, IconMapPin, IconNotebook, IconUser } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import { BK_API } from 'src/components/pemetaan-siswa/pemetaanConfig';
import { formatTanggalPanjang, hariIniDi } from 'src/components/jurnal-bk/jurnalConfig';
import { useSchoolTimezone } from 'src/hooks/useSchoolTimezone';
import { metaStatusJadwal } from 'src/components/jadwal-bk/jadwalConfig';
import { isKonflik, pesanGalat } from 'src/components/perangkat-ajar/perangkatAjarConfig';

const Info = ({ icon: Ikon, children }) => {
  const Icon = Ikon;
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
      <Icon size={18} style={{ marginTop: 2, flexShrink: 0 }} />
      <Typography variant="body2" component="div">{children}</Typography>
    </Box>
  );
};

Info.propTypes = { icon: PropTypes.elementType.isRequired, children: PropTypes.node };

const JadwalDetailDialog = ({ jadwal, onClose, onUbah, onPesan, onLihatCatatan }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modeBatal, setModeBatal] = useState(false);
  const [alasan, setAlasan] = useState('');
  const [error, setError] = useState('');
  // Catatan jurnal tidak boleh bertanggal masa depan (server: 422), jadi hasil sesi baru bisa
  // dicatat pada hari pelaksanaan atau sesudahnya, menurut tanggal di zona sekolah.
  const hariIni = hariIniDi(useSchoolTimezone());

  const mutation = useMutation({
    mutationFn: async (payload) => (await axiosInstance.patch(`${BK_API}/jadwal/${jadwal.id}`, payload)).data,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['bk-jadwal'] });
      onPesan(res?.msg || 'Jadwal diperbarui');
      onClose();
    },
    onError: (err) => {
      if (isKonflik(err)) queryClient.invalidateQueries({ queryKey: ['bk-jadwal'] });
      setError(pesanGalat(err, 'Gagal memperbarui jadwal'));
    },
  });

  if (!jadwal) return null;
  const status = metaStatusJadwal(jadwal.status?.kode);
  const terjadwal = jadwal.status?.kode === 'terjadwal';

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {jadwal.topik}
        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
          <Chip size="small" label={status.label} color={status.color} />
          <Chip size="small" variant="outlined" label={jadwal.jenis_layanan?.label} />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Info icon={IconCalendarEvent}>
          {formatTanggalPanjang(jadwal.tanggal)}, {jadwal.jam_mulai}–{jadwal.jam_selesai}
        </Info>
        <Info icon={IconMapPin}>{jadwal.lokasi || '-'}</Info>
        <Info icon={IconUser}>
          {jadwal.siswa.map((s) => `${s.nama} (${s.kelas?.nama})`).join(', ')}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>BK: {jadwal.bk?.nama}</Typography>
        </Info>
        {jadwal.catatan && (
          <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}><strong>Catatan persiapan:</strong> {jadwal.catatan}</Typography>
        )}
        {jadwal.alasan_batal && (
          <Typography variant="body2" sx={{ mt: 1 }}><strong>Alasan dibatalkan:</strong> {jadwal.alasan_batal}</Typography>
        )}
        {jadwal.jurnal_id && (
          <Alert
            severity="success"
            icon={<IconNotebook size={20} />}
            sx={{ mt: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => onLihatCatatan(jadwal.jurnal_id)}>
                Lihat catatan
              </Button>
            }
          >
            Hasil sesi sudah dicatat di jurnal.
          </Alert>
        )}
        {!jadwal.bisa_ubah && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Jadwal milik {jadwal.bk?.nama}; hanya pemilik yang dapat mengubahnya.
          </Typography>
        )}

        {modeBatal && (
          <Box sx={{ mt: 2 }}>
            <CustomOutlinedInput
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Alasan pembatalan, mis. siswa mengikuti lomba"
              fullWidth
              multiline
              minRows={2}
            />
          </Box>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
        {jadwal.bisa_ubah && terjadwal && !modeBatal && (
          <>
            <Button color="inherit" onClick={() => setModeBatal(true)}>Batalkan sesi</Button>
            <Button color="error" disabled={mutation.isPending} onClick={() => mutation.mutate({ status: 'tidak_hadir' })}>
              Siswa tidak hadir
            </Button>
            <Button onClick={() => onUbah(jadwal)}>Ubah jadwal</Button>
            {jadwal.tanggal <= hariIni ? (
              <Button
                variant="contained"
                startIcon={<IconNotebook size={16} />}
                onClick={() => navigate(`/dashboard/guru-bk/jurnal/tambah?jadwal=${jadwal.id}`)}
              >
                Catat hasil
              </Button>
            ) : (
              <Tooltip title="Hasil sesi bisa dicatat mulai hari pelaksanaan">
                <span>
                  <Button variant="contained" startIcon={<IconNotebook size={16} />} disabled>
                    Catat hasil
                  </Button>
                </span>
              </Tooltip>
            )}
          </>
        )}
        {modeBatal && (
          <>
            <Button onClick={() => setModeBatal(false)}>Kembali</Button>
            <Button
              variant="contained"
              color="inherit"
              disabled={alasan.trim().length < 5 || mutation.isPending}
              onClick={() => mutation.mutate({ status: 'dibatalkan', alasan_batal: alasan.trim() })}
            >
              Konfirmasi batal
            </Button>
          </>
        )}
        {jadwal.bisa_ubah && ['dibatalkan', 'tidak_hadir'].includes(jadwal.status?.kode) && (
          <Button disabled={mutation.isPending} onClick={() => mutation.mutate({ status: 'terjadwal' })}>
            Aktifkan kembali
          </Button>
        )}
        {!modeBatal && <Button onClick={onClose}>Tutup</Button>}
      </DialogActions>
    </Dialog>
  );
};

JadwalDetailDialog.propTypes = {
  jadwal: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onUbah: PropTypes.func.isRequired,
  onPesan: PropTypes.func.isRequired,
  onLihatCatatan: PropTypes.func.isRequired,
};

export default JadwalDetailDialog;
