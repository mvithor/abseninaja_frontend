import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Dialog, DialogActions, DialogContent, MenuItem, Typography } from '@mui/material';
import { IconPlus } from '@tabler/icons-react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Alerts from 'src/components/alerts/Alerts';
import AddButton from 'src/components/button-group/AddButton';
import SearchButton from 'src/components/button-group/SearchButton';
import SubmitButton from 'src/components/button-group/SubmitButton';
import DialogKonfirmasi from 'src/components/dialog/DialogKonfirmasi';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import KolomIsian from 'src/apps/guru-lad/komponen/KolomIsian';
import GuruMandiriTable from 'src/apps/super-admin/guru-mandiri/List/GuruMandiriTable';
import SandiAwalDialog from 'src/apps/super-admin/guru-mandiri/Dialog/SandiAwalDialog';
import DialogNonaktif from 'src/apps/pegawai-status/DialogNonaktif';
import { pesanHasilNonaktif } from 'src/apps/pegawai-status/status';
import {
  KUNCI_GURU_MANDIRI, OPSI_STATUS, URL_GURU_MANDIRI, ambilSandiAwal, bangunPayloadUbah, teksDialogAksi, validasiUbah,
} from 'src/apps/super-admin/guru-mandiri/guruMandiri';
import { pesanGalat } from 'src/apps/admin-sekolah/persona-penugasan/penugasan';
import useDebouncedValue from 'src/hooks/useDebouncedValue';
import axiosInstance from 'src/utils/axiosInstance';

const URL_TAMBAH = '/dashboard/super-admin/guru-mandiri/tambah';

const ambilDaftar = async (params) => (await axiosInstance.get(URL_GURU_MANDIRI, { params })).data;

const GuruMandiriList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [cari, setCari] = useState('');
  const [status, setStatus] = useState('');
  const q = useDebouncedValue(cari.trim(), 400);

  const [success, setSuccess] = useState(location.state?.pesan || '');
  const [error, setError] = useState('');
  // Satu dialog aktif pada satu waktu: { aksi: 'nonaktif'|'aktif'|'reset'|'ubah', guru }.
  const [dialog, setDialog] = useState(null);
  // Sandi awal hasil reset: hanya di state, hilang saat dialog ditutup.
  const [sandiReset, setSandiReset] = useState(null);

  // Pesan dari halaman Tambah ikut hilang bila halaman dimuat ulang (state navigasi dibersihkan).
  useEffect(() => {
    if (location.state?.pesan) navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const params = { q: q || undefined, status: status || undefined, limit: rowsPerPage, offset: page * rowsPerPage };
  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: [KUNCI_GURU_MANDIRI, params],
    queryFn: () => ambilDaftar(params),
    placeholderData: keepPreviousData,
  });

  const segarkan = () => queryClient.invalidateQueries({ queryKey: [KUNCI_GURU_MANDIRI] });
  const tampilkan = ({ sukses = '', galat = '' }) => {
    setSuccess(sukses);
    setError(galat);
  };

  const aksi = useMutation({
    mutationFn: async ({ jenis, id, badan }) => {
      const peta = { nonaktif: 'nonaktifkan', aktif: 'aktifkan', reset: 'reset-sandi' };
      if (jenis === 'ubah') return (await axiosInstance.put(`${URL_GURU_MANDIRI}/${id}`, badan)).data;
      return (await axiosInstance.post(`${URL_GURU_MANDIRI}/${id}/${peta[jenis]}`, badan)).data;
    },
    onSuccess: (respons, { jenis, guru }) => {
      segarkan();
      setDialog(null);
      if (jenis === 'reset') {
        setSandiReset({ nama: guru.nama, email: guru.email, sandi: ambilSandiAwal(respons) });
        // Sandi reset sudah berubah, tetapi sesi lama gagal dicabut: bukan sukses polos.
        tampilkan(respons.peringatan && respons.data?.sesi_gagal ? { galat: respons.peringatan } : { sukses: respons.msg });
      } else if (jenis === 'nonaktif') {
        tampilkan(pesanHasilNonaktif(respons));
      } else {
        tampilkan({ sukses: respons.msg });
      }
    },
    onError: (err) => {
      setDialog(null);
      tampilkan({ galat: pesanGalat(err, 'Terjadi kesalahan saat memproses permintaan.') });
    },
  });

  const bukaEdit = useCallback((guru) => setDialog({ aksi: 'ubah', guru }), []);
  const bukaReset = useCallback((guru) => setDialog({ aksi: 'reset', guru }), []);
  const bukaNonaktif = useCallback((guru) => setDialog({ aksi: 'nonaktif', guru }), []);
  const bukaAktif = useCallback((guru) => setDialog({ aksi: 'aktif', guru }), []);
  const ubahHalaman = useCallback((_, halamanBaru) => setPage(halamanBaru), []);
  const ubahUkuran = useCallback((e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);
  const tutup = () => setDialog(null);

  const guru = dialog?.guru;
  const teks = teksDialogAksi(dialog?.aksi, guru);

  return (
    <PageContainer title="Guru Mandiri" description="Guru Mandiri">
      <ParentCard title="Guru Mandiri">
        <Alerts error={error} success={success} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, width: '100%', mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <SearchButton
              value={cari}
              onChange={(e) => {
                setCari(e.target.value);
                setPage(0);
              }}
              placeholder="Cari nama, email, atau sekolah"
            />
            <CustomSelect
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              displayEmpty
              size="small"
              inputProps={{ 'aria-label': 'Filter status' }}
              sx={{ minWidth: 160, height: 40, borderRadius: '10px' }}
            >
              {OPSI_STATUS.map((o) => <MenuItem key={o.nilai || 'semua'} value={o.nilai}>{o.label}</MenuItem>)}
            </CustomSelect>
          </Box>
          <AddButton icon={<IconPlus size={20} color="white" />} onClick={() => navigate(URL_TAMBAH)}>
            Tambah Guru Mandiri
          </AddButton>
        </Box>
        <GuruMandiriTable
          data={data?.data ?? []}
          total={data?.total ?? 0}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={ubahHalaman}
          handleChangeRowsPerPage={ubahUkuran}
          handleEdit={bukaEdit}
          handleResetSandi={bukaReset}
          handleNonaktifkan={bukaNonaktif}
          handleAktifkan={bukaAktif}
          isLoading={isLoading}
          isError={isError}
          errorMessage={pesanGalat(queryError, 'Terjadi kesalahan saat memuat data guru mandiri.')}
        />
      </ParentCard>

      <DialogNonaktif
        buka={dialog?.aksi === 'nonaktif'}
        nama={guru?.nama}
        sibuk={aksi.isPending}
        onKonfirmasi={(badan) => aksi.mutate({ jenis: 'nonaktif', id: guru.pegawai_id, guru, badan })}
        onTutup={tutup}
      />
      <DialogKonfirmasi
        buka={dialog?.aksi === 'aktif' || dialog?.aksi === 'reset'}
        judul={teks.judul}
        isi={teks.isi}
        tombol={teks.tombol}
        sibuk={aksi.isPending}
        onKonfirmasi={() => aksi.mutate({ jenis: dialog.aksi, id: guru.pegawai_id, guru })}
        onTutup={tutup}
      />
      <DialogUbah
        buka={dialog?.aksi === 'ubah'}
        guru={guru}
        sibuk={aksi.isPending}
        onSimpan={(badan) => aksi.mutate({ jenis: 'ubah', id: guru.pegawai_id, guru, badan })}
        onTutup={tutup}
      />
      <SandiAwalDialog
        buka={Boolean(sandiReset)}
        judul="Sandi Awal Baru"
        nama={sandiReset?.nama}
        email={sandiReset?.email}
        sandi={sandiReset?.sandi || ''}
        onTutup={() => setSandiReset(null)}
      />
    </PageContainer>
  );
};

