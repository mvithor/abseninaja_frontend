import PropTypes from 'prop-types';
import { Box, Chip, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { IconClock, IconEdit, IconEye, IconLock, IconLockOpen, IconTrash, IconUser } from '@tabler/icons-react';
import { formatTanggalPendek, isTindakLanjutLewat, STATUS_AKSES, statusPenangananMeta } from './jurnalConfig';

// Satu catatan penanganan. Dipakai di Jurnal Harian (tampilSiswa) dan timeline Riwayat Siswa (tampilTanggal).
const PenangananItem = ({ entri, hariIni, tampilSiswa = true, tampilTanggal = false, onDetail, onUbah, onHapus }) => {
  const status = statusPenangananMeta(entri.status?.kode);
  const lewat = isTindakLanjutLewat(entri, hariIni);
  const statusAkses = entri.akses_koordinator?.status;
  // Penanda izin baca koordinator: dilihat penulis (diminta/dibagikan) atau koordinator (dengan izin).
  const chipAkses = entri.dibaca_dengan_izin
    ? { label: 'Dibaca dengan izin', color: 'success' }
    : entri.bisa_ubah && statusAkses === STATUS_AKSES.DIMINTA
      ? { label: 'Izin baca diminta', color: 'warning' }
      : entri.bisa_ubah && statusAkses === STATUS_AKSES.DISETUJUI
        ? { label: 'Dibagikan ke koordinator', color: 'info' }
        : !entri.bisa_ubah && statusAkses === STATUS_AKSES.DIMINTA
          ? { label: 'Menunggu izin', color: 'default' }
          : null;

  return (
    <Paper variant="outlined" sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      <Box sx={{ minWidth: 72, color: 'text.secondary' }}>
        {tampilTanggal && <Typography variant="subtitle2" color="text.primary">{formatTanggalPendek(entri.tanggal)}</Typography>}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconClock size={14} />
          <Typography variant="body2">{entri.jam_mulai}{entri.jam_selesai ? `–${entri.jam_selesai}` : ''}</Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75, mb: 0.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>{entri.judul}</Typography>
          {entri.rahasia && (
            <Tooltip title={entri.terbatas ? 'Catatan rahasia milik BK lain; isi tidak ditampilkan' : 'Catatan rahasia'}>
              <Chip size="small" icon={<IconLock size={14} />} label="Rahasia" variant="outlined" />
            </Tooltip>
          )}
          {chipAkses && <Chip size="small" icon={<IconLockOpen size={14} />} label={chipAkses.label} color={chipAkses.color} variant="outlined" />}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          <Chip size="small" label={entri.jenis_layanan?.label} />
          <Chip size="small" label={entri.kategori?.label} variant="outlined" />
          <Chip size="small" label={status.label} color={status.color} />
          {entri.tindak_lanjut?.tanggal && entri.status?.kode === 'tindak_lanjut' && (
            <Chip
              size="small"
              variant="outlined"
              color={lewat ? 'error' : 'warning'}
              label={`${lewat ? 'Terlewat' : 'Tindak lanjut'}: ${formatTanggalPendek(entri.tindak_lanjut.tanggal)}`}
            />
          )}
        </Box>

        {tampilSiswa && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {entri.siswa.map((s) => `${s.nama} (${s.kelas?.nama})`).join(', ')}
          </Typography>
        )}
        {entri.terbatas ? (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            Isi catatan rahasia hanya dapat dibaca penulisnya atau koordinator yang diberi izin.
          </Typography>
        ) : (
          entri.tindakan && (
            <Typography variant="body2" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              <strong>Tindakan:</strong> {entri.tindakan}
            </Typography>
          )
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, color: 'text.secondary' }}>
          <IconUser size={13} />
          <Typography variant="caption">{entri.bk?.nama}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexShrink: 0 }}>
        <Tooltip title="Lihat Detail">
          <IconButton size="small" onClick={() => onDetail(entri)}>
            <IconEye width={18} />
          </IconButton>
        </Tooltip>
        {entri.bisa_ubah && onUbah && (
          <Tooltip title="Ubah">
            <IconButton size="small" onClick={() => onUbah(entri)}>
              <IconEdit width={18} />
            </IconButton>
          </Tooltip>
        )}
        {entri.bisa_ubah && onHapus && (
          <Tooltip title="Hapus">
            <IconButton size="small" onClick={() => onHapus(entri)}>
              <IconTrash width={18} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Paper>
  );
};

PenangananItem.propTypes = {
  entri: PropTypes.object.isRequired,
  hariIni: PropTypes.string,
  tampilSiswa: PropTypes.bool,
  tampilTanggal: PropTypes.bool,
  onDetail: PropTypes.func.isRequired,
  onUbah: PropTypes.func,
  onHapus: PropTypes.func,
};

export default PenangananItem;
