import PropTypes from 'prop-types';
import { Box, Typography, Chip, Button, Stack, useTheme } from '@mui/material';
import { IconUserBolt, IconTools, IconArrowRight, IconStar, IconAlertTriangle } from '@tabler/icons-react';

const BADGE_CONFIG = {
  KRITIS: { color: '#DC2626', bg: '#FF383C14', label: 'Kritis' },
  SEDANG: { color: '#D97706', bg: '#FF7B0114', label: 'Sedang' },
};

// Unit GAGAL_K3 bukan "kritis biasa", ini blocker keras (siswa tidak
// boleh PKL sampai diulang). Ditandai beda dari KRITIS biasa.
const BADGE_GAGAL_K3 = { color: '#7F1D1D', bg: '#7F1D1D14', label: 'Wajib Ulang - K3' };

// [GABUNGAN] Menggantikan RekomendasiIntervensiCard + versi lama kartu
// ini. Satu sumber data: rekomendasiIntervensi dari backend
// (rencana_pkl.rekomendasi_intervensi, hasil susunRencanaPersiapanPKL).
//
// [PRIORITAS RENDER: DATA, BUKAN LABEL STATUS] hitungAreaCompetency di
// rencana-pkl-service.js selalu mengecek tiap unit satu-satu tanpa
// jalan pintas berdasar status agregat — siswa SIAP_PENUH masih BISA
// punya item competency bermasalah (unit individual LEMAH/KRITIS yang
// tidak sampai memicu override status agregat). Makanya mode kartu
// ditentukan murni oleh items.length, BUKAN oleh profilStatus. Kalau
// ada item (apapun profilStatus-nya), selalu mode Tindak Lanjut Guru.
//
// [BEHAVIOR BISA SEMBUNYI DI BALIK STATUS AGREGAT] hitungAreaBehavior
// sebaliknya PUNYA jalan pintas: begitu status_behavior === 'BAIK', dia
// langsung return kosong tanpa mengecek komponen satu-satu. Skor
// Behavior itu sendiri rata-rata tertimbang (bobot 6 bulan terakhir
// lebih tinggi), jadi agregat bisa BAIK walau satu komponen di bawah
// ambang — komponen itu TIDAK PERNAH muncul di rekomendasiIntervensi
// lewat jalur manapun. Satu-satunya tempat datanya masih utuh adalah
// kekuatan.behavior.detail (beda dari kekuatan.competency.detail yang
// SUDAH difilter status_unit==='MEMENUHI' saja — behavior.detail
// memuat SEMUA komponen apa adanya). Mode Kekuatan Siswa mengecek ulang
// detail itu terhadap ambangBehavior: blanket "semua memenuhi ambang"
// HANYA kalau benar-benar tidak ada yang di bawah, kalau ada, tampilkan
// semua komponen apa adanya (bukan cuma juara 1) supaya yang rendah
// tetap kelihatan.
//
// [BORDER & BADGE STATUS DIHAPUS] cfg (border top + chip status) sudah
// tidak dipakai, dihapus bersama prop statusProfil dan import
// STATUS_PROFIL_CONFIG.
const TindakLanjutGuruCard = ({
  profilStatus,
  rekomendasiIntervensi,
  kekuatan = {},
  ambangBehavior,
  tersedia = true,
  namaSiswa,
  onTindakLanjut,
}) => {
  const theme = useTheme();

  if (!tersedia) return null;

  const items = rekomendasiIntervensi || [];
  const itemBehavior = items.filter((item) => item.tipe === 'BEHAVIOR');
  const itemCompetency = items.filter((item) => item.tipe === 'COMPETENCY');
  const adaBehavior = itemBehavior.length > 0;
  const adaCompetency = itemCompetency.length > 0;
  const modeTindakLanjut = items.length > 0;

  // --- Mode Kekuatan Siswa (dipakai kalau items kosong) ---
  const kekuatanCompetency = kekuatan?.competency;
  const kekuatanBehavior = kekuatan?.behavior;

  // kekuatan.competency.detail sudah pasti bersih (cuma unit MEMENUHI),
  // aman pakai ringkasan langsung, tidak ada yang perlu disembunyikan.
  const daftarKekuatanCompetency = (kekuatanCompetency?.available && !kekuatanCompetency?.kosong)
    ? (kekuatanCompetency.ringkasan || [])
    : [];

  const semuaKomponenBehavior = (kekuatanBehavior?.available && !kekuatanBehavior?.kosong)
    ? (kekuatanBehavior.detail || [])
    : [];
  const ambangNum = Number(ambangBehavior) || 0;
  const komponenBehaviorRendah = semuaKomponenBehavior.filter(
    (k) => k.skor !== null && k.skor !== undefined && k.skor < ambangNum,
  );
  // Ada yang tersembunyi di bawah ambang → tampilkan SEMUA komponen
  // (bukan cuma ringkasan juara 1, yang justru pasti menyembunyikan
  // yang rendah karena diurutkan descending lalu diambil 1 teratas).
  const daftarKekuatanBehavior = komponenBehaviorRendah.length > 0
    ? semuaKomponenBehavior
    : (kekuatanBehavior?.ringkasan || []);

  const adaKekuatanCompetency = daftarKekuatanCompetency.length > 0;
  const adaKekuatanBehavior = daftarKekuatanBehavior.length > 0;
  const semuaBenarBenarHijau = komponenBehaviorRendah.length === 0;

  // Tidak ada apapun untuk ditampilkan — jangan klaim apapun, render
  // kosong daripada memaksakan kalimat positif tanpa data pendukung.
  if (!modeTindakLanjut && !adaKekuatanCompetency && !adaKekuatanBehavior) return null;

  const handleClick = (payload) => {
    if (typeof onTindakLanjut === 'function') {
      onTindakLanjut({ ...payload, profilStatus, namaSiswa });
    }
  };

  return (
    <Box sx={{ p: 2.5, borderRadius: '10px', backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[1] }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.3 }}>
        {modeTindakLanjut ? 'Rekomendasi Intervensi ke Guru' : 'Kekuatan Siswa'}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 2 }}>
        {modeTindakLanjut
          ? 'Dihasilkan oleh sistem, arahkan penuntasan kekurangan siswa ke guru yang bersangkutan'
          : 'Dihasilkan oleh sistem, bekal utama siswa menuju PKL'}
      </Typography>

      {modeTindakLanjut ? (
        <>
          {adaBehavior && (
            <Box sx={{ mb: adaCompetency ? 2 : 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '8px', backgroundColor: '#FF7B0114', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconUserBolt size={16} color="#FF7B01" />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={700}>Pembinaan Perilaku</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Wali Kelas / Guru BK</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 2, rowGap: 0.8, mb: 1.2 }}>
                {itemBehavior.map((item) => (
                  <Box key={item.komponen} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 600 }}>{item.label}</Typography>
                    <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 700 }}>
                      {item.skor !== null && item.skor !== undefined ? Math.round(item.skor) : '-'}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {itemBehavior.some((item) => item.rekomendasi) && (
                <Box sx={{ p: 1.2, borderRadius: '8px', backgroundColor: '#FF7B0114', mb: 1.2 }}>
                  {itemBehavior.filter((item) => item.rekomendasi).map((item) => (
                    <Typography key={item.komponen} variant="body2" sx={{ mb: 0.5, '&:last-child': { mb: 0 } }}>
                      <strong>{item.label}</strong> - {item.rekomendasi}
                    </Typography>
                  ))}
                </Box>
              )}

              <Button
                fullWidth
                variant="outlined"
                size="small"
                endIcon={<IconArrowRight size={16} />}
                onClick={() => handleClick({
                  jenis: 'behavior',
                  target: 'WALI_KELAS_BK',
                  targetLabel: 'Wali Kelas / Guru BK',
                  komponen: itemBehavior.map((item) => item.komponen),
                })}
                sx={{
                  color: '#D97706',
                  borderColor: '#FF7B0155',
                  '&:hover': { color: '#D97706', borderColor: '#FF7B01', backgroundColor: '#FF7B010A' },
                }}
              >
                Tindak Lanjut ke Wali Kelas / BK
              </Button>
            </Box>
          )}

          {adaCompetency && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '8px', backgroundColor: '#2388FF14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconTools size={16} color="#2388FF" />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={700}>Penguatan Kompetensi</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Guru Produktif pengampu unit</Typography>
                </Box>
              </Box>

              <Stack spacing={1}>
                {itemCompetency.map((item) => {
                  const gagalK3 = item.sebab === 'GAGAL_K3';
                  const badgeCfg = gagalK3 ? BADGE_GAGAL_K3 : (BADGE_CONFIG[item.badge] || BADGE_CONFIG.SEDANG);
                  return (
                    <Box
                      key={item.kode_unit}
                      sx={{
                        p: 1.2,
                        borderRadius: '8px',
                        backgroundColor: badgeCfg.bg,
                        border: gagalK3 ? `1px solid ${badgeCfg.color}66` : 'none',
                      }}
                    >
                      {gagalK3 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
                          <IconAlertTriangle size={14} color={badgeCfg.color} />
                          <Typography variant="caption" sx={{ color: badgeCfg.color, fontWeight: 700 }}>
                            Syarat wajib sebelum PKL, bukan sekadar penguatan
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                        <Box sx={{ minWidth: 0, pr: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>{item.kode_unit}</Typography>
                          <Typography variant="body2" fontWeight={700}>{item.judul_unit}</Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={gagalK3 ? badgeCfg.label : `${badgeCfg.label} · ${item.skor !== null && item.skor !== undefined ? Math.round(item.skor) : '-'}`}
                          sx={{ backgroundColor: badgeCfg.color, color: '#fff', fontWeight: 700, fontSize: '0.66rem', height: 22, flexShrink: 0 }}
                        />
                      </Box>
                      {item.rekomendasi && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.2 }}>
                          {item.rekomendasi}
                        </Typography>
                      )}
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        endIcon={<IconArrowRight size={16} />}
                        onClick={() => handleClick({
                          jenis: 'competency',
                          target: 'GURU_PRODUKTIF',
                          targetLabel: 'Guru Produktif',
                          kodeUnit: item.kode_unit,
                          judulUnit: item.judul_unit,
                          statusUnit: item.status_unit,
                        })}
                        sx={{
                          color: badgeCfg.color,
                          borderColor: `${badgeCfg.color}55`,
                          '&:hover': { color: badgeCfg.color, borderColor: badgeCfg.color, backgroundColor: `${badgeCfg.color}0A` },
                        }}
                      >
                        Tindak Lanjut ke Guru Produktif
                      </Button>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}
        </>
      ) : (
        <>
          {semuaBenarBenarHijau ? (
            <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: '#34C75914', mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#059669', fontWeight: 600 }}>
                Seluruh unit kompetensi dan komponen behavior sudah memenuhi ambang.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: '#FF7B0114', mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#D97706', fontWeight: 600 }}>
                Status keseluruhan Siap Penuh, tapi ada komponen behavior yang masih di bawah ambang - lihat rincian di bawah.
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '8px', backgroundColor: '#34C75914', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconStar size={16} color="#059669" />
            </Box>
            <Typography variant="body2" fontWeight={700}>Unit dan komponen siswa ini</Typography>
          </Box>

          {adaKekuatanCompetency && (
            <Box sx={{ mb: adaKekuatanBehavior ? 2 : 0 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>Unit Kompetensi</Typography>
              <Stack spacing={1}>
                {daftarKekuatanCompetency.map((unit) => (
                  <Box key={unit.kode_unit} sx={{ p: 1.2, borderRadius: '8px', backgroundColor: '#34C75914' }}>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>{unit.kode_unit}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={700}>{unit.judul_unit}</Typography>
                      <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, flexShrink: 0 }}>
                        {Math.round(unit.ketercapaian_unit)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {adaKekuatanBehavior && (
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>Komponen Behavior</Typography>
              <Stack spacing={1}>
                {daftarKekuatanBehavior.map((k) => {
                  const rendah = k.skor !== null && k.skor !== undefined && k.skor < ambangNum;
                  return (
                    <Box
                      key={k.komponen}
                      sx={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        p: 1.2, borderRadius: '8px',
                        backgroundColor: rendah ? '#FF383C14' : '#34C75914',
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} sx={{ color: rendah ? '#DC2626' : 'text.primary' }}>
                        {k.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: rendah ? '#DC2626' : '#059669', fontWeight: 700 }}>
                        {Math.round(k.skor)}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

TindakLanjutGuruCard.propTypes = {
  profilStatus: PropTypes.string,
  rekomendasiIntervensi: PropTypes.array,
  kekuatan: PropTypes.object,
  ambangBehavior: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  tersedia: PropTypes.bool,
  namaSiswa: PropTypes.string,
  onTindakLanjut: PropTypes.func,
};

export default TindakLanjutGuruCard;