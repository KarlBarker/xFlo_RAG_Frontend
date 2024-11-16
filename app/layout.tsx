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
          <div className="flex-1">
            <header className="border-b">
              <div className="flex h-16 items-center px-4">
                <MainNav className="mx-6" />
              </div>
            </header>
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}