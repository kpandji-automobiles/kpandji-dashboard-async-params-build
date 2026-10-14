"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import SidebarAdmin from "./SidebarAdmin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsSidebarOpen(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <div className="relative h-screen overflow-hidden bg-slate-50">
      <div className="fixed inset-x-0 top-0 z-[60] h-16">
        <Header toggleSidebar={() => setIsSidebarOpen((open) => !open)} />
      </div>

      <aside
        className={`fixed bottom-0 left-0 top-16 z-50 w-64 transition-transform duration-200 lg:z-40 lg:transition-[width] ${
          isSidebarOpen
            ? "translate-x-0 lg:w-64"
            : "-translate-x-full lg:w-20 lg:translate-x-0"
        }`}
      >
        <SidebarAdmin isOpen={isSidebarOpen} onNavigate={() => {
          if (window.innerWidth < 1024) setIsSidebarOpen(false);
        }} />
      </aside>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 top-16 z-40 bg-slate-950/35 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main
        className={`h-screen overflow-y-auto pt-16 transition-[margin] duration-200 ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
