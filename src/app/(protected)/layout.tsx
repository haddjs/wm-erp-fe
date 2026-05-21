import { AuthGuard } from "@/context/AuthGuard";
import Sidebar from "@/layout/Sidebar";
import { RoleGuard } from "@/components/RoleGuard";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <RoleGuard>{children}</RoleGuard>
        </main>
      </div>
    </AuthGuard>
  );
}
