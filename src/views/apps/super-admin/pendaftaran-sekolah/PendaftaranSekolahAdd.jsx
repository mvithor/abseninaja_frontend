import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import PendaftaranSekolahForm from "src/apps/super-admin/pendaftaran-sekolah/Add/PendaftaranSekolahForm";

const PendaftaranSekolahAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Pendaftaran Sekolah" description="Tambah Pendaftaran Sekolah">
            <Alerts error={error} success={success}/>
            <ParentCard title="Form Pendaftaran Sekolah">
                <PendaftaranSekolahForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default PendaftaranSekolahAdd;