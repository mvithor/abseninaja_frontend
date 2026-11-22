import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconInfoCircle } from '@tabler/icons-react';
import Eyebrow from '../../components/Eyebrow';
import KartuGrup from '../../components/KartuGrup';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import TombolLuar from '../../components/TombolLuar';
import Teks from '../../components/Teks';
import { renderTeks } from '../../components/renderTeks';
import { URL_MODUL_SMK } from '../../data/nav';
import { alihkanGrup, idGrup, susunPanel, terbukaGrup, tingkatTurunan } from '../../lib/fitur.js';
import { colors, huruf } from '../../theme/tokens';
import GrupFitur from './GrupFitur';

// Isi satu panel peran: kepala (eyebrow nama peran, judul h2, deskripsi; tanpa garis
// pemisah di bawahnya), lalu sub opsional dengan subjudul h3 (PMB) dan grup kartu, tombol
// tautan luar (Kepala jurusan), dan catatan bantu. Tata kartu per peran (`peran.tata`):
//  penuh / ringkas : GrupFitur, kisi kartu per grup
//  grup            : KartuGrup besar per grup, dua kolom di md ke atas (Admin kantin,
//                    Kepala jurusan)
// Tingkat judul dihitung per sub (s.tingkat): h4 di bawah subjudul h3, h3 bila sub tanpa
// subjudul; pada tata grup nama grup memakai tingkat itu dan judul fitur satu tingkat lebih
// dalam. Status buka akordeon seluler disimpan di sini; DaftarPeran memasang ulang panel
// (key) tiap ganti tab, jadi status kembali ke bawaan (hanya grup pertama terbuka).
export default function PanelPeran({ peran, idPanel }) {
  const [peta, setPeta] = useState({});
  const sub = susunPanel(peran);
  const grup = peran.tata === 'grup';
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'flex-end' },
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: { xs: '14px', md: '20px 48px' },
          mt: { xs: '32px', md: '56px' },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '14px', maxWidth: 700 }}>
          <Eyebrow component="p" sx={{ m: 0 }}>
            <Teks web={peran.label.web} seluler={peran.label.mobile} />
          </Eyebrow>
          <Box component="h2" sx={{ m: 0, color: colors.ink, textWrap: 'balance', ...huruf.judulBagian }}>
            {peran.judul}
          </Box>
        </Box>
        <Box
          component="p"
          sx={{ m: 0, maxWidth: 440, color: colors.muted, textWrap: 'pretty', ...huruf.subjudul, fontSize: { xs: '15px', md: '16px' } }}
        >
          {renderTeks(peran.deskripsi)}
          <PenandaVerifikasi verifikasi={peran.verifikasi} sx={{ ml: '10px' }} />
        </Box>
      </Box>

      {sub.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: '32px', md: '44px' }, mt: { xs: '24px', md: '36px' } }}>
          {sub.map((s, i) => (
            // Indeks jadi kunci: subjudul boleh kosong dan urutannya tetap.
            <Box
              key={i}
              sx={
                grup
                  ? { display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' }, gap: '20px', alignItems: 'start' }
                  : { display: 'flex', flexDirection: 'column', gap: { xs: '20px', md: '32px' } }
              }
            >
              {s.judul !== '' && (
                <Box component="h3" sx={{ m: 0, color: colors.ink, ...huruf.judulSub, ...(grup ? { gridColumn: { md: '1 / -1' } } : null) }}>
                  {s.judul}
                </Box>
              )}
              {s.grup.map((g, j) =>
                grup ? (
                  <KartuGrup
                    key={`${g.nama}-${j}`}
                    ikon={peran.ikonGrup[g.nama]}
                    nama={g.nama}
                    butir={g.kartu}
                    tingkatNama={s.tingkat}
                    tingkatButir={tingkatTurunan(s.tingkat)}
                  />
                ) : (
                  <GrupFitur
                    key={`${g.nama}-${j}`}
                    grup={g}
                    idLabel={idGrup(idPanel, i, j)}
                    tata={peran.tata}
                    tingkatJudul={s.tingkat}
                    akordeon={peran.akordeon === true}
                    terbuka={terbukaGrup(peta, i, j)}
                    onAlih={() => setPeta((lama) => alihkanGrup(lama, i, j))}
                  />
                ),
              )}
            </Box>
          ))}
        </Box>
      )}

      {peran.tautanLuar && (
        <Box sx={{ mt: '28px', display: 'flex' }}>
          <TombolLuar href={URL_MODUL_SMK} sx={{ width: { xs: '100%', md: 'auto' } }}>
            {peran.tautanLuar.label}
          </TombolLuar>
        </Box>
      )}

      {peran.catatan && (
        <Box
          component="p"
          sx={{
            m: { xs: '20px 0 0', md: '24px 0 0' },
            display: 'flex',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '10px',
            fontSize: '14px',
            lineHeight: 1.7,
            color: colors.muted,
          }}
        >
          <Box component="span" aria-hidden="true" sx={{ display: 'inline-flex', flex: 'none', mt: '4px' }}>
            <IconInfoCircle size={16} stroke={2} />
          </Box>
          <span>{peran.catatan.teks}</span>
          <PenandaVerifikasi verifikasi={peran.catatan.verifikasi} />
        </Box>
      )}
    </>
  );
}

PanelPeran.propTypes = {
  peran: PropTypes.shape({
    label: PropTypes.shape({ web: PropTypes.string, mobile: PropTypes.string }).isRequired,
    judul: PropTypes.string.isRequired,
    deskripsi: PropTypes.object.isRequired,
    tata: PropTypes.oneOf(['penuh', 'ringkas', 'grup']).isRequired,
    akordeon: PropTypes.bool,
    ikonGrup: PropTypes.object,
    verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    tautanLuar: PropTypes.shape({ label: PropTypes.string }),
    sub: PropTypes.array.isRequired,
    catatan: PropTypes.shape({ teks: PropTypes.string, verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]) }),
  }).isRequired,
  idPanel: PropTypes.string.isRequired,
};
