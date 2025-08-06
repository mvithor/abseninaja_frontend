import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import TopCards from 'src/components/dashboards-admin-sekolah/TopCards';
// import WelcomeCard from 'src/components/dashboards/WelcomeCard';
// import TopPerformers from '../../components/dashboards/TopPerformers';

const AdminSekolah = () => {
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid size={{ sm: 12, lg: 12 }}>
          {/* <WelcomeCard /> */}
          <TopCards />
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* <TopPerformers /> */}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminSekolah;
