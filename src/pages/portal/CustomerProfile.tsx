import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import PortalLayout from "@/components/layout/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Wifi, Loader2 } from "lucide-react";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

export default function CustomerProfile() {
  const { customer } = useCustomerAuth();

  const { data: pkg, isLoading } = useQuery({
    queryKey: ["customer-profile-package", customer?.package_id],
    queryFn: async () => {
      if (!customer?.package_id) return null;
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("id", customer.package_id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!customer?.package_id,
  });

  const statusColor =
    customer?.status === "active"
      ? "bg-success/10 text-success border-success/20"
      : "bg-destructive/10 text-destructive border-destructive/20";

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">Your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card className="glass-card animate-fade-in">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Personal Information</CardTitle>
                <p className="text-sm text-muted-foreground font-mono">{customer?.customer_id}</p>
              </div>
              <Badge variant="outline" className={`ml-auto ${statusColor}`}>
                {customer?.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" value={customer?.name} />
              <Field label="Phone" value={customer?.phone} />
              <Field label="Email" value={customer?.email} />
              <Field label="Username" value={customer?.username} />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="glass-card animate-fade-in">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <CardTitle className="text-base">Address</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Area" value={customer?.area} />
              <Field label="Road" value={customer?.road} />
              <Field label="House" value={customer?.house} />
              <Field label="City" value={customer?.city} />
            </div>
          </CardContent>
        </Card>

        {/* Connection Info */}
        <Card className="glass-card animate-fade-in lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Wifi className="h-5 w-5 text-success" />
              </div>
              <CardTitle className="text-base">Connection Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Package" value={pkg?.name} />
              <Field label="Speed" value={pkg?.speed} />
              <Field label="Monthly Bill" value={`৳${customer?.monthly_bill.toLocaleString()}`} />
              <Field label="IP Address" value={customer?.ip_address} />
              <Field label="PPPoE Username" value={customer?.pppoe_username} />
              <Field label="ONU MAC" value={customer?.onu_mac} />
              <Field label="Router MAC" value={customer?.router_mac} />
              <Field label="Installation Date" value={customer?.installation_date} />
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
