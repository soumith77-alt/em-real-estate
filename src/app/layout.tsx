import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "EM Real Estate — Workspace",
  description:
    "Private AI workspace for EM Real Estate. Acquisitions, leasing, and portfolio memory.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--ink)",
              color: "var(--card)",
              border: "1px solid var(--slate)",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
