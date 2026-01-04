"use client";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormLayout } from "@/components/form";
import { LoginFormInput, loginSchema } from "@/features/auth/domain";
import { useAuth } from "@/features/auth/hooks";
import { LoginForm } from "@/components/features/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, resetPassword } = useAuth();

  const nextPath = "/";

  return (
    <main className="flex flex-col justify-center">
      <div className="bg-background w-full max-w-xl p-12 shadow-lg rounded-xl mx-auto">
        <div className="text-center my-8">
          <h1 className="text-2xl font-semibold">Log In</h1>
        </div>
        <FormLayout<LoginFormInput>
          defaultValues={{ email: "", password: "" }}
          submitText="Log In"
          isLoading={isLoading}
          resolver={zodResolver(loginSchema)}
          onSubmit={login}
          onSuccess={() => {
            router.replace("/");
          }}
        >
          <LoginForm
            onForgotPassword={resetPassword}
            onSwitchToSignup={() => {
              const url = nextPath
                ? `/auth/signup?next=${encodeURIComponent(nextPath)}`
                : `/auth/signup`;
              router.push(url);
            }}
          />
        </FormLayout>
      </div>
    </main>
  );
}
