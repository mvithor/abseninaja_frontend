import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert, Box, Button, CircularProgress, Link, Stack, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconArrowLeft } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import useAksesLad from 'src/apps/guru-lad/useAksesLad';
import {
  bacaEvaluasi, bacaMasukan, bacaSaranSiswa, kunciLad, pesanGalat,
} from 'src/apps/guru-lad/api';
import PilKode from 'src/apps/guru-lad/evaluasi/PilKode';
import { siapkanKonteks, susunRincian } from 'src/apps/guru-lad/evaluasi/matriks';
import { URUTAN_PRIORITAS } from 'src/apps/guru-lad/evaluasi/penjelasan';
import ProfilSiswa from 'src/apps/guru-lad/profil/ProfilSiswa';
import SaranTindakLanjut from 'src/apps/guru-lad/saran/SaranTindakLanjut';
import RemedialDialog from 'src/apps/guru-lad/remedial/RemedialDialog';
import TemaLad from 'src/apps/guru-lad/gaya/TemaLad';
import { gayaKartu, warnaRingkasan } from 'src/apps/guru-lad/ringkasan/gayaRingkasan';

/**
 * Profil satu siswa di satu kelas LAD: bukti dari data kelas, lalu saran tindak lanjut per penanda.
 * Halaman ini hanya membaca dan menyusun tampilan; penanda dan draf saran dihitung server.
 */
