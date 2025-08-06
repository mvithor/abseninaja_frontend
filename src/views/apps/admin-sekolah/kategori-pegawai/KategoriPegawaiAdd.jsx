import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahKategoriPegawaiForm from "src/apps/admin-sekolah/kategori-pegawai/Add/KategoriPegawaiForm";

const KategoriPegawaiAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Kategori Pegawai">
            <ParentCard title="Form Tambah Kategori Pegawai">
            <Alerts error={error} success={success}/>
                <TambahKategoriPegawaiForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default KategoriPegawaiAdd;