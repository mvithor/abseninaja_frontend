import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CardActionArea,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  IconLock,
  IconMinus,
  IconPlus,
  IconQrcode,
  IconShoppingCart,
  IconTrash,
} from '@tabler/icons-react';
import Alerts from 'src/components/alerts/Alerts';
import CancelButton from 'src/components/button-group/CancelButton';
import SearchButton from 'src/components/button-group/SearchButton';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from 'src/components/shared/DashboardCard';
import useDebouncedValue from 'src/hooks/useDebouncedValue';
import usePesanAlert from 'src/hooks/usePesanAlert';
import { useSchoolTimezone } from 'src/hooks/useSchoolTimezone';
import {
  ambilDaftarMenu,
  ambilDetailDompet,
  cariSiswaDompet,
  prosesBelanjaKasir,
} from 'src/apps/admin-kantin/api';
import {
  BATAS_KANTIN,
  KATEGORI_MENU,
  KUNCI_KANTIN,
  bangunPayloadCheckout,
  buatKunciIdempotensi,
  formatRupiah,
  hitungRingkasanKeranjang,
  metaKategoriMenu,
  metaStatusDompet,
  pesanGalatKantin,
  sisaLimitHarian,
  tambahItemKeranjang,
  ubahJumlahKeranjang,
  validasiCheckout,
} from 'src/apps/admin-kantin/kantin';
import StrukTransaksiDialog from 'src/apps/admin-kantin/transaksi/StrukTransaksiDialog';

