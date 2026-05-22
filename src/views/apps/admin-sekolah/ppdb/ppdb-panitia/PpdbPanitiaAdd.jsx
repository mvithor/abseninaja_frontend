import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahPpdbPanitiaForm from "src/apps/admin-sekolah/ppdb/ppdb-panitia/PpdbPanitiaForm";

const PpdbPanitiaAdd = () => {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  return (
    <PageContainer title="Tambah Petugas PMB" description="Tambah Petugas PMB">
      <ParentCard title="Form Tambah Petugas PMB">
        <Alerts error={error} success={success} />
        <TambahPpdbPanitiaForm setSuccess={setSuccess} setError={setError} />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbPanitiaAdd;
