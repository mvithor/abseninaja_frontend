import { useState } from "react";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import TambahPpdbTrackForm from "src/apps/admin-sekolah/ppdb/ppdb-track/PpdbTrackForm";

const PpdbTrackAdd = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <PageContainer title="Tambah Jalur Pendaftaran PMB" description="Tambah Jalur Pendaftaran PMB">
      <ParentCard title="Tambah Jalur Pendaftaran PMB">
        <Alerts error={error} success={success} />
        <TambahPpdbTrackForm setSuccess={setSuccess} setError={setError} />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbTrackAdd;
