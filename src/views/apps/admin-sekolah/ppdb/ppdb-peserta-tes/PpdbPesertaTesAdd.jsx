import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import AssignPpdbTestParticipantForm from "src/apps/admin-sekolah/ppdb/ppdb-peserta-tes/PpdbPesertaTesForm";

const PpdbPesertaTesAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Peserta Tes" description="Tambah Peserta Tes">
            <ParentCard title="Form Tambah Peserta Tes">
                <Alerts error={error} success={success}/>
                <AssignPpdbTestParticipantForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default PpdbPesertaTesAdd;