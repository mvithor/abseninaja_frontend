import PropTypes from 'prop-types';
import {
  Alert, Box, Chip, IconButton, MenuItem, Paper, Stack, Tooltip, Typography,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import KolomIsian from '../komponen/KolomIsian';
import {
  barisGalat, ringkasBerkas, statusBerkas,
} from './impor';

const STATUS = {
  siap: { label: 'Siap disimpan', color: 'success' },
  keputusan: { label: 'Perlu dipilih', color: 'warning' },
  galat: { label: 'Ada yang salah', color: 'error' },
  bentrok: { label: 'Kelas sudah ada', color: 'error' },
};
const MAKS_GALAT_TAMPIL = 10;
const MAKS_PERINGATAN_TAMPIL = 5;

/** Satu berkas: isian yang dapat diubah guru di atas, hasil pemeriksaan server di bawahnya. */
export default function KartuBerkasImpor({
  butir, laporan, placeholderMapel, terkunci, onUbah, onHapus,
}) {
  const status = laporan ? statusBerkas(laporan) : null;
  const proyek = laporan?.struktur?.proyek ?? [];
  const galat = laporan?.galat ?? [];
  const sisaGalat = Math.max(0, (laporan?.jumlah_galat ?? 0) - Math.min(galat.length, MAKS_GALAT_TAMPIL));
  const peringatan = laporan?.peringatan ?? [];

  const ubahJenis = (i, nilai) => onUbah({ jenis: butir.jenis.map((j, k) => (k === i ? nilai : j)) });
  const samakanSemua = (nilai) => onUbah({ jenis: butir.jenis.map(() => nilai) });

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography fontWeight={600} sx={{ wordBreak: 'break-all' }}>{butir.file.name}</Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          {status && <Chip size="small" color={STATUS[status].color} label={STATUS[status].label} />}
          <Tooltip title="Keluarkan dari daftar">
            <span>
              <IconButton size="small" onClick={onHapus} disabled={terkunci} aria-label={`Keluarkan ${butir.file.name}`}>
                <IconX size={18} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {laporan && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{ringkasBerkas(laporan.ringkasan)}</Typography>
      )}

      {galat.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Perbaiki di Excel lalu pilih berkas lagi. Tidak ada yang disimpan selama masih ada kesalahan.
          </Typography>
          <Stack component="ul" sx={{ m: 0, pl: 2 }}>
            {galat.slice(0, MAKS_GALAT_TAMPIL).map((g, i) => <li key={`${g.sel}-${i}`}>{barisGalat(g)}</li>)}
            {sisaGalat > 0 && <li>dan {sisaGalat} kesalahan lainnya</li>}
          </Stack>
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
        <KolomIsian
          id={`${butir.id}-nama-kelas`}
          label="Nama kelas"
          value={butir.nama_kelas}
          onChange={(e) => onUbah({ nama_kelas: e.target.value })}
          disabled={terkunci}
          bantuan={laporan ? 'Terbaca dari blanko; boleh diubah' : 'Dibaca dari blanko bila dikosongkan'}
          sx={{ flex: 1 }}
        />
        <KolomIsian
          id={`${butir.id}-mapel`}
          label="Mata pelajaran"
          value={butir.mapel}
          onChange={(e) => onUbah({ mapel: e.target.value })}
          disabled={terkunci}
          placeholder={laporan?.kelas?.mapel || placeholderMapel || ''}
          bantuan="Kosong berarti mengikuti isian untuk semua berkas"
          sx={{ flex: 1 }}
        />
      </Stack>

      {proyek.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Jenis proyek</Typography>
            <KolomIsian
              id={`${butir.id}-samakan`}
              pilih
              label="Samakan semua"
              value=""
              onChange={(e) => samakanSemua(e.target.value)}
              disabled={terkunci}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="" disabled>Pilih jenis</MenuItem>
              <MenuItem value="INDIVIDU">Semua individu</MenuItem>
              <MenuItem value="KELOMPOK">Semua kelompok</MenuItem>
            </KolomIsian>
          </Stack>
          <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 1 }}>
            Blanko tidak memuat jenis proyek, jadi jenisnya perlu ditentukan. Nama proyek diambil dari judul kolom di blanko.
          </Typography>
          <Stack spacing={1.5}>
            {proyek.map((p, i) => (
              <KolomIsian
                key={`${p.nama}-${i}`}
                id={`${butir.id}-jenis-${i}`}
                pilih
                label={`Proyek ${i + 1}: ${p.nama}`}
                value={butir.jenis[i] ?? ''}
                onChange={(e) => ubahJenis(i, e.target.value)}
                disabled={terkunci}
              >
                <MenuItem value="">Belum dipilih</MenuItem>
                <MenuItem value="INDIVIDU">Individu</MenuItem>
                <MenuItem value="KELOMPOK">Kelompok</MenuItem>
              </KolomIsian>
            ))}
          </Stack>
        </Box>
      )}

      {laporan && (laporan.perlu_keputusan?.length ?? 0) > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Stack component="ul" sx={{ m: 0, pl: 2 }}>
            {laporan.perlu_keputusan.map((k) => <li key={k.kolom}>{k.pesan}</li>)}
          </Stack>
        </Alert>
      )}

      {peringatan.length > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Stack component="ul" sx={{ m: 0, pl: 2 }}>
            {peringatan.slice(0, MAKS_PERINGATAN_TAMPIL).map((p, i) => <li key={i}>{p.pesan}</li>)}
            {peringatan.length > MAKS_PERINGATAN_TAMPIL && <li>dan {peringatan.length - MAKS_PERINGATAN_TAMPIL} catatan lainnya</li>}
          </Stack>
        </Alert>
      )}
    </Paper>
  );
}

KartuBerkasImpor.propTypes = {
  butir: PropTypes.object.isRequired,
  laporan: PropTypes.object,
  placeholderMapel: PropTypes.string,
  terkunci: PropTypes.bool,
  onUbah: PropTypes.func.isRequired,
  onHapus: PropTypes.func.isRequired,
};
