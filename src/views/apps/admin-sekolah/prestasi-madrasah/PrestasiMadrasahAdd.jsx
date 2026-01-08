import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import PrestasiMadrasahForm from "src/apps/admin-sekolah/prestasi-madrasah/Add/PrestasiMadrasahForm";

const PrestasiMadrasahAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Prestasi" description="Tambah Prestasi">
            <ParentCard title="Form Tambah Prestasi">
                <Alerts error={error} success={success}/>
                    <PrestasiMadrasahForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default PrestasiMadrasahAdd;