// Ubah data: hanya nama guru dan nama sekolah (email tidak bisa diubah; salah email berarti buat akun baru).
const DialogUbah = ({ buka, guru, sibuk, onSimpan, onTutup }) => {
  const [nama, setNama] = useState('');
  const [namaSekolah, setNamaSekolah] = useState('');
  const [galat, setGalat] = useState('');

  useEffect(() => {
    if (buka) {
      setNama(guru?.nama || '');
      setNamaSekolah(guru?.nama_sekolah || '');
      setGalat('');
    }
  }, [buka, guru]);

  const kirim = (e) => {
    e.preventDefault();
    const pesan = validasiUbah({ nama, namaSekolah });
    if (pesan) return setGalat(pesan);
    const badan = bangunPayloadUbah(guru, { nama, namaSekolah });
    if (Object.keys(badan).length === 0) return setGalat('Tidak ada perubahan untuk disimpan.');
    setGalat('');
    return onSimpan(badan);
  };

  return (
    <Dialog open={Boolean(buka)} onClose={sibuk ? undefined : onTutup} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={kirim} noValidate>
        <DialogContent>
          <Typography variant="h5" align="center" sx={{ mt: 2, mb: 2 }}>Ubah Data Guru Mandiri</Typography>
          <KolomIsian id="ubah-nama" label="Nama Guru" wajib value={nama} onChange={(e) => setNama(e.target.value)} galat={galat} />
          <KolomIsian
            id="ubah-sekolah" label="Nama Sekolah" wajib value={namaSekolah} onChange={(e) => setNamaSekolah(e.target.value)}
            bantuan={`Email ${guru?.email || ''} tidak bisa diubah.`} sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mb: 2, gap: 2 }}>
          <Button variant="outlined" color="secondary" onClick={onTutup} disabled={sibuk}>Batal</Button>
          <SubmitButton isLoading={sibuk}>Simpan</SubmitButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default GuruMandiriList;