export default function LadSiswa() {
  const { kelasId, siswaId } = useParams();
  const idSiswa = Number(siswaId);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const akses = useAksesLad();
  const w = warnaRingkasan(useTheme());
  const [remedialAwal, setRemedialAwal] = useState(null);
  const lokasi = useLocation();
  // Dari Ringkasan, kembali ke Ringkasan; dari tab Perlu Perhatian (atau tanpa keterangan), kembali ke tab itu.
  const asal = lokasi.state?.dari === 'ringkasan' ? 'ringkasan' : 'perhatian';
  const balik = () => navigate(`/dashboard/guru-lad/kelas/${kelasId}`, { state: { tab: asal } });

  const masukan = useQuery({
    queryKey: kunciLad.masukan(kelasId), queryFn: () => bacaMasukan(kelasId), enabled: akses.boleh, retry: false,
  });
  const evaluasi = useQuery({
    queryKey: kunciLad.evaluasi(kelasId), queryFn: () => bacaEvaluasi(kelasId), enabled: akses.boleh, retry: false,
  });
  const saran = useQuery({
    queryKey: kunciLad.saranSiswa(kelasId, idSiswa),
    queryFn: () => bacaSaranSiswa(kelasId, idSiswa),
    enabled: akses.boleh && Number.isInteger(idSiswa),
    retry: false,
  });

  const data = masukan.data;
  const siswa = data?.siswa.find((s) => s.id === idSiswa) ?? null;
  const hasil = evaluasi.data?.hasil.find((h) => h.siswa_id === idSiswa) ?? null;
  const konteks = useMemo(() => (data ? siapkanKonteks({
    nilaiTp: data.nilai_tp, nilaiProyek: data.nilai_proyek, remedial: data.remedial, kehadiran: data.kehadiran, pertemuan: data.pertemuan, siswa: data.siswa,
  }) : null), [data]);
  const ctxPenjelasan = useMemo(
    () => ({ lm: data?.lm ?? [], parameter: evaluasi.data?.parameter ?? {} }),
    [data, evaluasi.data],
  );
  const rincian = useMemo(
    () => (hasil && konteks ? susunRincian(hasil, ctxPenjelasan, konteks, Number(data.kelas.kktp)) : null),
    [hasil, konteks, ctxPenjelasan, data],
  );

  const muatUlang = () => {
    qc.invalidateQueries({ queryKey: kunciLad.masukan(kelasId) });
    qc.invalidateQueries({ queryKey: kunciLad.daftarKelas });
  };

  if (akses.memuat || (akses.boleh && (masukan.isLoading || evaluasi.isLoading))) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={28} /></Box>;
  }
  if (!akses.boleh) {
    return (
      <PageContainer title="Analitik Pembelajaran" description="Profil siswa">
        <Alert severity="info">{akses.pesan ?? 'Fitur Analitik Pembelajaran belum tersedia untuk akun ini.'}</Alert>
      </PageContainer>
    );
  }
  const galat = masukan.error ?? evaluasi.error;
  if (galat) {
    return (
      <PageContainer title="Profil siswa | Analitik Pembelajaran" description="Profil siswa">
        <Alert severity={galat.response?.status === 404 ? 'warning' : 'error'} action={<Button onClick={() => navigate('/dashboard/guru-lad')}>Kembali</Button>}>
          {galat.response?.status === 404 ? 'Kelas tidak ditemukan.' : pesanGalat(galat)}
        </Alert>
      </PageContainer>
    );
  }
  if (!siswa) {
    return (
      <PageContainer title="Profil siswa | Analitik Pembelajaran" description="Profil siswa">
        <Alert severity="warning" action={<Button onClick={balik}>Kembali</Button>}>Siswa tidak ditemukan di kelas ini.</Alert>
      </PageContainer>
    );
  }

  const { kelas, lm, proyek } = data;
  const readOnly = kelas.jenis !== 'NYATA';
  const ambang = { ambang_bagian: kelas.ambang_bagian, kktp: kelas.kktp, ambang_pengayaan: kelas.ambang_pengayaan };
  const penanda = hasil ? [...hasil.penanda].sort((x, y) => URUTAN_PRIORITAS.indexOf(x) - URUTAN_PRIORITAS.indexOf(y)) : [];

  return (
    <TemaLad>
    <PageContainer title={`${siswa.nama} | Analitik Pembelajaran`} description="Profil siswa dan saran tindak lanjut">
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5, maxWidth: 1180, mx: 'auto' }}>
        <Button startIcon={<IconArrowLeft size={18} />} onClick={balik}>{`${asal === 'ringkasan' ? 'Ringkasan' : 'Perlu Perhatian'}, ${kelas.nama_kelas} · ${kelas.mapel}`}</Button>
      </Stack>

      <Stack spacing={3} sx={{ maxWidth: 1180, mx: 'auto', minWidth: 0, width: '100%' }}>
        <Box sx={{ ...gayaKartu(w), p: { xs: 2, md: 3 } }}>
          <Typography sx={{ fontSize: '0.9375rem', color: w.sekunder }}>{`No absen ${siswa.urutan} · ${kelas.nama_kelas} · ${kelas.mapel} · ${kelas.semester} ${kelas.tahun_ajaran}`}</Typography>
          <Typography component="h1" sx={{ fontSize: { xs: '1.625rem', md: '1.875rem' }, lineHeight: 1.3, fontWeight: 700, color: w.ink, mb: 1.5 }}>{siswa.nama}</Typography>
          {penanda.length > 0 ? (
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mb: 1.5 }}>
              {penanda.map((k) => <PilKode key={k} kode={k} panjang />)}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {evaluasi.data ? 'Tidak ada penanda yang memicu untuk siswa ini.' : 'Penanda belum dapat dimuat.'}
            </Typography>
          )}
          {penanda.length > 1 && (
            <Typography variant="body2" color="text.secondary">
              Beberapa penanda muncul bersamaan. Sistem tidak menyimpulkan hubungan di antaranya; keterkaitannya dinilai guru.
            </Typography>
          )}
          {rincian && rincian.belumCukup.length > 0 && (
            <Alert severity="info" icon={false} sx={{ mt: 1.5 }}>
              <Typography variant="body2" fontWeight={600}>Sebagian penanda belum dapat dinilai karena datanya belum cukup. Ini bukan berarti siswa aman.</Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {rincian.belumCukup.map((x) => (
                  <Typography key={x.kode} component="li" variant="body2">{`${x.kode} ${x.judul}: ${x.alasan || `butuh ${x.butuh}`}`}</Typography>
                ))}
              </Box>
            </Alert>
          )}
          {readOnly && <Alert severity="info" sx={{ mt: 1.5 }}>Kelas kasus hanya dapat dilihat, tidak dapat diubah.</Alert>}
          <Link href="#bagian-saran" underline="always" sx={{ display: 'inline-block', mt: 2, fontSize: '1rem', color: w.tautan, py: 0.75 }}>Lompat ke saran tindak lanjut</Link>
        </Box>

        <ProfilSiswa
          kelas={kelas}
          siswa={siswa}
          hasil={hasil}
          lm={lm}
          proyek={proyek}
          ctx={konteks}
          ambang={ambang}
          semuaSiswaId={data.siswa.map((s) => s.id)}
          parameter={evaluasi.data?.parameter}
        />

        <Box component="section" aria-labelledby="bagian-saran-judul" id="bagian-saran" sx={{ ...gayaKartu(w), p: { xs: 2, md: 3 } }}>
          <Typography id="bagian-saran-judul" component="h2" sx={{ fontSize: { xs: '1.125rem', md: '1.25rem' }, fontWeight: 700, lineHeight: '1.75rem', color: w.ink, mb: 0.5 }}>Saran tindak lanjut</Typography>
          <Typography sx={{ fontSize: '1rem', lineHeight: '1.5rem', color: w.sekunder, mb: 2.5 }}>
            Draf disusun dari bukti di atas. Guru yang memutuskan: pakai, ubah, atau abaikan.
          </Typography>
          {saran.isLoading && <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>}
          {saran.error && (
            <Alert severity="error" action={<Button onClick={() => saran.refetch()} disabled={saran.isFetching}>Coba lagi</Button>}>
              {pesanGalat(saran.error, 'Saran belum dapat dimuat.')}
            </Alert>
          )}
          {saran.data && (
            <SaranTindakLanjut
              kelasId={kelasId}
              siswa={siswa}
              data={saran.data}
              hasil={hasil}
              ctxPenjelasan={ctxPenjelasan}
              readOnly={readOnly}
              onCatatRemedial={readOnly ? undefined : setRemedialAwal}
            />
          )}
        </Box>
      </Stack>

      {!readOnly && (
        <RemedialDialog
          buka={remedialAwal !== null}
          awal={remedialAwal ?? undefined}
          kelasId={kelasId}
          kelas={kelas}
          siswa={data.siswa}
          lm={lm}
          nilaiTp={data.nilai_tp}
          remedial={data.remedial}
          hariIni={data.waktu_sekolah?.hari_ini}
          onBerubah={muatUlang}
          onTutup={() => setRemedialAwal(null)}
        />
      )}
    </PageContainer>
    </TemaLad>
  );
}
