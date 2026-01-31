import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NotificationInit from "@/components/NotificationInit"; 
import Sidebar from "@/components/Sidebar";

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
      <body className={`${inter.className} bg-slate-950 text-white`}>
        {/* Initialize Notifications */}
        <NotificationInit />
        
        {/* Mobile-Responsive Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        {/* md:ml-64 -> Adds left margin only on Desktop */}
        {/* pt-16 md:pt-0 -> Adds top padding on mobile so content isn't hidden behind the toggle button */}
        <main className="md:ml-64 min-h-screen relative overflow-hidden transition-all duration-300 pt-16 md:pt-0">
          {children}
        </main>
      </body>
    </html>
  );
}