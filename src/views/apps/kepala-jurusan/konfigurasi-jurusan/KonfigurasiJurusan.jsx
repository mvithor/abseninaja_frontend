import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import KonfigurasiJurusanForm from "src/apps/kepala-jurusan/konfigurasi-jurusan/KonfigurasiJurusanForm";

const KonfigurasiJurusan = () => {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  return (
    <PageContainer title="Pengaturan Penilaian" description="Konfigurasi Ambang Penilaian Jurusan">
      <ParentCard title="Pengaturan Penilaian">
        <Alerts error={error} success={success} />
        <KonfigurasiJurusanForm setSuccess={setSuccess} setError={setError} />
      </ParentCard>
    </PageContainer>
  );
};

export default KonfigurasiJurusan;