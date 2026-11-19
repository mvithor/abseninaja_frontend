import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, MenuItem, Select } from '@mui/material';
import { IconPlus } from '@tabler/icons-react';
import Alerts from 'src/components/alerts/Alerts';
import AddButton from 'src/components/button-group/AddButton';
import SearchButton from 'src/components/button-group/SearchButton';
import PageContainer from 'src/components/container/PageContainer';
import DialogKonfirmasi from 'src/components/dialog/DialogKonfirmasi';
import ParentCard from 'src/components/shared/ParentCard';
import useDebouncedValue from 'src/hooks/useDebouncedValue';
import usePesanAlert from 'src/hooks/usePesanAlert';
import { ambilDaftarMenu, buatMenuKantin, hapusMenuKantin, ubahMenuKantin } from 'src/apps/admin-kantin/api';
import { KATEGORI_MENU, KUNCI_KANTIN, pesanGalatKantin } from 'src/apps/admin-kantin/kantin';
import MenuFormDialog from 'src/apps/admin-kantin/menu/MenuFormDialog';
import MenuTable from 'src/apps/admin-kantin/menu/MenuTable';

const MenuKantinPage = () => {
  const userId = useSelector((state) => state.user.userId);
  const { unitAktif = true } = useOutletContext() || {};
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [kategori, setKategori] = useState('');
  const qDebounced = useDebouncedValue(searchQuery, 300);

  const [success, setSuccess, kunciSukses] = usePesanAlert('');
  const [error, setError, kunciError] = usePesanAlert('');
  const [errorDialog, setErrorDialog] = useState('');
  const [dialogForm, setDialogForm] = useState({ buka: false, mode: 'buat', awal: null });
  const [targetHapus, setTargetHapus] = useState(null);

  const paramsQuery = {
    page: page + 1,
    limit: rowsPerPage,
    ...(qDebounced.trim() ? { q: qDebounced.trim() } : {}),
    ...(kategori ? { kategori } : {}),
  };

  const menuQuery = useQuery({
    queryKey: [KUNCI_KANTIN.menu, userId, paramsQuery],
    queryFn: () => ambilDaftarMenu(paramsQuery),
    placeholderData: keepPreviousData,
  });

  const simpanMutation = useMutation({
    mutationFn: (payload) =>
      dialogForm.mode === 'ubah' && dialogForm.awal
        ? ubahMenuKantin({ id: dialogForm.awal.id, payload })
        : buatMenuKantin(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN.menu, userId] });
      setErrorDialog('');
      setError('');
      setSuccess(res?.msg || 'Menu kantin berhasil disimpan.');
      setDialogForm({ buka: false, mode: 'buat', awal: null });
    },
    onError: (err) => {
      setErrorDialog(pesanGalatKantin(err, 'Gagal menyimpan menu kantin.'));
    },
  });

  const hapusMutation = useMutation({
    mutationFn: (id) => hapusMenuKantin(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN.menu, userId] });
      setError('');
      setSuccess(res?.msg || 'Menu kantin berhasil dihapus.');
      setTargetHapus(null);
    },
    onError: (err) => {
      setSuccess('');
      setError(pesanGalatKantin(err, 'Gagal menghapus menu kantin.'));
      setTargetHapus(null);
    },
  });

  const items = menuQuery.data?.items || [];
  const total = menuQuery.data?.pagination?.total ?? items.length;

  return (
    <PageContainer title="Katalog Menu Kantin" description="Kelola daftar menu makanan dan minuman kantin">
      <ParentCard title="Katalog Menu Kantin">
        <Alerts key={`${kunciSukses}-${kunciError}`} error={error} success={success} />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <SearchButton
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Cari nama menu..."
            />
            <Select
              size="small"
              displayEmpty
              value={kategori}
              onChange={(e) => {
                setKategori(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Semua Kategori</MenuItem>
              {KATEGORI_MENU.map((kat) => (
                <MenuItem key={kat.kode} value={kat.kode}>
                  {kat.label}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <AddButton
            icon={<IconPlus size={20} color="white" />}
            disabled={!unitAktif}
            onClick={() => {
              setErrorDialog('');
              setDialogForm({ buka: true, mode: 'buat', awal: null });
            }}
          >
            Tambah Menu
          </AddButton>
        </Box>

        <MenuTable
          items={items}
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onChangePage={(_, newPage) => setPage(newPage)}
          onChangeRowsPerPage={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          onEdit={(item) => {
            setErrorDialog('');
            setDialogForm({ buka: true, mode: 'ubah', awal: item });
          }}
          onHapus={(item) => setTargetHapus(item)}
          unitAktif={unitAktif}
          isLoading={menuQuery.isLoading}
          isError={menuQuery.isError}
          errorMessage={pesanGalatKantin(menuQuery.error, 'Gagal memuat daftar menu kantin.')}
        />
      </ParentCard>

      <MenuFormDialog
        buka={dialogForm.buka}
        mode={dialogForm.mode}
        awal={dialogForm.awal}
        sibuk={simpanMutation.isPending}
        errorServer={errorDialog}
        onSimpan={(payload) => simpanMutation.mutate(payload)}
        onTutup={() => setDialogForm({ buka: false, mode: 'buat', awal: null })}
      />

      <DialogKonfirmasi
        buka={Boolean(targetHapus)}
        judul={`Hapus menu ${targetHapus?.nama_menu || ''}?`}
        isi="Menu yang dihapus tidak akan muncul lagi di layar kasir POS. Riwayat transaksi sebelumnya tetap aman karena menyimpan snapshot harga dan nama menu."
        tombol="Hapus Menu"
        sibuk={hapusMutation.isPending}
        onKonfirmasi={() => hapusMutation.mutate(targetHapus.id)}
        onTutup={() => setTargetHapus(null)}
      />
    </PageContainer>
  );
};

export default MenuKantinPage;
