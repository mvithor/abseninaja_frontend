import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import WaktuForm from "src/apps/admin-sekolah/waktu/Add/WaktuForm";

const WaktuAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Waktu" description="Tambah Waktu">
            <ParentCard title="Form Tambah Waktu">
                <Alerts error={error} success={success}/>
                    <WaktuForm setError={setError} setSuccess={setSuccess}/>
            </ParentCard>
        </PageContainer>
    );
};

export default WaktuAdd;