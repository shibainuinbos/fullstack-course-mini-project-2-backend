import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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
  title: "Book Tracker",
  description: "Track and organize your personal library.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        
        {/* Sticky Glassmorphic Navbar */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo / Brand Name */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-black tracking-tight text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
            >
              <span className="text-2xl">📚</span>
              <span>BookTracker</span>
            </Link>

            {/* Navigation Links */}
            <nav className="flex items-center gap-6 sm:gap-8">
              <Link
                href="/"
                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                href="/books"
                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors duration-200"
              >
                My Books
              </Link>
              <Link
                href="/books/new"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow transition-all duration-200"
              >
                Add Book
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content App Shell */}
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
