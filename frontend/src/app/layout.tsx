import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Manager Simulator",
  description: "Football Manager Simulator Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className="dark">
      <body className={`${dmSans.variable} ${spaceMono.variable} antialiased`} suppressHydrationWarning={true}>
        <I18nProvider>
          <SWRProvider>
            <AuthProvider>{children}</AuthProvider>
          </SWRProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
