"use client";

import { ErrorState } from "@/components/states";
import { useRouter } from "next/navigation";

export default function ErrorPage() {
  const router = useRouter();
  return (
    <main className="bg-gradient-to-br to-primary-300 from-secondary-300">
      <ErrorState className="bg-white" onRetry={router.refresh} />
    </main>
  );
}
