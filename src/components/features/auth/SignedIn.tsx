import { useAuth } from "../../../features/auth/hooks";

export function SignedIn({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  return children;
}
