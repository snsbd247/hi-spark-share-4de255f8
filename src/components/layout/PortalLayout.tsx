import { ReactNode } from "react";
import PortalSidebar from "./PortalSidebar";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <PortalSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
