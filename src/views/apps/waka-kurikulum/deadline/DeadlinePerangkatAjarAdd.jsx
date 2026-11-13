import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import DeadlinePerangkatAjarForm from "src/apps/waka-kurikulum/deadline/Add/DeadlinePerangkatAjarForm";

const DeadlinePerangkatAjarAdd = () => {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  return (
    <PageContainer title="Tambah Deadline" description="Tambah Deadline Pengumpulan Perangkat Ajar">
      <ParentCard title="Form Tambah Deadline Perangkat Ajar">
        <Alerts error={error} success={success} />
        <DeadlinePerangkatAjarForm setError={setError} setSuccess={setSuccess} />
      </ParentCard>
    </PageContainer>
  );
};

export default DeadlinePerangkatAjarAdd;
