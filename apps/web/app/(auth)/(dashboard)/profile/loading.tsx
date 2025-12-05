import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

export default function ProfileLoading() {
  return (
    <Box className="space-y-6">
      {/* Profile header */}
      <Card elevation={0} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box className="flex items-center gap-6">
            <Skeleton variant="circular" width={100} height={100} />
            <Box className="flex-1">
              <Skeleton variant="text" width={200} height={36} />
              <Skeleton variant="text" width={250} height={24} sx={{ mt: 1 }} />
              <Skeleton variant="text" width={150} height={20} sx={{ mt: 1 }} />
            </Box>
            <Skeleton variant="rounded" width={100} height={40} />
          </Box>
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card elevation={0} sx={{ borderRadius: 3 }}>
        <CardContent className="space-y-4">
          <Skeleton variant="text" width={180} height={28} sx={{ mb: 3 }} />

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Box key={i}>
                <Skeleton
                  variant="text"
                  width={100}
                  height={20}
                  sx={{ mb: 1 }}
                />
                <Skeleton
                  variant="rounded"
                  height={48}
                  sx={{ borderRadius: 2 }}
                />
              </Box>
            ))}
          </Box>

          <Box className="flex justify-end gap-3 mt-6">
            <Skeleton variant="rounded" width={100} height={40} />
            <Skeleton variant="rounded" width={140} height={40} />
          </Box>
        </CardContent>
      </Card>

      {/* Security section */}
      <Card elevation={0} sx={{ borderRadius: 3 }}>
        <CardContent className="space-y-4">
          <Skeleton variant="text" width={200} height={28} sx={{ mb: 3 }} />

          <Box className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Box
                key={i}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <Box className="flex items-center gap-3">
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box>
                    <Skeleton variant="text" width={150} height={22} />
                    <Skeleton variant="text" width={200} height={16} />
                  </Box>
                </Box>
                <Skeleton variant="rounded" width={80} height={36} />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
