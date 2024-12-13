import { Sidebar } from "@/components/Sidebar";
import { MainNav } from "@/components/MainNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
