import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import PrestasiSiswaForm from "src/apps/admin-sekolah/prestasi-siswa/Add/PrestasiSiswaForm";

const PrestasiSiswaAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Prestasi" description="Tambah Prestasi">
            <ParentCard title="Form Tambah Prestasi">
                <Alerts error={error} success={success}/>
                    <PrestasiSiswaForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default PrestasiSiswaAdd;