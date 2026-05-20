import { useState } from "react";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import TambahPpdbTestComponentForm from "src/apps/admin-sekolah/ppdb/ppdb-test-component/PpdbTesComponentForm";

const PpdbTestComponentAdd = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <PageContainer title="Tambah Komponen Tes PMB" description="Tambah Komponen Tes PMB">
      <ParentCard title="Tambah Komponen Tes PMB">
        <Alerts error={error} success={success} />
        <TambahPpdbTestComponentForm setSuccess={setSuccess} setError={setError} />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbTestComponentAdd;