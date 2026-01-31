import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NotificationInit from "@/components/NotificationInit"; // Import the new component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Study Pro",
  description: "Advanced Productivity & Study Helper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Helper to initialize Service Worker */}
        <NotificationInit />
        
        {children}
      </body>
    </html>
  );
}