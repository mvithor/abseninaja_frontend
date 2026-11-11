import PropTypes from 'prop-types';
import { Button, IconButton, Tooltip } from '@mui/material';
import { IconEye, IconHistory, IconLock, IconUpload } from '@tabler/icons-react';
import ChildCard from 'src/components/shared/ChildCard';
import DokumenPerangkatTable from 'src/components/perangkat-ajar/DokumenPerangkatTable';
import { labelPenugasan, statusUnggah, STATUS_PERANGKAT } from 'src/components/perangkat-ajar/perangkatAjarConfig';

const PenugasanSayaCard = ({ penugasan, timezone, onUnggah, onPratinjau, onRiwayat, bacaSaja = false }) => {
  const renderAksi = (dok) => {
    const status = statusUnggah(dok);
    // Semester arsip: semua unggahan ditolak server, apa pun status dokumennya.
    const bisaUnggah = status.bisaUnggah && !bacaSaja;
    const { terkunci } = status;
    const alasan = bacaSaja ? 'Semester ini sudah diarsipkan' : status.alasan;
    const adaFile = Boolean(dok.id && dok.versi_terakhir);
    const labelUnggah = dok.status === STATUS_PERANGKAT.PERLU_REVISI ? 'Unggah Ulang' : 'Unggah';

    return (
      <>
        {adaFile && (
          <>
            <Tooltip title="Pratinjau">
              <IconButton size="small" onClick={() => onPratinjau(penugasan, dok)}>
                <IconEye width={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Riwayat Versi & Feedback">
              <IconButton size="small" onClick={() => onRiwayat(penugasan, dok)}>
                <IconHistory width={18} />
              </IconButton>
            </Tooltip>
          </>
        )}
        <Tooltip title={bisaUnggah ? '' : alasan}>
          {/* span agar tooltip tetap muncul pada tombol disabled */}
          <span>
            <Button
              size="small"
              variant={bisaUnggah ? 'contained' : 'outlined'}
              color={dok.status === STATUS_PERANGKAT.PERLU_REVISI ? 'error' : 'primary'}
              startIcon={terkunci ? <IconLock size={16} /> : <IconUpload size={16} />}
              onClick={() => onUnggah(penugasan, dok)}
              disabled={!bisaUnggah}
              sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              {terkunci ? 'Terkunci' : labelUnggah}
            </Button>
          </span>
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

PenugasanSayaCard.propTypes = {
  penugasan: PropTypes.object.isRequired,
  timezone: PropTypes.string,
  onUnggah: PropTypes.func.isRequired,
  onPratinjau: PropTypes.func.isRequired,
  onRiwayat: PropTypes.func.isRequired,
  bacaSaja: PropTypes.bool,
};

export default PenugasanSayaCard;
