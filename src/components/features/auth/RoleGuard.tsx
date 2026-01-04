import React from "react";
import { useUser } from "@/providers";
import { Database } from "@/types/database";

type UserRole = Database["public"]["Enums"]["user_role"];

export interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  allowedRoles,
  children,
  fallback = null,
}: RoleGuardProps) {
  const { profile } = useUser();

  const hasRequiredRole = profile?.role && allowedRoles.includes(profile.role);

  if (!hasRequiredRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
