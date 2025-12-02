import { Box, Grid, Skeleton } from "@mui/material";

export const DashboardLoadingSkeleton = () => (
  <Box>
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[1, 2, 3, 4].map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Skeleton variant="rounded" height={120} />
        </Grid>
      ))}
    </Grid>
    <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Skeleton variant="rounded" height={150} />
        </Grid>
      ))}
    </Grid>
  </Box>
);
