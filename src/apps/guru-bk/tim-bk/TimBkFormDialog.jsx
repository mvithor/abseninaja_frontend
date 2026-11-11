import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { BK_API } from 'src/components/pemetaan-siswa/pemetaanConfig';
import { isKonflik, pesanGalat } from 'src/components/perangkat-ajar/perangkatAjarConfig';

const fetchKelas = async () => {
  const res = await axiosInstance.get(`${BK_API}/referensi/kelas`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const fetchKandidat = async () => {
  const res = await axiosInstance.get(`${BK_API}/tim/kandidat`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

// Mode tambah (anggota = null): pilih pegawai + kelas. Mode atur (anggota terisi): ubah kelas saja.
// Satu kelas hanya dipegang satu BK aktif; kelas milik BK lain ditampilkan tapi tidak bisa dipilih.
const TimBkFormDialog = ({ anggota, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const isTambah = !anggota;
  const [pegawai, setPegawai] = useState(null);
  const [kelasIds, setKelasIds] = useState(() => (anggota?.kelas || []).map((k) => k.id));
  const [error, setError] = useState('');

  const { data: kelasOptions = [], isLoading: isKelasLoading } = useQuery({ queryKey: ['bk-referensi-kelas'], queryFn: fetchKelas });
  const { data: kandidat = [], isLoading: isKandidatLoading } = useQuery({
    queryKey: ['bk-tim-kandidat'],
    queryFn: fetchKandidat,
    enabled: isTambah,
  });

  const dipegangLain = (kelas) => kelas.bk && kelas.bk.id !== anggota?.id;
  const kelasTerpilih = useMemo(() => kelasOptions.filter((k) => kelasIds.includes(k.id)), [kelasOptions, kelasIds]);
  const jumlahSiswa = kelasTerpilih.reduce((n, k) => n + (k.jumlah_siswa || 0), 0);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = isTambah
        ? await axiosInstance.post(`${BK_API}/tim`, { pegawai_id: pegawai.id, kelas_ids: kelasIds })
        : await axiosInstance.patch(`${BK_API}/tim/${anggota.id}`, { kelas_ids: kelasIds });
      return res.data;
    },
    onSuccess: (data) => {
      ['bk-tim', 'bk-referensi-kelas', 'bk-tim-kandidat', 'bk-konteks', 'bk-pemetaan-ringkasan', 'bk-pemetaan-siswa'].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
      onSuccess(data?.msg || 'Tim BK diperbarui');
    },
    onError: (err) => {
      // 409 kelas bentrok: pemegang kelas mungkin baru berubah; segarkan daftar pilihan kelas.
      if (isKonflik(err)) ['bk-tim', 'bk-referensi-kelas'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      setError(pesanGalat(err, 'Terjadi kesalahan saat menyimpan'));
    },
  });

  const handleSimpan = () => {
    if (isTambah && !pegawai) {
      setError('Pilih pegawai yang akan ditambahkan');
      return;
    }
    setError('');
    mutation.mutate();
  };

  const handleClose = () => {
    if (!mutation.isPending) onClose();
  };

  return (
    <Dialog open onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isTambah ? 'Tambah Anggota Tim BK' : 'Atur Kelas Tanggung Jawab'}
        {!isTambah && <Typography variant="body2" color="text.secondary">{anggota.pegawai?.nama}</Typography>}
      </DialogTitle>
      <DialogContent dividers>
        {isTambah && (
          <>
            <CustomFormLabel htmlFor="pegawai" sx={{ mt: 0 }}>Pegawai</CustomFormLabel>
            <Autocomplete
              id="pegawai"
              options={kandidat}
              loading={isKandidatLoading}
              value={pegawai}
              onChange={(_e, v) => setPegawai(v)}
              getOptionLabel={(o) => `${o.nama} · ${o.nip}`}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              noOptionsText="Semua pegawai sudah terdaftar di Tim BK"
              renderInput={(params) => <TextField {...params} placeholder="Cari nama / NIP pegawai" />}
            />
            <Typography variant="caption" color="text.secondary">
              Pegawai yang ditambahkan mendapat akses portal Guru BK.
            </Typography>
          </>
        )}

        <CustomFormLabel htmlFor="kelas">Kelas tanggung jawab</CustomFormLabel>
        <Autocomplete
          id="kelas"
          multiple
          disableCloseOnSelect
          options={kelasOptions}
          loading={isKelasLoading}
          value={kelasTerpilih}
          onChange={(_e, v) => setKelasIds(v.map((k) => k.id))}
          getOptionLabel={(o) => o.nama}
          getOptionDisabled={dipegangLain}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          groupBy={(o) => `Kelas ${o.tingkat}`}
          renderOption={(props, option, { selected }) => {
            const { key, ...rest } = props;
            return (
              <li key={key} {...rest}>
                <Checkbox size="small" checked={selected} sx={{ mr: 1 }} />
                <Box sx={{ flex: 1 }}>
                  {option.nama}
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>{option.jumlah_siswa} siswa</Typography>
                </Box>
                {dipegangLain(option) && <Typography variant="caption" color="text.secondary">dipegang {option.bk.nama}</Typography>}
              </li>
            );
          }}
          renderInput={(params) => <TextField {...params} placeholder={kelasTerpilih.length ? '' : 'Pilih kelas'} />}
        />
        <Typography variant="caption" color="text.secondary">
          {kelasTerpilih.length} kelas · {jumlahSiswa} siswa binaan. Kelas yang sudah dipegang BK lain harus dilepas dulu dari BK tersebut.
        </Typography>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={mutation.isPending}>Batal</Button>
        <Button variant="contained" onClick={handleSimpan} disabled={mutation.isPending}>
          {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

TimBkFormDialog.propTypes = {
  anggota: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default TimBkFormDialog;
