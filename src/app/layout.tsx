"use client";

import "./globals.css";
import "@stream-io/video-react-sdk/dist/css/styles.css";

import {
  QueryProvider,
  ModalProvider as ModalProviderDeprecated,
  VideoClientProvider,
  UserProvider,
} from "@/providers";
import { ModalProvider } from "@/lib/modals";
import { ReactNode, useEffect } from "react";
import { Toaster } from "@/components/ui";
import { registerPlaybookModals } from "@/features/playbooks/components/modals";
import { registerSessionModals } from "@/features/sessions/components/modals";

function ModalRegistration() {
  useEffect(() => {
    // Register all modals on app initialization
    registerPlaybookModals();
    registerSessionModals();
  }, []);
  return null;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <ModalProvider>
            <ModalProviderDeprecated>
              <ModalRegistration />
              <UserProvider>
                <VideoClientProvider>{children}</VideoClientProvider>
              </UserProvider>
            </ModalProviderDeprecated>
          </ModalProvider>
        </QueryProvider>

        <Toaster />
      </body>
    </html>
  );
}
