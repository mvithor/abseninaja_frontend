import { useCallback, useEffect, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Alerts from 'src/components/alerts/Alerts';
import usePesanAlert from 'src/hooks/usePesanAlert';
import SearchButton from 'src/components/button-group/SearchButton';
import DialogKonfirmasi from 'src/components/dialog/DialogKonfirmasi';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import PegawaiNonaktifTable from 'src/apps/admin-sekolah/pegawai-nonaktif/List/PegawaiNonaktifTable';
import { KUNCI, KUNCI_TERDAMPAK, URL_PEGAWAI, urlPegawai } from 'src/apps/pegawai-status/api';
import { pesanHasilNonaktif } from 'src/apps/pegawai-status/status';
import { pesanGalat } from 'src/apps/admin-sekolah/persona-penugasan/penugasan';
import { useSchoolTimezone } from 'src/hooks/useSchoolTimezone';
import useDebouncedValue from 'src/hooks/useDebouncedValue';
import axiosInstance from 'src/utils/axiosInstance';

const PegawaiNonaktifList = () => {
  const queryClient = useQueryClient();
  const timeZone = useSchoolTimezone();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [cari, setCari] = useState('');
  const q = useDebouncedValue(cari.trim(), 400);
  const [success, setSuccess, kunciSukses] = usePesanAlert();
  const [error, setError, kunciError] = usePesanAlert();
  const [target, setTarget] = useState(null);
  const [targetCabut, setTargetCabut] = useState(null);

  const params = { q: q || undefined, limit: rowsPerPage, offset: page * rowsPerPage };
  const { data, isLoading, isFetching, isError, error: queryError } = useQuery({
    queryKey: [KUNCI.nonaktif, params],
    queryFn: async () => (await axiosInstance.get(`${URL_PEGAWAI}/nonaktif`, { params })).data,
    placeholderData: keepPreviousData,
  });

  // Sesudah aktifkan/nonaktifkan, halaman terakhir bisa habis: mundur satu halaman, bukan menampilkan tabel kosong.
  useEffect(() => {
    if (page > 0 && data && !isFetching && data.data.length === 0) setPage((p) => Math.max(0, p - 1));
  }, [data, isFetching, page]);

  const aktifkan = useMutation({
    mutationFn: async (id) => (await axiosInstance.post(urlPegawai(id, 'aktifkan'))).data,
    onSuccess: (respons) => {
      KUNCI_TERDAMPAK.forEach((kunci) => queryClient.invalidateQueries({ queryKey: [kunci] }));
      setError('');
      setSuccess(respons.msg || 'Pegawai berhasil diaktifkan kembali.');
      setTarget(null);
    },
    onError: (err) => {
      setSuccess('');
      setError(pesanGalat(err, 'Terjadi kesalahan saat mengaktifkan pegawai.'));
      setTarget(null);
    },
  });

  // Mengulang Nonaktifkan pada pegawai yang sudah nonaktif tidak mengubah data; server hanya menjalankan ulang pencabutan
  // sesi dan pembersihan notifikasi. Dipakai bila peringatan "sesi belum berhasil dicabut" muncul saat menonaktifkan.
  const cabutSesi = useMutation({
    mutationFn: async (item) => (await axiosInstance.post(urlPegawai(item.id, 'nonaktifkan'), { alasan_kode: item.alasan_kode })).data,
    onSuccess: (respons) => {
      const hasil = pesanHasilNonaktif(respons);
      setSuccess(hasil.galat ? '' : 'Sesi login pegawai sudah dicabut.');
      setError(hasil.galat);
      setTargetCabut(null);
    },
    onError: (err) => {
      setSuccess('');
      setError(pesanGalat(err, 'Terjadi kesalahan saat mencabut sesi.'));
      setTargetCabut(null);
    },
  });

  const ubahHalaman = useCallback((_, baru) => setPage(baru), []);
  const ubahUkuran = useCallback((e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);

  return (
    <PageContainer title="Pegawai Nonaktif" description="Pegawai Nonaktif">
      <ParentCard title="Pegawai Nonaktif">
        <Alerts key={`${kunciError}-${kunciSukses}`} error={error} success={success} />
        <SearchButton
          value={cari}
          onChange={(e) => {
            setCari(e.target.value);
            setPage(0);
          }}
          placeholder="Cari Nama atau NIP"
        />
        <div style={{ height: 16 }} />
        <PegawaiNonaktifTable
          data={data?.data ?? []}
          total={data?.total ?? 0}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={ubahHalaman}
          handleChangeRowsPerPage={ubahUkuran}
          handleAktifkan={setTarget}
          handleCabutSesi={setTargetCabut}
          timeZone={timeZone}
          isLoading={isLoading}
          isError={isError}
          errorMessage={pesanGalat(queryError, 'Terjadi kesalahan saat memuat pegawai nonaktif.')}
        />
      </ParentCard>
      <DialogKonfirmasi
        buka={Boolean(target)}
        judul={`Aktifkan kembali ${target?.nama || 'pegawai'}?`}
        isi="Akun dapat masuk lagi. Tugas yang dulu dipegang tidak dikembalikan otomatis."
        tombol="Aktifkan"
        sibuk={aktifkan.isPending}
        onKonfirmasi={() => aktifkan.mutate(target.id)}
        onTutup={() => setTarget(null)}
      />
      <DialogKonfirmasi
        buka={Boolean(targetCabut)}
        judul={`Cabut sesi login ${targetCabut?.nama || 'pegawai'}?`}
        isi="Akun dikeluarkan dari semua perangkat dan notifikasinya dibersihkan lagi. Status nonaktif dan alasannya tidak berubah."
        tombol="Cabut Sesi"
        sibuk={cabutSesi.isPending}
        onKonfirmasi={() => cabutSesi.mutate(targetCabut)}
        onTutup={() => setTargetCabut(null)}
      />
    </PageContainer>
  );
};

export default PegawaiNonaktifList;
