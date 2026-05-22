import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahPpdbRoom from "src/apps/admin-sekolah/ppdb/ppdb-room/PpdbRoomForm";

const PpdbRoomAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Ruangan PMB" description="Tambah Ruangan PMB">
            <ParentCard title="Form Tambah Ruangan PMB">
                <Alerts error={error} success={success}/>
                <TambahPpdbRoom setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default PpdbRoomAdd;