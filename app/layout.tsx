import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Viscount AI — Visual Contract Execution Monitor",
  description:
    "Where contract promises meet operational reality. Automatically extract legal obligations and reconcile them against real-time operational data.",
  keywords: [
    "contract management",
    "legal tech",
    "compliance",
    "obligation tracking",
    "evidence matching",
    "risk scoring",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
