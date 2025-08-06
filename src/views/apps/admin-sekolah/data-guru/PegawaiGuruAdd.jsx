import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import PegawaiGuruForm from "src/apps/admin-sekolah/data-guru/Add/PegawaiGuruForm";

const PegawaiGuruAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Pegawai Guru" description="Tambah Pegawai">
            <ParentCard title="Form Pendaftaran Pegawai Guru">
            <Alerts error={error} success={success}/>
                <PegawaiGuruForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default PegawaiGuruAdd;