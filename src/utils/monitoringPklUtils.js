export const JALUR_LABEL = { REKOMENDASI: 'Rekomendasi', OVERRIDE_MANUAL: 'Override Manual' };

export const DRIFT_LABEL_STYLE = {
  MEMBURUK: { color: '#EF4444', label: 'Memburuk' },
  MEMBAIK: { color: '#16A34A', label: 'Membaik' },
  BERUBAH: { color: '#F59E0B', label: 'Berubah' },
};

export const formatTanggal = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};