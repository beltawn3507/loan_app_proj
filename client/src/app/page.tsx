"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingState } from "@/components/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { roleHomePaths } from "@/lib/auth-context";

export default function HomePage() {
  const router = useRouter();
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(roleHomePaths[user.role]);
      return;
    }

    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status, user]);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
      <LoadingState message="Opening dashboard..." />
    </div>
  );
}
