import { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchDashboard } from './sgaApi';
import { adaptDashboard, isEmptyDashboard } from './sgaAdapter';

// Hook data Dashboard Kepala Jurusan. Satu endpoint menyuplai seluruh halaman.
// `keepPreviousData` menjaga header/tab tetap tampil saat ganti filter kelas
// (skeleton hanya untuk KPI & panel).
export const useDashboard = (kelasId) => {
  const query = useQuery({
    queryKey: ['kajur-dashboard', kelasId ?? 'all'],
    queryFn: () => fetchDashboard(kelasId),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    retry: 1,
  });

  const raw = query.data;
  const empty = useMemo(() => (raw ? isEmptyDashboard(raw) : false), [raw]);
  const data = useMemo(() => (raw && !empty ? adaptDashboard(raw) : null), [raw, empty]);

  return {
    data,
    isPending: query.isPending,   // load pertama (belum ada data)
    isFetching: query.isFetching, // termasuk refetch saat ganti kelas
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isEmpty: empty,
    emptyMsg: empty ? (raw?.msg ?? 'Data dashboard belum tersedia.') : null,
  };
};
