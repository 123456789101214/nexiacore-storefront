import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import QueryProvider from "@/components/query-provider";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "NexiaCore Storefront",
  description: "Fast, premium, and minimal e-commerce storefront.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Mobile-first requirement: prevents auto-zoom on inputs
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} font-sans antialiased min-h-screen bg-background text-foreground flex flex-col`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}