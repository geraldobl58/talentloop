import { Box, Typography } from "@mui/material";

interface StatusMessagesProps {
  errorMessage?: string;
  successMessage?: string;
}

export const StatusMessages = ({
  errorMessage,
  successMessage,
}: StatusMessagesProps) => (
  <>
    {errorMessage && (
      <Box className="rounded-lg bg-red-50 border border-red-200 p-4 mb-4">
        <Typography className="text-sm font-medium text-red-900">
          {errorMessage}
        </Typography>
      </Box>
    )}

    {successMessage && (
      <Box className="rounded-lg bg-green-50 border border-green-200 p-4 mb-4">
        <Typography className="text-sm font-medium text-green-900">
          {successMessage}
        </Typography>
      </Box>
    )}
  </>
);
