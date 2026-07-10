import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/shared/app-header";
import { AdminSidebar } from "@/components/shared/admin-sidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role === "USER") {
    redirect("/admin/login");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <div className="flex flex-1 flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 p-6 lg:p-8">
        {children}
        </div>
      </div>
    </div>
  );
}
