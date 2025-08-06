import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import KategoriWaktuForm from "src/apps/admin-sekolah/kategori-waktu/Add/KategoriWaktuForm";

const KategoriWaktuAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Kategori Waktu" description="Tambah Kategori Waktu">
            <ParentCard title="Form Tambah Kategori Waktu">
                <Alerts error={error} success={success}/>
                    <KategoriWaktuForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default KategoriWaktuAdd;