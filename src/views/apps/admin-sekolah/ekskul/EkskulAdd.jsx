import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahEkskulForm from "src/apps/admin-sekolah/ekskul/Add/EkskulForm";

const EkskulAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Ekstrakurikuler" description="Tambah Ekstrakurikuler">
            <ParentCard title="Form Tambah Ekstrakurikuler">
                <Alerts error={error} success={success}/>
                <TambahEkskulForm setError={setError} setSuccess={setSuccess}/>
            </ParentCard>
        </PageContainer>
    );
};

export default EkskulAdd;