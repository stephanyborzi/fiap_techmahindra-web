"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { RaceProvider } from "@/contexts/RaceContext";
import { ToastProvider } from "@/contexts/ToastContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white ${inter.className}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RaceProvider>
            <ToastProvider>{children}</ToastProvider>
          </RaceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
