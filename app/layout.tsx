import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { MainNav } from "@/components/MainNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "xFlo AI Assistant",
  description: "AI-powered chat interface",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 ml-64">
            <header className="fixed top-0 right-0 left-64 bg-white z-20">
              <div className="flex h-14 items-center px-6">
                <MainNav />
              </div>
            </header>
            <main className="pt-14 h-[calc(100vh-3.5rem)]">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}