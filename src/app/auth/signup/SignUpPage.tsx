"use client";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormLayout } from "@/components/form";
import { SignUpFormInput, signUpSchema } from "@/features/auth/domain";
import { useAuth } from "@/features/auth/hooks";
import { SignUpForm } from "@/components/features/auth";

export default function SignUpPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuth();

  const nextPath = "/";

  return (
    <main className="flex flex-col justify-center">
      <div className="bg-background w-full max-w-xl p-12 shadow-lg rounded-xl mx-auto">
        <div className="text-center my-8">
          <h1 className="text-2xl font-semibold">Sign Up</h1>
        </div>
        <FormLayout<SignUpFormInput>
          defaultValues={{
            email: "",
            password: "",
            first_name: "",
            last_name: "",
          }}
          submitText="Sign Up"
          isLoading={isLoading}
          resolver={zodResolver(signUpSchema)}
          onSubmit={signup}
          onSuccess={() => router.replace("/")}
        >
          <SignUpForm
            onSwitchToLogin={() => {
              const url = nextPath
                ? `/auth/login?next=${encodeURIComponent(nextPath)}`
                : "/auth/login";
              router.push(url);
            }}
          />
        </FormLayout>
      </div>
    </main>
  );
}
