import PageContainer from "src/components/container/PageContainer";
import ChildCard from "src/components/shared/ChildCard";
import PendaftaranListing from "src/apps/super-admin/pendaftaran-sekolah/List/PendaftaranListing";
import PendaftaranFilter from "src/apps/super-admin/pendaftaran-sekolah/Filter/PendaftaranFilter";

const PendaftaranSekolahList = () => {
    return (
        <PageContainer title="Data Pendaftaran Sekolah" description="Data Pendaftaran Sekolah">
            <ChildCard>
                <PendaftaranFilter/>
                <PendaftaranListing/>
            </ChildCard>
        </PageContainer>
    );
};

export default PendaftaranSekolahList;