import { useState } from "react";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import TambahPpdbJadwalTahapanForm from "src/apps/admin-sekolah/ppdb/ppdb-jadwal-tahapan/PpdbJadwalTahapanForm";

const PpdbJadwalTahapanAdd = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <PageContainer title="Tambah Jadwal Tahapan PPDB" description="Tambah Jadwal Tahapan PPDB">
      <ParentCard title="Tambah Jadwal Tahapan PPDB">
        <Alerts error={error} success={success} />
        <TambahPpdbJadwalTahapanForm setError={setError} setSuccess={setSuccess} />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbJadwalTahapanAdd;
