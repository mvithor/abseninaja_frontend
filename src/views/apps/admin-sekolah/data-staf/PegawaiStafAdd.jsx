import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import PegawaiStafForm from "src/apps/admin-sekolah/data-staf/Add/PegawaiStafForm";

const PegawaiStaffAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Pegawai Staf" description="Tambah Pegawai Staf">
            <ParentCard title="Form Pendaftaran Pegawai Staf">
            <Alerts error={error} success={success}/>
                <PegawaiStafForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default PegawaiStaffAdd;