interface HeadingProps {
  title: string;
  subtitle: string;
}

import { Typography } from "@mui/material";

export const Heading = ({ title, subtitle }: HeadingProps) => {
  return (
    <>
      <Typography
        variant="h3"
        fontWeight="bold"
        className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        mb={2}
      >
        {title}
      </Typography>
      <Typography variant="h6" color="text.secondary" mb={4}>
        {subtitle}
      </Typography>
    </>
  );
};
