import AdminSidebar from "@/components/admin/AdminSidebar";
import TopBar from "@/components/admin/TopBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-main-bg text-main-text font-body">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-h-screen ml-[248px] overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-7 py-8 no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
