import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";

export const metadata: Metadata = {
  title: "SHOOT & SUFFER — Coffee Break Basketball League",
  description: "Internal office basketball scoring and push-up punishment tracker. Shoot. Score. Survive.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Shoot & Suffer",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-gray-100 min-h-screen antialiased flex flex-col court-grid">
        <Navbar />
        <main className="flex-1 pb-24 md:pb-12 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}
