import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valura Compass — Financial Planning Intelligence",
  description:
    "Household-native financial planning. Advisor-grade, client-friendly, compliance-ready by default.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
