import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, useTheme } from '@mui/material';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { keDate, metaStatusJadwal } from 'src/components/jadwal-bk/jadwalConfig';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (d) => startOfWeek(d, { weekStartsOn: 1 }),
  getDay,
  locales: { id: localeId },
});

const PESAN = {
  date: 'Tanggal', time: 'Waktu', event: 'Sesi', allDay: 'Sepanjang hari', week: 'Minggu', work_week: 'Hari kerja',
  day: 'Hari', month: 'Bulan', previous: '‹', next: '›', yesterday: 'Kemarin', tomorrow: 'Besok', today: 'Hari ini',
  agenda: 'Agenda', noEventsInRange: 'Tidak ada jadwal pada rentang ini.', showMore: (n) => `+${n} lainnya`,
};

// Kalender jadwal konseling. Status ditandai warna + simbol di judul (✓ selesai, ⚠ tidak hadir,
// ✕ dibatalkan) supaya tidak bergantung pada warna saja.
const KalenderJadwal = ({ jadwalList, tampilBk, tanggal, view, onNavigate, onView, onPilihSesi, onPilihSlot }) => {
  const theme = useTheme();

  const events = useMemo(
    () =>
      jadwalList.map((j) => {
        const status = metaStatusJadwal(j.status?.kode);
        const siswa = j.siswa.length > 1 ? `${j.siswa[0].nama} +${j.siswa.length - 1}` : j.siswa[0]?.nama;
        return {
          id: j.id,
          title: `${status.simbol}${siswa} · ${j.topik}${tampilBk ? ` (${j.bk?.nama?.split(',')[0]})` : ''}`,
          start: keDate(j.tanggal, j.jam_mulai),
          end: keDate(j.tanggal, j.jam_selesai || j.jam_mulai),
          resource: j,
        };
      }),
    [jadwalList, tampilBk],
  );

  const eventPropGetter = (event) => {
    const kode = event.resource.status?.kode;
    const warna = {
      terjadwal: theme.palette.primary.main,
      selesai: theme.palette.success.main,
      tidak_hadir: theme.palette.error.main,
      dibatalkan: theme.palette.grey[400],
    }[kode];
    return {
      style: {
        backgroundColor: kode === 'terjadwal' ? warna : theme.palette.background.paper,
        color: kode === 'terjadwal' ? theme.palette.primary.contrastText : theme.palette.text.primary,
        border: `1px solid ${warna}`,
        borderLeft: `4px solid ${warna}`,
        borderRadius: 4,
        textDecoration: kode === 'dibatalkan' ? 'line-through' : 'none',
        // Jadwal BK lain (mode Semua BK): garis putus-putus & lebih pudar, tidak bisa diubah.
        ...(event.resource.bisa_ubah === false ? { borderStyle: 'dashed', opacity: 0.7 } : {}),
        fontSize: '0.8rem',
      },
    };
  };

  return (
    <Box
      sx={{
        height: 680,
        '& .rbc-today': { backgroundColor: theme.palette.primary.light },
        '& .rbc-toolbar button': { color: theme.palette.text.primary, textTransform: 'none' },
        '& .rbc-toolbar button.rbc-active': { backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText },
        '& .rbc-off-range-bg': { backgroundColor: theme.palette.action.hover },
      }}
    >
      <Calendar
        localizer={localizer}
        culture="id"
        messages={PESAN}
        events={events}
        date={tanggal}
        view={view}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        onNavigate={onNavigate}
        onView={onView}
        selectable
        onSelectEvent={(e) => onPilihSesi(e.resource)}
        onSelectSlot={(slot) => onPilihSlot(slot.start, slot.end, slot.action)}
        eventPropGetter={eventPropGetter}
        min={new Date(1970, 0, 1, 7, 0)}
        max={new Date(1970, 0, 1, 17, 0)}
        step={15}
        timeslots={4}
        popup
      />
    </Box>
  );
};

KalenderJadwal.propTypes = {
  jadwalList: PropTypes.array.isRequired,
  tampilBk: PropTypes.bool,
  tanggal: PropTypes.instanceOf(Date).isRequired,
  view: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onPilihSesi: PropTypes.func.isRequired,
  onPilihSlot: PropTypes.func.isRequired,
};

export default KalenderJadwal;
