import type { Metadata } from "next";
import { preconnect } from "react-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import AppShell from "@/components/layout/AppShell";

/** The signed-in app is nothing a search engine should list. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Auth, and with it the whole Firebase SDK, starts here rather than in the
 * root layout, so the public pages ship without it.
 */
export default function PagesLayout({ children }: { children: React.ReactNode }) {
  // The first Firestore read is on its way as soon as the scripts run.
  preconnect("https://firestore.googleapis.com");
  preconnect("https://identitytoolkit.googleapis.com");

  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
