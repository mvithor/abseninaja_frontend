import { useState } from "react";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import TambahPpdbWaveTrackTestRequirementForm from "src/apps/admin-sekolah/ppdb/ppdb-wave-track-requirement/PpdbWaveTrackRequirementForm";

const PpdbWaveTrackRequirementAdd = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <PageContainer title="Tambah Persyaratan Tes PMB" description="Tambah Persyaratan Tes PMB">
      <ParentCard title="Tambah Persyaratan Tes PMB">
        <Alerts error={error} success={success} />
        <TambahPpdbWaveTrackTestRequirementForm setSuccess={setSuccess} setError={setError} />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbWaveTrackRequirementAdd;