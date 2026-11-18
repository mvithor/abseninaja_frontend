import { Suspense, lazy, useEffect, useId, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { IconAlertCircle, IconCheck, IconLoader2 } from '@tabler/icons-react';
import KolomForm from './KolomForm';
import PilihanForm from './PilihanForm';
import KotakIkon from './KotakIkon';
import TombolLanding from './TombolLanding';
import useFormulir from '../lib/useFormulir';
import { KOLOM_JEBAKAN, LABEL_JEBAKAN, SKEMA, TEKS_FORMULIR as T } from '../data/formulir';
import { REGISTRI_RUTE } from '../data/nav';
import { waLink } from '../data/kontak';
import { colors, flags, gradients, huruf, layout, radius, shadows } from '../theme/tokens';
import { hanyaPembaca, resetDaftar } from '../theme/sx';

// Pemilih keadaan hanya ada di DEV: import dinamis di bawah import.meta.env.DEV
// dibuang bundler dari build produksi.
const PemilihKeadaan = import.meta.env.DEV ? lazy(() => import('./PemilihKeadaan')) : null;

const putar = keyframes`
  to { transform: rotate(360deg); }
`;

// Hanya angka kolom isian; batas keras ketikan lebih longgar dari batas validasi.
const BATAS_KETIK_WA = 40;
const batasKetik = (kolom) => (kolom.jenis === 'whatsapp' ? BATAS_KETIK_WA : kolom.maks ? kolom.maks * 2 : undefined);

const sxBanner = {
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
  boxSizing: 'border-box',
  mt: '16px',
  p: '14px 16px',
  borderRadius: radius.kartuKecil,
  fontSize: '14px',
  lineHeight: 1.55,
};

// Panel sukses: fokus pindah ke judul (tabIndex -1) dan pengumuman lewat
// region aria-live di kartu. Langkah berikutnya (opsional) berupa daftar bernomor.
function PanelTerkirim({ judulRef, tingkatJudul = 'h2', sub, langkah = [] }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '16px',
        p: { xs: '10px 0 6px', md: '20px 0 12px' },
      }}
    >
      <KotakIkon ikon={IconCheck} ukuran={72} ikonUkuran={36} stroke={2.6} sudut="24px" />
      <Box
        component={tingkatJudul}
        ref={judulRef}
        tabIndex={-1}
        sx={{ m: 0, color: colors.ink, ...huruf.judulTerkirim, '&:focus-visible': { outline: 'none' } }}
      >
        {T.terkirimJudul}
      </Box>
      <Box component="p" sx={{ m: 0, maxWidth: 380, color: colors.muted, ...huruf.subjudul, fontSize: '15px' }}>
        {sub}
      </Box>
      {langkah.length > 0 && (
        <Box
          component="ol"
          role="list"
          sx={{ ...resetDaftar, width: '100%', mt: '8px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}
        >
          {langkah.map((l, i) => (
            <Box
              key={l}
              component="li"
              sx={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                p: '12px 16px',
                borderRadius: radius.kartuKecil,
                background: colors.kartuLembut,
                fontSize: '14px',
                color: colors.ink,
              }}
            >
              <Box
                component="span"
                aria-hidden="true"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  flex: 'none',
                  borderRadius: '50%',
                  background: gradients.brand,
                  color: colors.white,
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </Box>
              {l}
            </Box>
          ))}
        </Box>
      )}
      <TombolLanding varian="garis" to={T.kembali.to} sx={{ mt: '12px' }}>
        {T.kembali.label}
      </TombolLanding>
    </Box>
  );
}

PanelTerkirim.propTypes = {
  judulRef: PropTypes.object.isRequired,
  tingkatJudul: PropTypes.oneOf(['h2', 'h3']),
  sub: PropTypes.node,
  langkah: PropTypes.arrayOf(PropTypes.string),
};

