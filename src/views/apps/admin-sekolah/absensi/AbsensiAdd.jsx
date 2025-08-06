import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import AbsensiForm from "src/apps/admin-sekolah/absensi/Add/AbsensiForm";

const AbsensiAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Absensi" description="Tambah Absensi">
            <ParentCard title="Form Tambah Absensi">
                <Alerts error={error} success={success}/>
                    <AbsensiForm setError={setError} setSuccess={setSuccess}/>
            </ParentCard>
        </PageContainer>
    );
};

export default AbsensiAdd;