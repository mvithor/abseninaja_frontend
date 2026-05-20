import { useState } from "react";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import TambahPpdbSesiJadwalForm from "src/apps/admin-sekolah/ppdb/ppdb-sesi-jadwal/PpdbSesiJadwalForm";

const PpdbSesiJadwalAdd = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <PageContainer title="Tambah Sesi dan Jadwal Tes PMB" description="Tambah Sesi dan Jadwal Tes PMB">
      <ParentCard title="Tambah Sesi dan Jadwal Tes PMB">
        <Alerts error={error} success={success} />
        <TambahPpdbSesiJadwalForm setSuccess={setSuccess} setError={setError} />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbSesiJadwalAdd;