import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sessionStore } from "@/lib/sessionStore";

export default function ImpersonationBanner() {
  const [visible, setVisible] = useState(false);
  const [tenantName, setTenantName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("impersonation_token");
    const tenantData = localStorage.getItem("impersonation_tenant");
    if (token && tenantData) {
      try {
        const tenant = JSON.parse(tenantData);
        setTenantName(tenant.name || "Unknown");
        setVisible(true);
      } catch {}
    }
  }, []);

  const endImpersonation = () => {
    // Clear tenant session
    localStorage.removeItem("impersonation_token");
    localStorage.removeItem("impersonation_tenant");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");

    // Restore super admin session if available
    const savedSuperToken = localStorage.getItem("saved_super_token");
    const savedSuperUser = localStorage.getItem("saved_super_user");
    localStorage.removeItem("saved_super_token");
    localStorage.removeItem("saved_super_user");

    if (savedSuperToken && savedSuperUser) {
      localStorage.setItem("super_admin_token", savedSuperToken);
      localStorage.setItem("super_admin_user", savedSuperUser);
    }

    setVisible(false);
    // Redirect back to super admin panel
    window.location.href = "/super/tenants";
  };

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-center gap-3 text-sm shadow-lg">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="font-medium">
        You are logged in as <strong>{tenantName}</strong> (Impersonation Mode)
      </span>
      <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={endImpersonation}>
        <X className="h-3 w-3 mr-1" /> End Session
      </Button>
    </div>
  );
}
