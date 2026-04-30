"use client";

import type { ReactNode } from "react";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { LoadingState } from "@/components/loading-state";
import type { UserRole } from "@/types";

export function PageGuard({
  allowedRoles,
  children,
}: {
  allowedRoles?: UserRole[];
  children: ReactNode;
}) {
  const { status, isAllowed } = useAuthGuard(allowedRoles);

  if (status === "loading") {
    return <LoadingState message="Checking your session..." />;
  }

  if (!isAllowed) {
    return <LoadingState message="Redirecting..." />;
  }

  return <>{children}</>;
}
