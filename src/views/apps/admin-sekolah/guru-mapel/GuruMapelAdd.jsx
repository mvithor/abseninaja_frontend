import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahGuruMapelForm from "src/apps/admin-sekolah/guru-mapel/Add/GuruMapelForm";

const GuruMapelAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Guru Mata Peljaran" description="Tambah Guru Mata Pelajaran">
            <ParentCard title="Form Tambah Guru Mata Pelajaran">
                <Alerts error={error} success={success}/>
                <TambahGuruMapelForm setError={setError} setSuccess={setSuccess}/>
            </ParentCard>
        </PageContainer>
    );
};

export default GuruMapelAdd;