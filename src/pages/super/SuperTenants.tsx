import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminApi } from "@/lib/superAdminApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Ban, CheckCircle, Trash2, Search, Loader2, Eye, Edit, Save } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface EditTenantData {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  phone: string;
  max_customers: number | null;
  max_users: number | null;
  grace_days: number;
  plan_expiry_message: string;
}

export default function SuperTenants() {
  const { t } = useLanguage();
  const sa = t.superAdmin;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editTenant, setEditTenant] = useState<EditTenantData | null>(null);

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["super-tenants", search, statusFilter],
    queryFn: () => superAdminApi.getTenants({
      ...(search && { search }),
      ...(statusFilter !== "all" && { status: statusFilter }),
    }),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["super-plans"],
    queryFn: superAdminApi.getPlans,
  });

  const suspendMut = useMutation({
    mutationFn: superAdminApi.suspendTenant,
    onSuccess: () => { toast.success("Tenant suspended"); qc.invalidateQueries({ queryKey: ["super-tenants"] }); },
  });

  const activateMut = useMutation({
    mutationFn: superAdminApi.activateTenant,
    onSuccess: () => { toast.success("Tenant activated"); qc.invalidateQueries({ queryKey: ["super-tenants"] }); },
  });

  const deleteMut = useMutation({
    mutationFn: superAdminApi.deleteTenant,
    onSuccess: () => { toast.success("Tenant deleted"); qc.invalidateQueries({ queryKey: ["super-tenants"] }); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, any>) =>
      superAdminApi.updateTenant(id, data),
    onSuccess: () => {
      toast.success("Tenant updated successfully");
      setEditTenant(null);
      qc.invalidateQueries({ queryKey: ["super-tenants"] });
    },
    onError: (e: any) => toast.error(e.message || "Update failed"),
  });

  const openEdit = (tenant: any) => {
    setEditTenant({
      id: tenant.id,
      name: tenant.name || "",
      subdomain: tenant.subdomain || "",
      email: tenant.email || "",
      phone: tenant.phone || "",
      max_customers: tenant.max_customers ?? null,
      max_users: tenant.max_users ?? null,
      grace_days: tenant.grace_days ?? 0,
      plan_expiry_message: tenant.plan_expiry_message || "",
    });
  };

  const handleSaveEdit = () => {
    if (!editTenant) return;
    if (!editTenant.name.trim()) {
      toast.error("ISP name is required");
      return;
    }
    const { id, ...payload } = editTenant;
    updateMut.mutate({
      id,
      name: payload.name.trim(),
      subdomain: payload.subdomain.trim() || null,
      email: payload.email.trim() || null,
      phone: payload.phone.trim() || null,
      max_customers: payload.max_customers || null,
      max_users: payload.max_users || null,
      grace_days: payload.grace_days || 0,
      plan_expiry_message: payload.plan_expiry_message.trim() || null,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{sa.tenantManagement}</h1>
        <Button onClick={() => navigate("/super/onboarding")}>
          <Plus className="h-4 w-4 mr-2" /> {sa.createTenant}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={sa.searchTenants} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{sa.allStatus}</SelectItem>
            <SelectItem value="active">{t.common.active}</SelectItem>
            <SelectItem value="suspended">{t.common.status}</SelectItem>
            <SelectItem value="trial">{sa.trial}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{sa.ispName}</TableHead>
                <TableHead>{sa.subdomain}</TableHead>
                <TableHead>{sa.plan}</TableHead>
                <TableHead>{sa.customers}</TableHead>
                <TableHead>{sa.users}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">{t.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : tenants.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{sa.noTenantsFound}</TableCell></TableRow>
                ) : tenants.map((t: any) => {
                  const hasActiveSubscription = Boolean(t.active_subscription);

                  return <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-muted-foreground">{t.subdomain}</TableCell>
                  <TableCell>{t.active_subscription?.plan?.name || "—"}</TableCell>
                  <TableCell>{hasActiveSubscription ? t.customer_count || 0 : "—"}</TableCell>
                  <TableCell>{hasActiveSubscription ? t.user_count || 0 : "—"}</TableCell>
                  <TableCell>
                    <Badge variant={t.status === "active" ? "default" : t.status === "trial" ? "secondary" : "destructive"}>
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/super/tenants/${t.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    {t.status === "active" ? (
                      <Button variant="ghost" size="sm" onClick={() => suspendMut.mutate(t.id)}>
                        <Ban className="h-4 w-4 text-destructive" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => activateMut.mutate(t.id)}>
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete this tenant?")) deleteMut.mutate(t.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>;
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Tenant Dialog */}
      <Dialog open={!!editTenant} onOpenChange={(open) => { if (!open) setEditTenant(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" /> Edit Tenant
            </DialogTitle>
          </DialogHeader>
          {editTenant && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ISP Name *</Label>
                  <Input
                    value={editTenant.name}
                    onChange={(e) => setEditTenant({ ...editTenant, name: e.target.value })}
                    placeholder="ISP Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subdomain</Label>
                  <Input
                    value={editTenant.subdomain}
                    onChange={(e) => setEditTenant({ ...editTenant, subdomain: e.target.value })}
                    placeholder="subdomain"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editTenant.email}
                    onChange={(e) => setEditTenant({ ...editTenant, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editTenant.phone}
                    onChange={(e) => setEditTenant({ ...editTenant, phone: e.target.value })}
                    placeholder="+880..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Max Customers</Label>
                  <Input
                    type="number"
                    value={editTenant.max_customers ?? ""}
                    onChange={(e) => setEditTenant({ ...editTenant, max_customers: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Unlimited"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Users</Label>
                  <Input
                    type="number"
                    value={editTenant.max_users ?? ""}
                    onChange={(e) => setEditTenant({ ...editTenant, max_users: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Unlimited"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grace Days</Label>
                  <Input
                    type="number"
                    value={editTenant.grace_days}
                    onChange={(e) => setEditTenant({ ...editTenant, grace_days: Number(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Plan Expiry Message</Label>
                <Input
                  value={editTenant.plan_expiry_message}
                  onChange={(e) => setEditTenant({ ...editTenant, plan_expiry_message: e.target.value })}
                  placeholder="Message shown when plan expires"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTenant(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateMut.isPending}>
              {updateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
