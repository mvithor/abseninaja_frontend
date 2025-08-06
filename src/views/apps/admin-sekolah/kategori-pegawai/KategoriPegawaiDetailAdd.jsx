import { useState } from "react";
import { useParams } from "react-router-dom";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahKategoriPegawaiDetailForm from "src/apps/admin-sekolah/kategori-pegawai/Detail/KategoriPegawaiDetailForm";

const KategoriPegawaiDetailAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const { id } = useParams(); 

    return (
        <PageContainer title="Tambah Subkategori Pegawai" description="Tambah Subkategori Pegawai">
            <ParentCard title="Form Tambah Subkategori Pegawai">
                <Alerts error={error} success={success}/>
                <TambahKategoriPegawaiDetailForm
                    setSuccess={setSuccess}
                    setError={setError}
                    kategoriPegawaiId={id} 
                />
            </ParentCard>
        </PageContainer>
    );
};

export default KategoriPegawaiDetailAdd;
