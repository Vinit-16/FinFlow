"use client";

import Sidebar from "@/components/custom/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1  ml-64">{children}</main>
    </div>
  );
}
