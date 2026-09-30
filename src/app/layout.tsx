import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "@/providers";
import { SITE_URL } from "@/lib/constants";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Google Font
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

// Metadata
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kanbamy | Modern Task Management",
    template: "%s | Kanbamy",
  },
  description:
    "Kanbamy is a personal Kanban task-management app for organizing boards, prioritizing tasks, and moving work through a visual workflow.",
  creator: "Mahmoud Elagamy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${geist.variable} flex min-h-dvh flex-col font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
