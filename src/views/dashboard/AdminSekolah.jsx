import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import TopCards from 'src/components/dashboards-admin-sekolah/TopCards';
import StatistikDashboardKehadiranCard from 'src/components/dashboards-admin-sekolah/StatistikDashboardKehadiranCard';

const AdminSekolah = () => {
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid size={{ sm: 12, lg: 12 }}>
          <TopCards />
        </Grid>
        <Grid size={{ sm: 12, lg: 12 }}>
          <StatistikDashboardKehadiranCard />
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminSekolah;
