import {
  isKunciDibuka,
  statusUnggah,
  STATUS_PERANGKAT,
} from 'src/components/perangkat-ajar/perangkatAjarConfig';

// Ringkasan perangkat ajar guru untuk dashboard, dihitung dari respons GET /guru/perangkat-ajar
// (data yang sama dengan halaman Perangkat Ajar Saya, berbagi cache TanStack Query).
export const ringkasPerangkatSaya = (penugasanList, now = new Date()) => {
  const jumlah = { total: 0, disetujui: 0, menunggu_validasi: 0, perlu_revisi: 0, belum_unggah: 0, terkunci: 0 };
  const perluTindakan = [];
  const deadlinePerJenis = new Map();

  penugasanList.forEach((penugasan) => {
    (penugasan.dokumen || []).forEach((dokumen) => {
      const { bisaUnggah, terkunci } = statusUnggah(dokumen, now);
      jumlah.total += 1;
      jumlah[dokumen.status] = (jumlah[dokumen.status] || 0) + 1;
      if (terkunci) jumlah.terkunci += 1;

      if (bisaUnggah) {
        perluTindakan.push({
          penugasan,
          dokumen,
          // Revisi paling mendesak, lalu dokumen yang kuncinya sedang dibuka Waka, lalu belum unggah.
          prioritas:
            dokumen.status === STATUS_PERANGKAT.PERLU_REVISI ? 0 : isKunciDibuka(dokumen, now) ? 1 : 2,
          batas: new Date(isKunciDibuka(dokumen, now) ? dokumen.kunci_dibuka.sampai : dokumen.deadline || 8.64e15).getTime(),
        });
      }

      const waktuDeadline = dokumen.deadline ? new Date(dokumen.deadline).getTime() : null;
      if (waktuDeadline && waktuDeadline > now.getTime()) {
        const kode = dokumen.jenis?.kode;
        const entri = deadlinePerJenis.get(kode) || { jenis: dokumen.jenis, deadline: dokumen.deadline, waktu: waktuDeadline, sisa: 0, total: 0 };
        entri.total += 1;
        if (bisaUnggah) entri.sisa += 1;
        deadlinePerJenis.set(kode, entri);
      }
    });
  });

  perluTindakan.sort((a, b) => a.prioritas - b.prioritas || a.batas - b.batas);

  return {
    jumlah,
    persenTerunggah: jumlah.total ? Math.round(((jumlah.total - jumlah.belum_unggah) / jumlah.total) * 100) : 0,
    persenDisetujui: jumlah.total ? Math.round((jumlah.disetujui / jumlah.total) * 100) : 0,
    perluTindakan,
    deadlineMendatang: [...deadlinePerJenis.values()].sort((a, b) => a.waktu - b.waktu),
  };
};
