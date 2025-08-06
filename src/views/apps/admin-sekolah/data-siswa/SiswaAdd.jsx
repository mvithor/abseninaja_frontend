import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahSiswaForm from "src/apps/admin-sekolah/data-siswa/Add/SiswaForm";

const SiswaAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Siswa" description="Tambah Siswa">
            <ParentCard title="Form Tambah Siswa">
                <Alerts error={error} success={success}/>
                    <TambahSiswaForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default SiswaAdd;