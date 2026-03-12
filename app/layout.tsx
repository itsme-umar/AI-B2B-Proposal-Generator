import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI B2B Proposal Generator",
  description: "Generate sustainable product proposals for B2B clients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
