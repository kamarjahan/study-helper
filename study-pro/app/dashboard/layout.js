// app/dashboard/layout.js
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
       {/* You can add your Sidebar / Navigation here later */}
       <div className="flex">
          <aside className="w-64 hidden md:block">
             {/* Sidebar Component would go here */}
          </aside>
          <main className="flex-1">
             {children}
          </main>
       </div>
    </ProtectedRoute>
  );
}