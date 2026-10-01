import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acme | Internal Portal",
  description: "A focused home base for the Acme team.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
