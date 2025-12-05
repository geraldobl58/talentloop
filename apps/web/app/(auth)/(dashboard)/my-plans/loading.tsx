import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

export default function MyPlansLoading() {
  return (
    <Box className="space-y-6">
      {/* Tabs skeleton */}
      <Box className="flex gap-4 border-b border-gray-200 pb-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} variant="rounded" width={100} height={36} />
        ))}
      </Box>

      {/* Current plan card */}
      <Card elevation={0} sx={{ borderRadius: 3 }}>
        <CardContent className="space-y-4">
          <Box className="flex justify-between items-start">
            <Box>
              <Skeleton variant="text" width={150} height={32} />
              <Skeleton variant="text" width={200} height={24} />
            </Box>
            <Skeleton variant="rounded" width={80} height={28} />
          </Box>

          {/* Plan features */}
          <Box className="grid grid-cols-2 gap-4 mt-4">
            {[...Array(4)].map((_, i) => (
              <Box key={i} className="flex items-center gap-2">
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width="80%" height={20} />
              </Box>
            ))}
          </Box>

          {/* Usage stats */}
          <Box className="grid grid-cols-3 gap-4 mt-6">
            {[...Array(3)].map((_, i) => (
              <Box key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                <Skeleton
                  variant="text"
                  width="60%"
                  height={28}
                  sx={{ mx: "auto" }}
                />
                <Skeleton
                  variant="text"
                  width="40%"
                  height={18}
                  sx={{ mx: "auto", mt: 1 }}
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
