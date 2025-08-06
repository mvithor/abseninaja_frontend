import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import WaliSiswaForm from "src/apps/admin-sekolah/data-wali-siswa/Add/WaliSiswaForm";

const WaliSiswaAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Wali Siswa" description="Tambah Wali Siswa">
            <ParentCard title="Form Tambah Wali Siswa">
                <Alerts error={error} success={success}/>
                <WaliSiswaForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default WaliSiswaAdd;