import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';

// Opsi semester ajaran + semester terpilih yang disimpan di query string (?semester=<id>),
// supaya pilihan bertahan saat refresh dan bisa dibagikan. Default: semester aktif dari server.
// `apiBase` = WAKA_API atau GURU_API (endpoint referensi disediakan per portal).
export const useSemesterTerpilih = (apiBase) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: options = [], isLoading, isError } = useQuery({
    queryKey: ['perangkat-ajar-semester-options', apiBase],
    queryFn: async () => {
      const res = await axiosInstance.get(`${apiBase}/referensi/semester`);
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const dariUrl = searchParams.get('semester');
  // Default = semester ber-is_aktif, bukan elemen pertama: urutan "terbaru dulu" bisa menaruh
  // semester masa depan yang belum aktif di atas.
  const semesterAktif = options.find((s) => s.is_aktif) || options[0];
  const semesterId = dariUrl && options.some((s) => s.id === dariUrl) ? dariUrl : semesterAktif?.id || null;
  const semesterTerpilih = options.find((s) => s.id === semesterId) || null;
  // Semester tidak aktif = arsip baca-saja (server menolak aksi tulis dengan 409).
  const isArsip = Boolean(semesterTerpilih) && !semesterTerpilih.is_aktif;

  const setSemesterId = useCallback(
    (id) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id) next.set('semester', id);
          else next.delete('semester');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { options, semesterId, semesterTerpilih, isArsip, setSemesterId, isLoading, isError };
};

/** "Ganjil 2026/2027". Server mengirim `label` bila ada; selain itu dirakit dari field mentah. */
export const labelSemester = (s) =>
  s?.label || [s?.nama_semester || s?.semester, s?.tahun_ajaran?.nama || s?.nama_tahun_ajaran].filter(Boolean).join(' ') || '-';