// Formulir konversi bersama (Jadwalkan Demo dan Akun Guru Mandiri). Kolom
// berasal dari SKEMA di data/formulir.js; logika di lib/. Empat keadaan:
// isian, mengirim, terkirim, gagal, ditambah keadaan jujur "belum aktif" bila
// flags.formulirAktif mati (produksi tanpa endpoint).
//
// Aksesibilitas: form `noValidate` dengan pesan galat sendiri (aria-invalid,
// aria-describedby), fokus ke kolom bergalat pertama, region aria-live untuk
// status, fokus ke panel sukses atau banner galat, tombol kirim nonaktif saat
// mengirim.
//  jenis      : 'demo' | 'guru' (kunci SKEMA)
//  judul      : judul kartu (`tingkatJudul`, bawaan h2)
//  teksKirim  : teks tombol pada keadaan isian
//  terkirim   : { sub, langkah? }
//  jaminan    : [{ ikon, label }] baris keterangan di bawah tombol
//  pesanWa    : pesan awal tautan WhatsApp pada keadaan "belum aktif"
export default function FormulirKonversi({
  jenis,
  judul,
  tingkatJudul = 'h2',
  teksKirim,
  terkirim,
  jaminan = [],
  pesanWa,
  sx,
}) {
  const dasarId = useId();
  const { nilai, galat, status, kodeGagal, aktif, pesanLive, ubah, kirim, daftarkanKolom, pratinjau } = useFormulir(jenis);
  const judulId = `${dasarId}-judul`;
  const nonaktifId = `${dasarId}-nonaktif`;
  const gagalId = `${dasarId}-gagal`;
  const panelRef = useRef(null);
  const bannerRef = useRef(null);

  // Pindahkan fokus ke hasil: panel sukses atau banner galat kirim.
  useEffect(() => {
    if (status === 'terkirim') panelRef.current?.focus();
    else if (status === 'gagal') bannerRef.current?.focus();
  }, [status]);

  const mengirim = status === 'mengirim';
  const linkWa = waLink(pesanWa);
  const teksGagal = kodeGagal === 'ditolak' ? T.gagalDitolak : kodeGagal === 'waktu' ? T.gagalWaktu : T.gagal;
  const teksTombol = mengirim ? T.tombolMengirim : status === 'gagal' ? T.tombolCoba : teksKirim;

  return (
    <Box
      sx={{
        position: 'relative',
        boxSizing: 'border-box',
        textAlign: 'left',
        p: { xs: '26px 20px 22px', md: '32px 32px 26px' },
        borderRadius: radius.kartuXL,
        background: colors.white,
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.formulir,
        ...sx,
      }}
    >
      {/* Region aria-live selalu terpasang supaya perubahan teksnya diumumkan. Isinya
          hanya keadaan "mengirim" dan ringkasan galat validasi; hasil akhir diumumkan
          lewat pemindahan fokus ke panel sukses atau banner galat. */}
      <Box role="status" aria-live="polite" sx={hanyaPembaca}>
        {pesanLive}
      </Box>

      {status === 'terkirim' ? (
        <PanelTerkirim judulRef={panelRef} tingkatJudul={tingkatJudul} sub={terkirim.sub} langkah={terkirim.langkah} />
      ) : (
        <Box component="form" noValidate onSubmit={kirim} aria-labelledby={judulId} aria-busy={mengirim || undefined} sx={{ position: 'relative' }}>
          <Box id={judulId} component={tingkatJudul} sx={{ m: 0, color: colors.ink, ...huruf.judulFormulir }}>
            {judul}
          </Box>
          <Box component="p" sx={{ m: '2px 0 0', fontSize: '13px', color: colors.muted }}>
            {T.catatanWajib}
          </Box>

          {!aktif && (
            <Box id={nonaktifId} role="status" sx={{ ...sxBanner, flexDirection: 'column', gap: '10px', background: colors.statusBg, color: colors.statusInk }}>
              <Box>
                <strong>{T.nonaktif.judul}</strong> {T.nonaktif.isi}
              </Box>
              {linkWa && (
                <TombolLanding varian="garis" ukuran="md" href={linkWa} external>
                  {T.nonaktif.aksiWa}
                </TombolLanding>
              )}
            </Box>
          )}

          {status === 'gagal' && (
            <Box
              ref={bannerRef}
              role="group"
              aria-labelledby={gagalId}
              tabIndex={-1}
              sx={{
                ...sxBanner,
                background: colors.galatBg,
                border: `1px solid ${colors.galatBgGaris}`,
                color: colors.galat,
                '&:focus-visible': { outline: `2px solid ${colors.galat}`, outlineOffset: '2px' },
              }}
            >
              <IconAlertCircle size={20} stroke={2} aria-hidden="true" style={{ flex: 'none' }} />
              <Box>
                <strong id={gagalId}>{teksGagal.judul}</strong> {teksGagal.isi}
              </Box>
            </Box>
          )}

          <Box
            component="fieldset"
            aria-labelledby={judulId}
            disabled={!aktif}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' },
              gap: '16px',
              m: 0,
              mt: '20px',
              p: 0,
              border: 0,
              minWidth: 0,
              opacity: mengirim ? 0.55 : 1,
            }}
          >
            {SKEMA[jenis].map((k) => {
              const id = `${dasarId}-${k.nama}`;
              const sxKolom = k.lebar === 'penuh' ? { gridColumn: { md: '1 / -1' } } : undefined;
              return k.jenis === 'pilihan' ? (
                <PilihanForm
                  key={k.nama}
                  id={id}
                  nama={k.nama}
                  label={k.label}
                  nilai={nilai[k.nama]}
                  onUbah={ubah}
                  opsi={k.opsi}
                  placeholderPilih={k.placeholderPilih}
                  galat={galat[k.nama]}
                  wajib={k.wajib}
                  autoComplete={k.autoComplete}
                  inputRef={daftarkanKolom(k.nama)}
                  terkunci={mengirim}
                  sx={sxKolom}
                />
              ) : (
                <KolomForm
                  key={k.nama}
                  id={id}
                  nama={k.nama}
                  label={k.label}
                  nilai={nilai[k.nama]}
                  onUbah={ubah}
                  galat={galat[k.nama]}
                  wajib={k.wajib}
                  type={k.jenis === 'whatsapp' ? 'tel' : k.jenis === 'email' ? 'email' : 'text'}
                  inputMode={k.jenis === 'whatsapp' ? 'tel' : undefined}
                  placeholder={k.placeholder}
                  autoComplete={k.autoComplete}
                  batasKetik={batasKetik(k)}
                  inputRef={daftarkanKolom(k.nama)}
                  terkunci={mengirim}
                  sx={sxKolom}
                />
              );
            })}
          </Box>

          {/* Kolom jebakan spam: tak terlihat dan tak terbaca pembaca layar, di luar urutan tab.
              Nama dan atribut sengaja netral agar tidak diisi pengisi otomatis atau pengelola
              kata sandi; bila tetap terisi, formulir tetap dikirim dengan penanda `curiga`. */}
          <Box aria-hidden="true" sx={hanyaPembaca}>
            <label>
              {LABEL_JEBAKAN}
              <input
                type="text"
                name={KOLOM_JEBAKAN}
                value={nilai[KOLOM_JEBAKAN]}
                onChange={(e) => ubah(KOLOM_JEBAKAN, e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                data-1p-ignore="true"
                data-lpignore="true"
                data-bwignore="true"
                data-form-type="other"
              />
            </label>
          </Box>

          <TombolLanding
            type="submit"
            ukuran="xl"
            penuh
            nonaktif={!aktif}
            aria-describedby={aktif ? undefined : nonaktifId}
            aria-disabled={mengirim ? 'true' : undefined}
            onClick={(e) => {
              if (mengirim) e.preventDefault();
            }}
            sx={{
              mt: '22px',
              ...(mengirim
                ? {
                    background: colors.muted,
                    color: colors.white,
                    boxShadow: shadows.tombol,
                    cursor: 'progress',
                    '&:hover': { background: colors.muted },
                  }
                : null),
            }}
          >
            {mengirim && (
              <Box component="span" aria-hidden="true" sx={{ display: 'inline-flex', animation: `${putar} 900ms linear infinite` }}>
                <IconLoader2 size={20} stroke={2.4} />
              </Box>
            )}
            {teksTombol}
          </TombolLanding>

          <Box component="p" sx={{ m: '14px 0 0', textAlign: 'center', fontSize: '12px', lineHeight: 1.6, color: colors.muted }}>
            {T.privasi[jenis]}{' '}
            <Box
              component={RouterLink}
              to={REGISTRI_RUTE.kebijakanPrivasi.to}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: layout.targetSentuh,
                color: colors.accent,
                fontWeight: 600,
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              {T.privasi.tautan}
            </Box>
          </Box>

          {jaminan.length > 0 && (
            <Box
              component="ul"
              role="list"
              sx={{
                ...resetDaftar,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px 18px',
                flexWrap: 'wrap',
                mt: '16px',
                fontSize: '12px',
                color: colors.muted,
              }}
            >
              {jaminan.map((j) => (
                <Box key={j.label} component="li" sx={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                  <j.ikon size={14} stroke={2} aria-hidden="true" style={{ flex: 'none' }} />
                  {j.label}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {PemilihKeadaan && flags.pratinjauTombolAktif && (
        <Suspense fallback={null}>
          <PemilihKeadaan status={status} onPilih={pratinjau} />
        </Suspense>
      )}
    </Box>
  );
}

FormulirKonversi.propTypes = {
  jenis: PropTypes.oneOf(['demo', 'guru']).isRequired,
  judul: PropTypes.string.isRequired,
  tingkatJudul: PropTypes.oneOf(['h2', 'h3']),
  teksKirim: PropTypes.string.isRequired,
  terkirim: PropTypes.shape({ sub: PropTypes.node, langkah: PropTypes.arrayOf(PropTypes.string) }).isRequired,
  jaminan: PropTypes.arrayOf(PropTypes.shape({ ikon: PropTypes.elementType, label: PropTypes.string })),
  pesanWa: PropTypes.string,
  sx: PropTypes.object,
};
