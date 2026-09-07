import type { ReactNode } from "react";

import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f5f7f6] lg:flex">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Topbar />

        <main className="mx-auto w-full max-w-[1600px] px-3 pb-28 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
