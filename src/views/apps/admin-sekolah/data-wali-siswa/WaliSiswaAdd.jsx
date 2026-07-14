import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { IconUserPlus, IconFileImport } from "@tabler/icons-react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import WaliSiswaForm from "src/apps/admin-sekolah/data-wali-siswa/Add/WaliSiswaForm";
import WaliSiswaImportForm from "src/apps/admin-sekolah/data-wali-siswa/Add/WaliSiswaImportForm";

const WaliSiswaAdd = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleTabChange = (_, newValue) => {
        setActiveTab(newValue);
        setSuccess("");
        setError("");
    };

    return (
        <PageContainer title="Tambah Wali Siswa" description="Tambah Wali Siswa">
            <ParentCard title="Tambah Wali Siswa">
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
                    <WaliSiswaForm setSuccess={setSuccess} setError={setError} />
                )}
                {activeTab === 1 && (
                    <WaliSiswaImportForm setSuccess={setSuccess} setError={setError} />
                )}
            </ParentCard>
        </PageContainer>
    );
};

export default WaliSiswaAdd;
