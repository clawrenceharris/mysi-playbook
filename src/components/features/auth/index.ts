import { Database } from "@/types";

export { RoleGuard } from "./RoleGuard";
export type { RoleGuardProps } from "./RoleGuard";

// Re-export the user role type for convenience
export type { Database } from "@/types/database";
export type UserRole = Database["public"]["Enums"]["user_role"];
export { LoginForm } from "./LoginForm";
export { SignUpForm } from "./SignUpForm";
export { SignedIn } from "./SignedIn";
export { SignedOut } from "./SignedOut";
