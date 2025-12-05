import { Box, CircularProgress } from "@mui/material";
import { memo } from "react";

export const LoadingState = memo(function LoadingState() {
  return (
    <Box className="min-h-screen bg-gray-50 p-6">
      <Box className="flex items-center justify-center h-screen">
        <CircularProgress />
      </Box>
    </Box>
  );
});
