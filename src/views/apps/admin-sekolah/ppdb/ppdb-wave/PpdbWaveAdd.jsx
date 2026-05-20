import { useState } from "react";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import TambahPpdbWaveForm from "src/apps/admin-sekolah/ppdb/ppdb-wave/PpdbWaveForm";

const TambahPpdbWave = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <PageContainer title="Tambah Gelombang PMB" description="Tambah Gelombang PMB">
      <ParentCard title="Tambah Gelombang PMB">
        <Alerts error={error} success={success} />
        <TambahPpdbWaveForm setError={setError} setSuccess={setSuccess} />
      </ParentCard>
    </PageContainer>
  );
};

export default TambahPpdbWave;
