import { useState } from "react";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import TambahPpdbWaveTrackForm from "src/apps/admin-sekolah/ppdb/ppdb-wave-track/PpdbWaveTrackForm";

const PpdbWaveTrackAdd = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <PageContainer title="Tambah Jalur per Gelombang PMB" description="Tambah Jalur per Gelomban PMB">
      <ParentCard title="Tambah Jalur per Gelombang PMB">
        <Alerts error={error} success={success} />
        <TambahPpdbWaveTrackForm setError={setError} setSuccess={setSuccess} />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbWaveTrackAdd;
