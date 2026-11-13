import PropTypes from 'prop-types';
import { Button, IconButton, Tooltip, Typography } from '@mui/material';
import { IconChecklist, IconDownload, IconEye, IconHistory, IconLock, IconLockOpen } from '@tabler/icons-react';
import ChildCard from 'src/components/shared/ChildCard';
import DokumenPerangkatTable from 'src/components/perangkat-ajar/DokumenPerangkatTable';
import {
  isKunciDibuka,
  labelPenugasan,
  statusUnggah,
  STATUS_PERANGKAT,
} from 'src/components/perangkat-ajar/perangkatAjarConfig';

const tombolSx = { textTransform: 'none', whiteSpace: 'nowrap', mr: 0.5 };

const PenugasanPerangkatCard = ({
  penugasan,
  timezone,
  onPratinjau,
  onUnduh,
  onRiwayat,
  onValidasi,
  onBukaKunci,
  onKunciKembali,
  unduhSedangId,
  bacaSaja = false,
}) => {
  const renderAksi = (dok) => {
    const adaFile = Boolean(dok.id && dok.versi_terakhir);
    const { terkunci } = statusUnggah(dok);
    const dibuka = isKunciDibuka(dok);

    if (!adaFile) {
      // Semester arsip: validasi & buka/kunci kembali ditolak server, jadi tombolnya disembunyikan.
      if (bacaSaja) return <Typography variant="body2" color="text.secondary">-</Typography>;
      if (terkunci) {
        return (
          <Button
            size="small"
            variant="outlined"
            color="warning"
            startIcon={<IconLockOpen size={16} />}
            onClick={() => onBukaKunci(penugasan, dok)}
            sx={tombolSx}
          >
            Buka Kunci
          </Button>
        );
      }
      if (dibuka) {
        return (
          <Tooltip title={`Kunci kembali${dok.kunci_dibuka?.alasan ? ` (alasan dibuka: ${dok.kunci_dibuka.alasan})` : ''}`}>
            <IconButton size="small" color="warning" onClick={() => onKunciKembali(penugasan, dok)}>
              <IconLock width={18} />
            </IconButton>
          </Tooltip>
        );
      }
      return <Typography variant="body2" color="text.secondary">-</Typography>;
    }

    return (
      <>
        {!bacaSaja && dok.status === STATUS_PERANGKAT.MENUNGGU_VALIDASI && (
          <Button
            size="small"
            variant="contained"
            startIcon={<IconChecklist size={16} />}
            onClick={() => onValidasi(penugasan, dok)}
            sx={tombolSx}
          >
            Validasi
          </Button>
        )}
        <Tooltip title="Pratinjau">
          <IconButton size="small" onClick={() => onPratinjau(penugasan, dok)}>
            <IconEye width={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Unduh">
          <span>
            <IconButton size="small" onClick={() => onUnduh(dok)} disabled={unduhSedangId === dok.id}>
              <IconDownload width={18} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Riwayat Versi">
          <IconButton size="small" onClick={() => onRiwayat(penugasan, dok)}>
            <IconHistory width={18} />
          </IconButton>
        </Tooltip>
      </>
    );
  };

  return (
    <ChildCard title={labelPenugasan(penugasan)}>
      <DokumenPerangkatTable dokumenList={penugasan.dokumen || []} timezone={timezone} renderAksi={renderAksi} />
    </ChildCard>
  );
};

PenugasanPerangkatCard.propTypes = {
  penugasan: PropTypes.object.isRequired,
  timezone: PropTypes.string,
  onPratinjau: PropTypes.func.isRequired,
  onUnduh: PropTypes.func.isRequired,
  onRiwayat: PropTypes.func.isRequired,
  onValidasi: PropTypes.func.isRequired,
  onBukaKunci: PropTypes.func.isRequired,
  onKunciKembali: PropTypes.func.isRequired,
  unduhSedangId: PropTypes.string,
  bacaSaja: PropTypes.bool,
};

export default PenugasanPerangkatCard;
