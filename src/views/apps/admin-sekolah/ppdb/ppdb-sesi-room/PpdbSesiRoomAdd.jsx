import { useState } from "react";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import TambahPpdbSesiRoomForm from "src/apps/admin-sekolah/ppdb/ppdb-sesi-room/PpdbSesiRoomForm";

const PpdbSesiRoomAdd = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <PageContainer title="Tambah Sesi Ruangan" description="Tambah Sesi Ruangan">
      <ParentCard title="Form Tambah Sesi Ruangan">
        <Alerts error={error} success={success} />
        <TambahPpdbSesiRoomForm setError={setError} setSuccess={setSuccess} />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbSesiRoomAdd;
