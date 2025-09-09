"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { NotificationContainer } from "@/components/ui/notification";
import { useSocket } from "@/hooks/useSocket";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { notifications, removeNotification } = useSocket();

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="p-6 md:p-8 lg:p-12">{children}</SidebarInset>
        <NotificationContainer 
          notifications={notifications} 
          onRemove={removeNotification} 
        />
      </SidebarProvider>
    </ProtectedRoute>
  );
}
