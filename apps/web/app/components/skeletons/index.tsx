"use client";

import { memo } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

interface SkeletonCardProps {
  height?: number;
  hasAvatar?: boolean;
}

export const SkeletonCard = memo(function SkeletonCard({
  height = 120,
  hasAvatar = false,
}: SkeletonCardProps) {
  return (
    <Card elevation={0} sx={{ borderRadius: 3 }}>
      <CardContent>
        {hasAvatar && (
          <Box className="flex items-center gap-3 mb-4">
            <Skeleton variant="circular" width={48} height={48} />
            <Box className="flex-1">
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={18} />
            </Box>
          </Box>
        )}
        <Skeleton variant="rounded" height={height} sx={{ borderRadius: 2 }} />
      </CardContent>
    </Card>
  );
});

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export const SkeletonTable = memo(function SkeletonTable({
  rows = 5,
  columns = 4,
}: SkeletonTableProps) {
  return (
    <Box className="space-y-2">
      {/* Header */}
      <Box className="flex gap-4 p-3 bg-gray-100 rounded-lg">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`header-${i}`}
            variant="text"
            width={`${100 / columns}%`}
            height={24}
          />
        ))}
      </Box>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box
          key={`row-${rowIndex}`}
          className="flex gap-4 p-3 border-b border-gray-100"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              width={`${100 / columns}%`}
              height={20}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
});

interface SkeletonListProps {
  items?: number;
  hasIcon?: boolean;
}

export const SkeletonList = memo(function SkeletonList({
  items = 4,
  hasIcon = true,
}: SkeletonListProps) {
  return (
    <Box className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <Box key={i} className="flex items-center gap-3 p-2">
          {hasIcon && <Skeleton variant="circular" width={40} height={40} />}
          <Box className="flex-1">
            <Skeleton variant="text" width="70%" height={22} />
            <Skeleton variant="text" width="50%" height={16} />
          </Box>
          <Skeleton variant="rounded" width={60} height={32} />
        </Box>
      ))}
    </Box>
  );
});

interface SkeletonStatsProps {
  cards?: number;
}

export const SkeletonStats = memo(function SkeletonStats({
  cards = 4,
}: SkeletonStatsProps) {
  return (
    <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: cards }).map((_, i) => (
        <Card key={i} elevation={0} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Skeleton variant="text" width="40%" height={18} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={36} />
            <Skeleton variant="text" width="30%" height={14} sx={{ mt: 1 }} />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
});

interface SkeletonFormProps {
  fields?: number;
}

export const SkeletonForm = memo(function SkeletonForm({
  fields = 4,
}: SkeletonFormProps) {
  return (
    <Box className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <Box key={i}>
          <Skeleton variant="text" width={120} height={20} sx={{ mb: 1 }} />
          <Skeleton variant="rounded" height={48} sx={{ borderRadius: 2 }} />
        </Box>
      ))}
      <Skeleton
        variant="rounded"
        width={150}
        height={44}
        sx={{ mt: 3, borderRadius: 2 }}
      />
    </Box>
  );
});

interface PageSkeletonProps {
  title?: boolean;
  subtitle?: boolean;
  children?: React.ReactNode;
}

export const PageSkeleton = memo(function PageSkeleton({
  title = true,
  subtitle = true,
  children,
}: PageSkeletonProps) {
  return (
    <Box className="space-y-6">
      {(title || subtitle) && (
        <Box className="mb-6">
          {title && <Skeleton variant="text" width={300} height={36} />}
          {subtitle && (
            <Skeleton variant="text" width={200} height={22} sx={{ mt: 1 }} />
          )}
        </Box>
      )}
      {children || <SkeletonStats />}
    </Box>
  );
});