const KasirPosPage = () => {
  const userId = useSelector((state) => state.user.userId);
  const { profil, unitAktif = true } = useOutletContext() || {};
  const timeZone = useSchoolTimezone();
  const queryClient = useQueryClient();

  const [cariMenu, setCariMenu] = useState('');
  const [kategori, setKategori] = useState('');
  const [kodeQrInput, setKodeQrInput] = useState('');
  const [cariSiswaInput, setCariSiswaInput] = useState('');
  const cariSiswaDebounced = useDebouncedValue(cariSiswaInput, 300);

  const [targetLookup, setTargetLookup] = useState(null); // { siswa_id } | { kode_qr }
  const [keranjang, setKeranjang] = useState([]);
  const [catatan, setCatatan] = useState('');

  const [dialogPinBuka, setDialogPinBuka] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [kunciIdem, setKunciIdem] = useState('');
  const [errorPin, setErrorPin] = useState('');
  const [successMsg, setSuccessMsg, kunciSukses] = usePesanAlert('');
  const [errorMsg, setErrorMsg, kunciError] = usePesanAlert('');
  const [strukHasil, setStrukHasil] = useState(null);

  const menuQuery = useQuery({
    queryKey: [KUNCI_KANTIN.menu, userId, 'kasir-tersedia'],
    queryFn: () => ambilDaftarMenu({ is_tersedia: true, limit: 100 }),
    enabled: unitAktif,
  });

  const saranSiswaQuery = useQuery({
    queryKey: [KUNCI_KANTIN.siswa, userId, 'kasir-cari', cariSiswaDebounced],
    queryFn: () => cariSiswaDompet({ status: 'aktif', q: cariSiswaDebounced.trim(), limit: 20 }),
    enabled: unitAktif && cariSiswaDebounced.trim().length >= 1,
  });

  const dompetQuery = useQuery({
    queryKey: [KUNCI_KANTIN.dompet, userId, 'kasir', targetLookup],
    queryFn: () => ambilDetailDompet(targetLookup),
    enabled: Boolean(targetLookup) && unitAktif,
    retry: false,
  });

  const checkoutMutation = useMutation({
    mutationFn: prosesBelanjaKasir,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN.profil, userId] });
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN.dompet, userId] });
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN.siswa, userId] });
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN.transaksi, userId] });
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN.rekonsiliasi, userId] });

      setDialogPinBuka(false);
      setPinInput('');
      setErrorPin('');
      setKeranjang([]);
      setCatatan('');
      setErrorMsg('');
      setSuccessMsg(res?.msg || 'Pembayaran kasir berhasil diproses.');
      setStrukHasil(res?.data?.transaksi || null);
    },
    onError: (err) => {
      const status = err?.response?.status;
      const kode = err?.response?.data?.kode;
      // PIN salah/terkunci tidak membentuk transaksi, maka siapkan idempotency key baru agar retry tidak konflik.
      if (status === 403 || status === 423 || kode === 'PIN_SALAH' || kode === 'PIN_TERKUNCI') {
        setKunciIdem(buatKunciIdempotensi('kasir'));
        setPinInput('');
        queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN.dompet, userId] });
      }
      setErrorPin(pesanGalatKantin(err, 'Gagal memproses pembayaran kasir.'));
    },
  });

  const semuaMenu = menuQuery.data?.items || [];
  const menuTersaring = semuaMenu.filter((m) => {
    const cocokKat = !kategori || m.kategori === kategori;
    const kata = cariMenu.trim().toLowerCase();
    const cocokNama = !kata || String(m.nama_menu || '').toLowerCase().includes(kata);
    return cocokKat && cocokNama;
  });

  const ringkas = hitungRingkasanKeranjang(keranjang);
  const qtyPerMenu = new Map(keranjang.map((it) => [it.menu_id, it.jumlah]));
  const detailDompet = dompetQuery.data;
  const siswaTerpilih = detailDompet?.siswa || null;
  const dompet = detailDompet?.dompet || null;
  const pemakaianHariIni = detailDompet?.pemakaian_hari_ini ?? 0;
  const statusDompet = metaStatusDompet(dompet);
  const sisaLimit = sisaLimitHarian(dompet, pemakaianHariIni);

  const handleScanQrSubmit = (e) => {
    e.preventDefault();
    const qr = kodeQrInput.trim();
    if (!qr) return;
    setErrorMsg('');
    setTargetLookup({ kode_qr: qr });
  };

  const handleBukaKonfirmasiBayar = () => {
    // Validasi tanpa PIN dulu sebelum membuka dialog PIN.
    const galatPra = validasiCheckout({
      siswa: siswaTerpilih,
      dompet,
      pemakaianHariIni,
      keranjang,
      pin: '000000',
      unitAktif,
    });
    if (galatPra) {
      setErrorMsg(galatPra);
      return;
    }
    setErrorMsg('');
    setErrorPin('');
    setPinInput('');
    setKunciIdem(buatKunciIdempotensi('kasir'));
    setDialogPinBuka(true);
  };

  const handleSubmitCheckout = (e) => {
    e.preventDefault();
    const galat = validasiCheckout({
      siswa: siswaTerpilih,
      dompet,
      pemakaianHariIni,
      keranjang,
      pin: pinInput,
      unitAktif,
    });
    if (galat) {
      setErrorPin(galat);
      return;
    }
    setErrorPin('');
    checkoutMutation.mutate(
      bangunPayloadCheckout({
        siswaId: siswaTerpilih.id,
        pin: pinInput,
        keranjang,
        idempotencyKey: kunciIdem,
        catatan,
      }),
    );
  };

  const persenLimit =
    dompet?.limit_harian && dompet.limit_harian > 0
      ? Math.min(100, Math.round((pemakaianHariIni / dompet.limit_harian) * 100))
      : 0;

  return (
    <PageContainer title="Kasir POS Kantin" description="Point of Sale pembayaran kartu & PIN siswa">
      <Box sx={{ pb: 5 }}>
        <Stack spacing={2.5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography variant="h4">Kasir POS · {profil?.kantin?.nama_kantin || 'Kantin'}</Typography>
            <Typography variant="body2" color="text.secondary">
              Scan kode QR kartu siswa, susun pesanan, lalu otorisasi dengan PIN 6 digit siswa.
            </Typography>
          </Box>
          <Chip
            color="primary"
            variant="outlined"
            label={`Saldo Mengendap: ${formatRupiah(profil?.kantin?.saldo_mengendap ?? 0)}`}
          />
        </Box>

        <Alerts key={`${kunciSukses}-${kunciError}`} error={errorMsg} success={successMsg} />

        <Grid container spacing={2.5} alignItems="flex-start">
          {/* Kolom Kiri: Katalog Menu Tersedia */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <DashboardCard title="Katalog Menu" subtitle="Pilih menu yang tersedia untuk ditambahkan ke keranjang">
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                  <SearchButton
                    value={cariMenu}
                    onChange={(e) => setCariMenu(e.target.value)}
                    placeholder="Cari menu kasir..."
                  />
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    <Chip
                      label="Semua"
                      clickable
                      color={kategori === '' ? 'primary' : 'default'}
                      variant={kategori === '' ? 'filled' : 'outlined'}
                      onClick={() => setKategori('')}
                    />
                    {KATEGORI_MENU.map((k) => (
                      <Chip
                        key={k.kode}
                        label={k.label}
                        clickable
                        color={kategori === k.kode ? 'primary' : 'default'}
                        variant={kategori === k.kode ? 'filled' : 'outlined'}
                        onClick={() => setKategori(k.kode)}
                      />
                    ))}
                  </Stack>
                </Box>

                {!unitAktif ? (
                  <Alert severity="warning">Unit kantin sedang nonaktif. Layar kasir dikunci.</Alert>
                ) : menuQuery.isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress />
                  </Box>
                ) : menuQuery.isError ? (
                  <Alert severity="error">{pesanGalatKantin(menuQuery.error, 'Gagal memuat menu kasir.')}</Alert>
                ) : menuTersaring.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 5 }}>
                    Tidak ada menu tersedia yang cocok.
                  </Typography>
                ) : (
                  <Grid container spacing={1.5}>
                    {menuTersaring.map((menu) => {
                      const qty = qtyPerMenu.get(menu.id) || 0;
                      return (
                        <Grid key={menu.id} size={{ xs: 12, sm: 6, md: 4 }}>
                          <Paper
                            variant="outlined"
                            sx={{
                              height: '100%',
                              overflow: 'hidden',
                              borderColor: qty > 0 ? 'primary.main' : 'divider',
                              bgcolor: qty > 0 ? 'primary.light' : 'background.paper',
                              transition: 'border-color .15s',
                              '&:hover': { borderColor: 'primary.main' },
                            }}
                          >
                            <CardActionArea
                              onClick={() => setKeranjang((prev) => tambahItemKeranjang(prev, menu))}
                              sx={{
                                p: 1.75,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'stretch',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.75 }}>
                                  <Chip size="small" label={metaKategoriMenu(menu.kategori)} variant="outlined" />
                                  {qty > 0 && <Chip size="small" color="primary" label={`${qty}x`} />}
                                </Box>
                                <Typography variant="subtitle2" fontWeight={700}>
                                  {menu.nama_menu}
                                </Typography>
                              </Box>
                              <Typography variant="h6" color="primary.main" sx={{ mt: 1.5 }}>
                                {formatRupiah(menu.harga)}
                              </Typography>
                            </CardActionArea>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Stack>
            </DashboardCard>
          </Grid>

          {/* Kolom Kanan: Identitas Siswa, Info Dompet, & Keranjang Checkout */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Stack spacing={2}>
              {/* Pilih Siswa */}
              <DashboardCard title="1. Identifikasi Pembeli">

                <Box component="form" onSubmit={handleScanQrSubmit} sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <CustomOutlinedInput
                    size="small"
                    value={kodeQrInput}
                    onChange={(e) => setKodeQrInput(e.target.value)}
                    placeholder="Scan / ketik kode QR kartu lalu Enter..."
                    fullWidth
                  />
                  <Button type="submit" variant="outlined" startIcon={<IconQrcode size={18} />} disabled={!unitAktif}>
                    Cek QR
                  </Button>
                </Box>

                <Autocomplete
                  size="small"
                  options={saranSiswaQuery.data?.items || []}
                  loading={saranSiswaQuery.isFetching}
                  getOptionLabel={(opt) => `${opt.nama || '-'} (${opt.nis || 'Tanpa NIS'})`}
                  onInputChange={(_, val) => setCariSiswaInput(val)}
                  onChange={(_, val) => {
                    if (val?.id) {
                      setErrorMsg('');
                      setTargetLookup({ siswa_id: val.id });
                    }
                  }}
                  renderInput={(params) => (
                    <CustomTextField {...params} label="Atau cari nama / NIS siswa" placeholder="Ketik minimal 1 huruf..." />
                  )}
                />

                {dompetQuery.isFetching && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" color="text.secondary">
                      Memuat dompet siswa...
                    </Typography>
                  </Box>
                )}

                {dompetQuery.isError && (
                  <Alert severity="error" sx={{ mt: 1.5 }}>
                    {pesanGalatKantin(dompetQuery.error, 'Siswa tidak ditemukan.')}
                  </Alert>
                )}

                {siswaTerpilih && (
                  <Paper variant="outlined" sx={{ p: 1.75, mt: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {siswaTerpilih.nama}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          NIS: {siswaTerpilih.nis || '-'} · Kelas: {siswaTerpilih.kelas || '-'}
                        </Typography>
                      </Box>
                      <Chip size="small" label={statusDompet.label} color={statusDompet.color} />
                    </Box>

                    <Box sx={{ mt: 1.25 }}>
                      <Typography variant="body2">
                        Saldo Dompet: <strong>{formatRupiah(dompet?.saldo ?? 0)}</strong>
                      </Typography>
                      {dompet?.limit_harian !== null && dompet?.limit_harian !== undefined ? (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Terpakai hari ini: {formatRupiah(pemakaianHariIni)} / {formatRupiah(dompet.limit_harian)} (Sisa:{' '}
                            <strong>{formatRupiah(sisaLimit)}</strong>)
                          </Typography>
                          <LinearProgress variant="determinate" value={persenLimit} sx={{ mt: 0.5, height: 6 }} />
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Limit harian: Tanpa batas · Terpakai hari ini: {formatRupiah(pemakaianHariIni)}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                )}
              </DashboardCard>

              {/* Keranjang Belanja */}
              <DashboardCard
                title={`2. Keranjang Belanja (${ringkas.jumlahQty})`}
                action={
                  keranjang.length > 0 ? (
                    <Button size="small" color="error" sx={{ textTransform: 'none' }} onClick={() => setKeranjang([])}>
                      Kosongkan
                    </Button>
                  ) : null
                }
              >

                {keranjang.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                    Klik menu di sebelah kiri untuk menambahkan pesanan.
                  </Typography>
                ) : (
                  <Stack spacing={1.25}>
                    {keranjang.map((it) => (
                      <Box
                        key={it.menu_id}
                        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}
                      >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {it.nama_menu}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatRupiah(it.harga)} x {it.jumlah} = {formatRupiah(it.harga * it.jumlah)}
                          </Typography>
                        </Box>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <IconButton
                            size="small"
                            aria-label="kurangi item"
                            onClick={() => setKeranjang((prev) => ubahJumlahKeranjang(prev, it.menu_id, -1))}
                          >
                            <IconMinus size={16} />
                          </IconButton>
                          <Typography variant="body2" fontWeight={600} sx={{ minWidth: 20, textAlign: 'center' }}>
                            {it.jumlah}
                          </Typography>
                          <IconButton
                            size="small"
                            aria-label="tambah item"
                            onClick={() => setKeranjang((prev) => ubahJumlahKeranjang(prev, it.menu_id, 1))}
                          >
                            <IconPlus size={16} />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            aria-label="hapus item"
                            onClick={() => setKeranjang((prev) => prev.filter((x) => x.menu_id !== it.menu_id))}
                          >
                            <IconTrash size={16} />
                          </IconButton>
                        </Stack>
                      </Box>
                    ))}

                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Total Tagihan
                      </Typography>
                      <Typography variant="h4" color="primary.main" fontWeight={700}>
                        {formatRupiah(ringkas.totalNominal)}
                      </Typography>
                    </Box>

                    <CustomOutlinedInput
                      size="small"
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Catatan pesanan (opsional)"
                      inputProps={{ maxLength: BATAS_KANTIN.CATATAN_MAX }}
                      fullWidth
                    />

                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<IconShoppingCart size={20} />}
                      disabled={!unitAktif || keranjang.length === 0}
                      onClick={handleBukaKonfirmasiBayar}
                      fullWidth
                    >
                      Bayar Sekarang (Verifikasi PIN)
                    </Button>
                  </Stack>
                )}
              </DashboardCard>
            </Stack>
          </Grid>
        </Grid>
        </Stack>
      </Box>

      {/* Dialog Otorisasi PIN 6 Digit */}
      <Dialog
        open={dialogPinBuka}
        onClose={checkoutMutation.isPending ? undefined : () => setDialogPinBuka(false)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="judul-checkout-pin"
      >
        <Box component="form" onSubmit={handleSubmitCheckout} noValidate>
          <DialogTitle id="judul-checkout-pin">Verifikasi PIN 2FA Siswa</DialogTitle>
          <DialogContent dividers>
            {errorPin && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorPin}
              </Alert>
            )}
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Pembeli: <strong>{siswaTerpilih?.nama || '-'}</strong>
              </Typography>
              <Typography variant="h4" color="primary.main" fontWeight={700} sx={{ mt: 0.75 }}>
                {formatRupiah(ringkas.totalNominal)}
              </Typography>
            </Paper>
            <CustomFormLabel htmlFor="pin_checkout" sx={{ mt: 0 }}>
              Masukkan PIN 6 Digit Siswa
            </CustomFormLabel>
            <CustomOutlinedInput
              id="pin_checkout"
              type="password"
              autoComplete="off"
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, BATAS_KANTIN.PIN_PANJANG))}
              inputProps={{ inputMode: 'numeric', maxLength: BATAS_KANTIN.PIN_PANJANG }}
              startAdornment={<IconLock size={18} style={{ marginRight: 8 }} />}
              placeholder="••••••"
              fullWidth
              required
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <CancelButton onClick={() => setDialogPinBuka(false)} />
            <SubmitButton isLoading={checkoutMutation.isPending}>Konfirmasi Bayar</SubmitButton>
          </DialogActions>
        </Box>
      </Dialog>

      <StrukTransaksiDialog
        buka={Boolean(strukHasil)}
        transaksi={strukHasil}
        judul="Pembayaran Berhasil · Struk Kantin"
        timeZone={timeZone}
        onTutup={() => setStrukHasil(null)}
      />
    </PageContainer>
  );
};

export default KasirPosPage;
