import { useId, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip,
} from '@mui/material';
import { IconDots } from '@tabler/icons-react';

/**
 * Menu titik tiga di kepala kolom tabel (desain tab Kehadiran dan Proyek). Aksi-aksi satu kolom dikumpulkan di satu
 * tombol supaya kepala kolom tetap lega. Aksi yang merusak (`bahaya`) dipisah dengan garis dan berwarna merah.
 *
 * `label` dibaca pembaca layar ("Aksi pertemuan 1: semua hadir, ubah, hapus") dan menjadi isi tooltip bila `judul`
 * tidak diberikan. `item`: [{ kunci, teks, ikon, onPilih, bahaya? }]. Menu ditutup sebelum `onPilih` dijalankan,
 * karena aksi seperti hapus membuka dialog dan fokus harus pindah ke dialog itu, bukan tertinggal di menu.
 */
export default function MenuAksiKolom({ label, judul, item }) {
  const [jangkar, setJangkar] = useState(null);
  const id = useId();
  const buka = Boolean(jangkar);
  const tutup = () => setJangkar(null);

  return (
    <>
      <Tooltip title={judul ?? label}>
        <IconButton
          size="small"
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={buka ? 'true' : undefined}
          aria-controls={buka ? id : undefined}
          onClick={(e) => setJangkar(e.currentTarget)}
          sx={{ width: 36, height: 36 }}
        >
          <IconDots size={18} aria-hidden="true" />
        </IconButton>
      </Tooltip>
      <Menu id={id} anchorEl={jangkar} open={buka} onClose={tutup} slotProps={{ list: { 'aria-label': judul ?? label } }}>
        {item.flatMap((x) => {
          const baris = (
            <MenuItem
              key={x.kunci}
              onClick={() => { tutup(); x.onPilih(); }}
              sx={{ minHeight: 44, minWidth: 220, ...(x.bahaya ? { color: 'error.main' } : {}) }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{x.ikon}</ListItemIcon>
              <ListItemText>{x.teks}</ListItemText>
            </MenuItem>
          );
          return x.bahaya ? [<Divider key={`${x.kunci}-garis`} />, baris] : [baris];
        })}
      </Menu>
    </>
  );
}

MenuAksiKolom.propTypes = {
  label: PropTypes.string.isRequired,
  judul: PropTypes.string,
  item: PropTypes.arrayOf(PropTypes.shape({
    kunci: PropTypes.string.isRequired,
    teks: PropTypes.string.isRequired,
    ikon: PropTypes.node,
    onPilih: PropTypes.func.isRequired,
    bahaya: PropTypes.bool,
  })).isRequired,
};
