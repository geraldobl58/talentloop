"use client";

import { Box, Skeleton, Paper } from "@mui/material";

export default function DashboardLoading() {
  return (
    <Box className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <Box className="bg-white border-b border-gray-200 px-6 py-4">
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-4">
            <Skeleton variant="circular" width={40} height={40} />
            <Box>
              <Skeleton variant="text" width={200} height={28} />
              <Skeleton variant="text" width={150} height={20} />
            </Box>
          </Box>
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      </Box>

      {/* Main Content */}
      <Box className="flex">
        {/* Sidebar Skeleton */}
        <Box className="hidden md:block w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <Box className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={44}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Box>
        </Box>

        {/* Content Skeleton */}
        <Box className="flex-1 p-6">
          <Paper className="p-6" elevation={0}>
            <Skeleton variant="text" width={300} height={36} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="90%" height={20} />

            <Box className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={120}
                  sx={{ borderRadius: 3 }}
                />
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
