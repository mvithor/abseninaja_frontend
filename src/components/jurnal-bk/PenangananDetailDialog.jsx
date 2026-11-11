import PropTypes from 'prop-types';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography } from '@mui/material';
import { IconLock } from '@tabler/icons-react';
import { formatTanggalPanjang, formatTanggalPendek, statusPenangananMeta } from './jurnalConfig';
import { formatTanggalWaktu } from 'src/components/perangkat-ajar/perangkatAjarConfig';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import { BK_API, teksNis } from 'src/components/pemetaan-siswa/pemetaanConfig';
import AksesRahasiaPanel from './AksesRahasiaPanel';

const Bagian = ({ judul, children }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" color="text.secondary">{judul}</Typography>
    <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>{children || '-'}</Typography>
  </Box>
);

Bagian.propTypes = { judul: PropTypes.string.isRequired, children: PropTypes.node };

// `entri` dari daftar dipakai sebagai data awal; dialog mengambil versi terbaru dari server
// supaya perubahan izin baca (setujui/cabut) langsung terlihat tanpa menutup dialog.
const PenangananDetailDialog = ({ entri: entriAwal, timezone, onClose, onUbah }) => {
  const { data } = useQuery({
    queryKey: ['bk-jurnal-detail', entriAwal?.id],
    queryFn: async () => (await axiosInstance.get(`${BK_API}/jurnal/${entriAwal.id}`)).data?.data,
    enabled: !!entriAwal?.id,
    initialData: entriAwal || undefined,
  });
  const entri = entriAwal ? data || entriAwal : null;
  const status = statusPenangananMeta(entri?.status?.kode);

  return (
    <Dialog open={Boolean(entriAwal)} onClose={onClose} fullWidth maxWidth="sm">
      {entri && (
        <>
          <DialogTitle>
            {entri.judul}
            <Typography variant="body2" color="text.secondary">
              {formatTanggalPanjang(entri.tanggal)} · {entri.jam_mulai}{entri.jam_selesai ? `–${entri.jam_selesai}` : ''}
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              <Chip size="small" label={entri.jenis_layanan?.label} />
              <Chip size="small" variant="outlined" label={entri.kategori?.label} />
              <Chip size="small" color={status.color} label={status.label} />
              {entri.rahasia && <Chip size="small" variant="outlined" icon={<IconLock size={14} />} label="Rahasia" />}
            </Box>

            <Bagian judul="Siswa">
              {(entri.siswa || []).map((s) => `${s.nama} · ${s.kelas?.nama || '-'} · ${teksNis(s.nis)}`).join('\n')}
            </Bagian>

            {entri.terbatas && (
              <Alert severity="info" icon={<IconLock size={20} />} sx={{ mb: 2 }}>
                Catatan ini bersifat rahasia. Uraian, tindakan, dan hasil hanya dapat dibaca oleh {entri.bk?.nama}, atau
                koordinator BK yang sudah diberi izin olehnya.
              </Alert>
            )}
            <AksesRahasiaPanel entri={entri} timezone={timezone} />
            {!entri.terbatas && (
              <>
                <Bagian judul="Uraian / kronologi masalah">{entri.uraian}</Bagian>
                <Bagian judul="Tindakan / layanan yang diberikan">{entri.tindakan}</Bagian>
                <Bagian judul="Hasil">{entri.hasil}</Bagian>
              </>
            )}

            {entri.tindak_lanjut && (
              <Bagian judul={entri.status?.kode === 'dirujuk' ? 'Rujukan' : 'Rencana tindak lanjut'}>
                {[entri.tindak_lanjut.rencana, entri.tindak_lanjut.tanggal && `Tanggal: ${formatTanggalPendek(entri.tindak_lanjut.tanggal)}`]
                  .filter(Boolean)
                  .join('\n') || (entri.terbatas ? '(rahasia)' : '-')}
              </Bagian>
            )}

            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Dicatat oleh {entri.bk?.nama} · {formatTanggalWaktu(entri.dibuat_pada, timezone)}
              {entri.diubah_pada && ` · diubah ${formatTanggalWaktu(entri.diubah_pada, timezone)}`}
            </Typography>
          </DialogContent>
          <DialogActions>
            {entri.bisa_ubah && onUbah && <Button onClick={() => onUbah(entri)}>Ubah</Button>}
            <Button variant="contained" onClick={onClose}>Tutup</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

PenangananDetailDialog.propTypes = {
  entri: PropTypes.object,
  timezone: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onUbah: PropTypes.func,
};

export default PenangananDetailDialog;
