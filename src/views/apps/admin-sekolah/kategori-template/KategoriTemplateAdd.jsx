import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahKategoriTemplateForm from "src/apps/admin-sekolah/kategori-template/Add/KategoriTemplateForm";

const KategoriTemplateAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Kategori Template" description="Tambah Kategori Template">
            <ParentCard title="Form Tambah Kategori Template">
                <Alerts error={error} success={success}/>
                    <TambahKategoriTemplateForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default KategoriTemplateAdd;
