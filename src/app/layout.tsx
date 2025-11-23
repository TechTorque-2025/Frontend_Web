import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "./contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Automobile Service Management System",
  description: "Service Time Logging & Appointment System for Automobile Services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Runtime configuration - injected at container startup */}
        <Script src="/runtime-config.js" strategy="beforeInteractive" />
        {/* Ensure initial theme is applied before React hydration to avoid FOUC */}
        <Script id="init-theme" strategy="beforeInteractive">{`(function(){try{const s=localStorage.getItem('theme');if(s==='dark'){document.documentElement.classList.add('dark')}else if(s==='light'){document.documentElement.classList.remove('dark')}else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark')} }catch(e){} })()`}</Script>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
