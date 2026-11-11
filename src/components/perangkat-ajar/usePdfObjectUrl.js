import { useEffect, useState } from 'react';
import { ambilFileBlob, pesanGalatFile } from './perangkatAjarApi';

// Memuat PDF terlindungi token sebagai object URL untuk <iframe>.
// Object URL dicabut saat `aktif` jadi false, file berganti, atau komponen dilepas.
export const usePdfObjectUrl = (fileUrl, aktif = true) => {
  const [objectUrl, setObjectUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!aktif || !fileUrl) return undefined;

    let dibatalkan = false;
    let urlDibuat = null;
    setIsLoading(true);
    setError('');

    ambilFileBlob(fileUrl)
      .then(({ blob }) => {
        if (dibatalkan) return;
        urlDibuat = URL.createObjectURL(blob);
        setObjectUrl(urlDibuat);
      })
      .catch(async (err) => {
        const pesan = await pesanGalatFile(err, 'File tidak dapat dimuat. Silakan coba lagi.');
        if (!dibatalkan) setError(pesan);
      })
      .finally(() => {
        if (!dibatalkan) setIsLoading(false);
      });

    return () => {
      dibatalkan = true;
      if (urlDibuat) URL.revokeObjectURL(urlDibuat);
      setObjectUrl(null);
    };
  }, [aktif, fileUrl]);

  return { objectUrl, isLoading, error };
};
