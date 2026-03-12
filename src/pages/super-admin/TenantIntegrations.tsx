import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SuperAdminLayout from "@/components/layout/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft, Eye, EyeOff, Mail, CreditCard, MessageSquare, Building2 } from "lucide-react";

const MASK = "••••••••";
const SENSITIVE_FIELDS = ["smtp_password", "bkash_app_secret", "bkash_password", "nagad_api_secret", "sms_api_key"];

const bkashUrls: Record<string, string> = {
  sandbox: "https://tokenized.sandbox.bka.sh/v1.2.0-beta",
  live: "https://tokenized.pay.bka.sh/v1.2.0-beta",
};
const nagadUrls: Record<string, string> = {
  sandbox: "https://sandbox.mynagad.com:10061/remote-payment-gateway-1.0/api/dfs",
  live: "https://api.mynagad.com/api/dfs",
};

interface IntegrationForm {
  smtp_host: string; smtp_port: string; smtp_username: string; smtp_password: string;
  smtp_encryption: string; smtp_from_email: string; smtp_from_name: string;
  bkash_app_key: string; bkash_app_secret: string; bkash_username: string; bkash_password: string;
  bkash_base_url: string; bkash_environment: string;
  nagad_api_key: string; nagad_api_secret: string; nagad_base_url: string;
  sms_gateway_url: string; sms_api_key: string; sms_sender_id: string;
}

const defaultForm: IntegrationForm = {
  smtp_host: "", smtp_port: "587", smtp_username: "", smtp_password: "",
  smtp_encryption: "tls", smtp_from_email: "", smtp_from_name: "",
  bkash_app_key: "", bkash_app_secret: "", bkash_username: "", bkash_password: "",
  bkash_base_url: bkashUrls.sandbox, bkash_environment: "sandbox",
  nagad_api_key: "", nagad_api_secret: "", nagad_base_url: nagadUrls.sandbox,
  sms_gateway_url: "", sms_api_key: "", sms_sender_id: "",
};

