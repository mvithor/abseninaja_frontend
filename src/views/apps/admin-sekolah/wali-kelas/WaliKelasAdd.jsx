import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahWaliKelasForm from "src/apps/admin-sekolah/wali-kelas/Add/WaliKelasForm";

const WaliKelasAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Wali Kelas" description="Tambah Wali Kelas">
            <ParentCard title="Form Tambah Wali Kelas">
                <Alerts error={error} success={success}/>
                <TambahWaliKelasForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default WaliKelasAdd;