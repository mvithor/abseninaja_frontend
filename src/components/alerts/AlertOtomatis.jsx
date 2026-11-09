import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@mui/material';
import { DURASI_ALERT } from 'src/hooks/useAutoHide';

/**
 * Alert MUI biasa yang menutup dirinya sendiri lewat `onTutup` untuk pesan sukses dan galat, karena pemilik
 * state-nya yang harus mengosongkannya. Pesan info dan peringatan (petunjuk langkah berikutnya) tidak hilang sendiri
 * kecuali `durasi` diberikan. Penampilannya sama dengan <Alert> lain di aplikasi.
 *
 * - `pemicu`: nilai yang berubah tiap pesan baru (mis. objek pesan) supaya hitung mundur mulai ulang walau
 *   komponen tidak dilepas dulu. Bawaannya `children`.
 * - Hitung mundur berhenti selama kursor atau fokus berada di alert.
 * - `tombolTutup` menampilkan tombol X, supaya guru tetap bisa menutup lebih cepat.
 */
export default function AlertOtomatis({
  severity = 'info', onTutup, durasi, pemicu, tombolTutup = false, children, ...sisa
}) {
  const [ditahan, setDitahan] = useState(false);
  const ms = durasi ?? DURASI_ALERT[severity] ?? 0;
  // onTutup biasanya fungsi baru tiap render; lewat ref supaya hitung mundur tidak mulai ulang karenanya.
  const tutupRef = useRef(onTutup);
  tutupRef.current = onTutup;
  const kunci = pemicu ?? (typeof children === 'string' ? children : null);

  useEffect(() => {
    if (!ms || ditahan) return undefined;
    const t = setTimeout(() => tutupRef.current?.(), ms);
    return () => clearTimeout(t);
  }, [ms, ditahan, kunci]);

  return (
    <Alert
      severity={severity}
      onClose={tombolTutup ? onTutup : undefined}
      onMouseEnter={() => setDitahan(true)}
      onMouseLeave={() => setDitahan(false)}
      onFocus={() => setDitahan(true)}
      onBlur={() => setDitahan(false)}
      {...sisa}
    >
      {children}
    </Alert>
  );
}

AlertOtomatis.propTypes = {
  severity: PropTypes.oneOf(['success', 'info', 'warning', 'error']),
  onTutup: PropTypes.func.isRequired,
  durasi: PropTypes.number,
  pemicu: PropTypes.any,
  tombolTutup: PropTypes.bool,
  children: PropTypes.node,
};
