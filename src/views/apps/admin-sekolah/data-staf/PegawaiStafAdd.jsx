import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { IconUserPlus, IconFileImport } from "@tabler/icons-react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import PegawaiStafForm from "src/apps/admin-sekolah/data-staf/Add/PegawaiStafForm";
import PegawaiStafImportForm from "src/apps/admin-sekolah/data-staf/Add/PegawaiStafImportForm";

const PegawaiStaffAdd = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleTabChange = (_, newValue) => {
        setActiveTab(newValue);
        setSuccess("");
        setError("");
    };

    return (
        <PageContainer title="Tambah Pegawai Staf" description="Tambah Pegawai Staf">
            <ParentCard title="Tambah Pegawai Staf">
                <Alerts error={error} success={success} />

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, mt: -1 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
                            '& .Mui-selected': { color: '#973BE0' },
                            '& .MuiTabs-indicator': { backgroundColor: '#973BE0' },
                        }}
                    >
                        <Tab
                            icon={<IconUserPlus size={18} />}
                            iconPosition="start"
                            label="Tambah Manual"
                        />
                        <Tab
                            icon={<IconFileImport size={18} />}
                            iconPosition="start"
                            label="Import Excel"
                        />
                    </Tabs>
                </Box>

                {activeTab === 0 && (
                    <PegawaiStafForm setSuccess={setSuccess} setError={setError} />
                )}
                {activeTab === 1 && (
                    <PegawaiStafImportForm setSuccess={setSuccess} setError={setError} />
                )}
            </ParentCard>
        </PageContainer>
    );
};

export default PegawaiStaffAdd;
