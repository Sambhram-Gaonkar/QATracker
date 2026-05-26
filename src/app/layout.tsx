import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QATrackr",
  description: "Simple QA Test Case and Bug Report Manager for Manual Testers and Small Teams.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-950 antialiased">{children}</body>
    </html>
  );
}