export default function TenantIntegrations() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<IntegrationForm>({ ...defaultForm });
  const [showFields, setShowFields] = useState<Record<string, boolean>>({});

  const { data: tenant } = useQuery({
    queryKey: ["tenant-name", tenantId],
    queryFn: async () => {
      const { data } = await supabase.from("tenants").select("company_name").eq("id", tenantId!).single();
      return data;
    },
    enabled: !!tenantId,
  });

  const { data: existing, isLoading } = useQuery({
    queryKey: ["tenant-integrations", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_integrations" as any)
        .select("*")
        .eq("tenant_id", tenantId!)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!tenantId,
  });

  useEffect(() => {
    if (existing) {
      const mapped: any = { ...defaultForm };
      for (const key of Object.keys(defaultForm)) {
        if (existing[key] !== undefined && existing[key] !== null) {
          mapped[key] = SENSITIVE_FIELDS.includes(key) && existing[key] ? MASK : existing[key];
        }
      }
      setForm(mapped);
    }
  }, [existing]);

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));
  const toggleShow = (key: string) => setShowFields(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    if (!tenantId) return;
    setSaving(true);
    try {
      const payload: any = { tenant_id: tenantId, updated_at: new Date().toISOString() };
      for (const [key, val] of Object.entries(form)) {
        if (SENSITIVE_FIELDS.includes(key) && val === MASK) continue;
        payload[key] = val;
      }

      if (existing?.id) {
        const { error } = await supabase.from("tenant_integrations" as any).update(payload).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tenant_integrations" as any).insert(payload);
        if (error) throw error;
      }
      toast.success("Integration settings saved");
      queryClient.invalidateQueries({ queryKey: ["tenant-integrations", tenantId] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const SecretInput = ({ field, label }: { field: string; label: string }) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type={showFields[field] ? "text" : "password"}
          value={(form as any)[field]}
          onChange={e => set(field, e.target.value)}
          placeholder={label}
        />
        <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-10" onClick={() => toggleShow(field)}>
          {showFields[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <SuperAdminLayout>
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/super-admin/tenants")} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Tenants
        </Button>
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Integration Settings</h1>
            <p className="text-muted-foreground text-sm">Tenant: {tenant?.company_name || tenantId}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="smtp" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="smtp" className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> SMTP</TabsTrigger>
          <TabsTrigger value="bkash" className="flex items-center gap-1.5"><CreditCard className="h-4 w-4" /> bKash</TabsTrigger>
          <TabsTrigger value="nagad" className="flex items-center gap-1.5"><CreditCard className="h-4 w-4" /> Nagad</TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> SMS</TabsTrigger>
        </TabsList>

        {/* SMTP */}
        <TabsContent value="smtp">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> SMTP Configuration</CardTitle>
              <CardDescription>Email server configuration for this tenant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>SMTP Host</Label><Input value={form.smtp_host} onChange={e => set("smtp_host", e.target.value)} placeholder="smtp.gmail.com" /></div>
                <div className="space-y-1.5"><Label>SMTP Port</Label><Input value={form.smtp_port} onChange={e => set("smtp_port", e.target.value)} placeholder="587" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Username</Label><Input value={form.smtp_username} onChange={e => set("smtp_username", e.target.value)} placeholder="user@gmail.com" /></div>
                <SecretInput field="smtp_password" label="Password" />
              </div>
              <div className="space-y-1.5">
                <Label>Encryption</Label>
                <Select value={form.smtp_encryption} onValueChange={v => set("smtp_encryption", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tls">TLS</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>From Email</Label><Input type="email" value={form.smtp_from_email} onChange={e => set("smtp_from_email", e.target.value)} placeholder="noreply@isp.com" /></div>
                <div className="space-y-1.5"><Label>From Name</Label><Input value={form.smtp_from_name} onChange={e => set("smtp_from_name", e.target.value)} placeholder="ISP Name" /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* bKash */}
        <TabsContent value="bkash">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> bKash API Configuration</CardTitle>
              <CardDescription>bKash payment gateway for this tenant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>App Key</Label><Input value={form.bkash_app_key} onChange={e => set("bkash_app_key", e.target.value)} /></div>
                <SecretInput field="bkash_app_secret" label="App Secret" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Username</Label><Input value={form.bkash_username} onChange={e => set("bkash_username", e.target.value)} /></div>
                <SecretInput field="bkash_password" label="Password" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Environment</Label>
                  <Select value={form.bkash_environment} onValueChange={v => { set("bkash_environment", v); set("bkash_base_url", bkashUrls[v] || ""); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Base URL</Label><Input value={form.bkash_base_url} onChange={e => set("bkash_base_url", e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nagad */}
        <TabsContent value="nagad">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Nagad API Configuration</CardTitle>
              <CardDescription>Nagad payment gateway for this tenant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>API Key / Merchant ID</Label><Input value={form.nagad_api_key} onChange={e => set("nagad_api_key", e.target.value)} /></div>
                <SecretInput field="nagad_api_secret" label="API Secret / Private Key" />
              </div>
              <div className="space-y-1.5"><Label>Base URL</Label><Input value={form.nagad_base_url} onChange={e => set("nagad_base_url", e.target.value)} placeholder="https://api.mynagad.com/api/dfs" /></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS */}
        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> SMS Gateway Configuration</CardTitle>
              <CardDescription>SMS gateway for this tenant's notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5"><Label>Gateway URL</Label><Input value={form.sms_gateway_url} onChange={e => set("sms_gateway_url", e.target.value)} placeholder="https://api.greenweb.com.bd/api.php" /></div>
              <SecretInput field="sms_api_key" label="API Key / Token" />
              <div className="space-y-1.5"><Label>Sender ID</Label><Input value={form.sms_sender_id} onChange={e => set("sms_sender_id", e.target.value)} placeholder="SmartISP" /></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save All Integration Settings
        </Button>
      </div>
    </SuperAdminLayout>
  );
}
