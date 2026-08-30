import { useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';

const TZ_LABEL = {
  'Asia/Jakarta': 'WIB',
  'Asia/Makassar': 'WITA',
  'Asia/Jayapura': 'WIT',
};

/**
 * Mengembalikan timezone sekolah yang aktif dari Redux.
 * Fallback: decode langsung dari accessToken jika field belum ada di state (state lama dari persist).
 */
export const useSchoolTimezone = () => {
  return useSelector((s) => {
    if (s.user.timezone_sekolah) return s.user.timezone_sekolah;
    if (s.user.accessToken) {
      try {
        const decoded = jwtDecode(s.user.accessToken);
        return decoded.timezone_sekolah || 'Asia/Jakarta';
      } catch {
        return 'Asia/Jakarta';
      }
    }
    return 'Asia/Jakarta';
  });
};

export { TZ_LABEL };
