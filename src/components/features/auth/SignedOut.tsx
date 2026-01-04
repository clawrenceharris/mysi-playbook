import { ReactNode } from "react";
import { useAuth } from "../../../features/auth/hooks";

export function SignedOut({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return null;

  return children;
}
