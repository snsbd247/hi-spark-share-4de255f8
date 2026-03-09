import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Users, Receipt, CreditCard, LogOut, Wifi,
  ChevronLeft, ChevronDown, Ticket, MessageSquare, Settings, Bell, UserCircle,
  Package, MapPin, Router, Shield, Wallet, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  to: string;
  icon: any;
  label: string;
}

interface NavGroup {
  label: string;
  icon: any;
  items: NavItem[];
  prefixes: string[];
}

const topItems: NavItem[] = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/customers", icon: Users, label: "Accounts" },
];

const groups: NavGroup[] = [
  {
    label: "Billing",
    icon: Receipt,
    prefixes: ["/billing", "/payments", "/merchant"],
    items: [
      { to: "/billing", icon: Receipt, label: "Billing" },
      { to: "/billing/cycle", icon: Receipt, label: "Billing Cycle" },
      { to: "/payments", icon: CreditCard, label: "Payments" },
      { to: "/merchant-payments", icon: Wallet, label: "Merchant Pay" },
      { to: "/merchant-reports", icon: BarChart3, label: "Payment Reports" },
    ],
  },
  {
    label: "Support",
    icon: Ticket,
    prefixes: ["/tickets", "/sms", "/reminders"],
    items: [
      { to: "/tickets", icon: Ticket, label: "Tickets" },
      { to: "/sms", icon: MessageSquare, label: "SMS" },
      { to: "/reminders", icon: Bell, label: "Reminders" },
      { to: "/sms-settings", icon: Settings, label: "SMS Settings" },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    prefixes: ["/settings", "/users", "/profile"],
    items: [
      { to: "/users", icon: Shield, label: "Users" },
      { to: "/profile", icon: UserCircle, label: "Profile" },
      { to: "/settings/general", icon: Settings, label: "General Settings" },
      { to: "/settings/packages", icon: Package, label: "Packages" },
      { to: "/settings/zones", icon: MapPin, label: "Zones" },
      { to: "/settings/mikrotik", icon: Router, label: "MikroTik Routers" },
    ],
  },
];

export default function AppSidebar() {
  const { signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const matchesGroup = (g: NavGroup) =>
    g.items.some((i) => isActive(i.to)) ||
    g.prefixes.some((p) => location.pathname.startsWith(p));

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    groups.forEach((g) => {
      init[g.label] = matchesGroup(g);
    });
    return init;
  });

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  const linkClass = (path: string) =>
    cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
      isActive(path)
        ? "bg-sidebar-primary text-sidebar-primary-foreground"
        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
    );

  const subLinkClass = (path: string) =>
    cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
      isActive(path)
        ? "bg-sidebar-primary text-sidebar-primary-foreground"
        : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
    );

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-all duration-300 sticky top-0",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
          <Wifi className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h2 className="font-bold text-sm leading-tight">Smart ISP</h2>
            <p className="text-[11px] text-sidebar-foreground/60">Admin Panel</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {/* Top-level items */}
        {topItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === "/"} className={linkClass(item.to)}>
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {/* Collapsible groups */}
        {groups.map((group) =>
          !collapsed ? (
            <div key={group.label} className="pt-2">
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <group.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", openGroups[group.label] && "rotate-180")} />
              </button>
              {openGroups[group.label] && (
                <div className="ml-4 space-y-0.5 mt-0.5">
                  {group.items.map((item) => (
                    <NavLink key={item.to} to={item.to} className={subLinkClass(item.to)}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink
              key={group.label}
              to={group.items[0].to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                matchesGroup(group)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <group.icon className="h-5 w-5 shrink-0" />
            </NavLink>
          )
        )}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
