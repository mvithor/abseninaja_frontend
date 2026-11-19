import PropTypes from 'prop-types';
import { Box, CardActionArea, Paper, Skeleton, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  IconReportMoney,
  IconRotateClockwise,
  IconShoppingCart,
  IconWallet,
} from '@tabler/icons-react';
import { formatRupiah } from '../kantin';

const TileKpi = ({ icon, label, nilai, keterangan, aksenColor = 'text.secondary', onClick, isLoading }) => {
  const Icon = icon;
  const isi = (
    <Box sx={{ p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: aksenColor }}>
        <Icon size={18} />
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography variant="h3" sx={{ mt: 1.25, mb: 0.5, fontWeight: 700 }}>
        {isLoading ? <Skeleton width={120} /> : nilai}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {keterangan}
      </Typography>
    </Box>
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'border-color .15s',
        '&:hover': onClick ? { borderColor: 'primary.main' } : undefined,
      }}
    >
      {onClick ? <CardActionArea onClick={onClick} sx={{ height: '100%' }}>{isi}</CardActionArea> : isi}
    </Paper>
  );
};

TileKpi.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  nilai: PropTypes.node,
  keterangan: PropTypes.string,
  aksenColor: PropTypes.string,
  onClick: PropTypes.func,
  isLoading: PropTypes.bool,
};

const KpiKantinRow = ({ saldoMengendap = 0, rekonsiliasi, isLoading = false, onBukaPencairan, onBukaTransaksi }) => {
  const tiles = [
    {
      icon: IconWallet,
      label: 'Saldo Mengendap Kantin',
      nilai: formatRupiah(saldoMengendap),
      keterangan: 'Hak penjualan siap atau menunggu dicairkan',
      aksenColor: 'primary.main',
      onClick: onBukaPencairan,
    },
    {
      icon: IconShoppingCart,
      label: 'Total Penjualan Kotor',
      nilai: formatRupiah(rekonsiliasi?.total_belanja ?? 0),
      keterangan: 'Akumulasi transaksi belanja kasir',
      aksenColor: 'success.main',
      onClick: onBukaTransaksi,
    },
    {
      icon: IconRotateClockwise,
      label: 'Total Reversal / Refund',
      nilai: formatRupiah(rekonsiliasi?.total_reversal ?? 0),
      keterangan: 'Koreksi pembatalan transaksi belanja',
      aksenColor: 'warning.main',
      onClick: onBukaTransaksi,
    },
    {
      icon: IconReportMoney,
      label: 'Total Dana Dicairkan',
      nilai: formatRupiah(rekonsiliasi?.total_pencairan_aktif ?? 0),
      keterangan: `Menunggu settlement: ${formatRupiah(rekonsiliasi?.total_pencairan_menunggu ?? 0)}`,
      aksenColor: 'info.main',
      onClick: onBukaPencairan,
    },
  ];

  return (
    <Grid container spacing={2}>
      {tiles.map((t) => (
        <Grid key={t.label} size={{ xs: 12, sm: 6, md: 3 }}>
          <TileKpi {...t} isLoading={isLoading} />
        </Grid>
      ))}
    </Grid>
  );
};

KpiKantinRow.propTypes = {
  saldoMengendap: PropTypes.number,
  rekonsiliasi: PropTypes.object,
  isLoading: PropTypes.bool,
  onBukaPencairan: PropTypes.func,
  onBukaTransaksi: PropTypes.func,
};

export default KpiKantinRow;
