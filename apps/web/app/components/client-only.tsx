"use client";

import { useSyncExternalStore, type ReactNode } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// Helper for useSyncExternalStore
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Hook that returns true only on the client side after hydration.
 * Uses useSyncExternalStore for proper SSR handling.
 */
export const useIsClient = () => {
  return useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );
};

/**
 * Wrapper component that only renders children on the client side.
 * Use this to wrap components that rely on browser-only APIs or
 * cause hydration mismatches.
 *
 * @example
 * <ClientOnly fallback={<Skeleton />}>
 *   <DateComponent />
 * </ClientOnly>
 */
export const ClientOnly = ({ children, fallback = null }: ClientOnlyProps) => {
  const isClient = useIsClient();

  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Higher-order component version of ClientOnly.
 * Wraps a component to only render on the client side.
 *
 * @example
 * const ClientDateComponent = withClientOnly(DateComponent);
 */
export function withClientOnly<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  const WithClientOnly = (props: P) => {
    return (
      <ClientOnly fallback={fallback}>
        <WrappedComponent {...props} />
      </ClientOnly>
    );
  };

  WithClientOnly.displayName = `withClientOnly(${displayName})`;

  return WithClientOnly;
}
