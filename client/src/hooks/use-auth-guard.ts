"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { roleHomePaths } from "@/lib/auth-context";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types";

export function useAuthGuard(allowedRoles?: UserRole[]) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, status } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
      return;
    }

    if (
      status === "authenticated" &&
      user &&
      allowedRoles &&
      !allowedRoles.includes(user.role)
    ) {
      router.replace(roleHomePaths[user.role]);
    }
  }, [allowedRoles, pathname, router, status, user]);

  const isAllowed =
    status === "authenticated" &&
    !!user &&
    (!allowedRoles || allowedRoles.includes(user.role));

  return {
    user,
    status,
    isAllowed,
  };
}
