import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TahunAjaranForm from "src/apps/admin-sekolah/tahun-ajaran/Add/TahunAjaranForm";

const TahunAjaranAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Tahun Ajaran" description="Tambah Tahun Ajaran">
            <ParentCard title="Form Tambah Tahun Ajaran">
                <Alerts error={error} success={success}/>
                <TahunAjaranForm setError={setError} setSuccess={setSuccess}/>
            </ParentCard>
        </PageContainer>
    );
};

export default TahunAjaranAdd;