import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { KUNCI_KANTIN } from './kantin';
import { ambilProfilKantin } from './api';

// Profil unit kantin terikat ke akun yang sedang login (userId di queryKey mencegah cache bocor lintas sesi).
export const useKonteksKantin = () => {
  const userId = useSelector((state) => state.user.userId);
  return useQuery({
    queryKey: [KUNCI_KANTIN.profil, userId],
    queryFn: ambilProfilKantin,
    staleTime: 30_000,
    retry: false,
  });
};
