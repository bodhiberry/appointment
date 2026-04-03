import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SM Visitor Management",
  description: "Secure QR-based visitor entry system for SM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-white text-slate-900">
        <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
          <div className="container flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <Link href="/"><span className="font-bold text-xl tracking-tight">SM Visitor</span></Link>
            </div>
            <nav className="flex items-center gap-6">
              <a href="/request" className="text-sm font-medium hover:text-blue-600 transition-colors">Request Visit</a>
              <a href="/verify/search" className="text-sm font-medium hover:text-blue-600 transition-colors">Gate Verify</a>
              <a href="/admin" className="text-sm font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-500 transition-colors">Admin</a>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t bg-white py-6 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 sm:px-8 max-w-7xl mx-auto">
            <p className="text-center text-sm leading-loose text-slate-500 md:text-left">
              © 2026 SM Visitor Management System. All rights reserved.
            </p>
          </div>
        </footer>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
