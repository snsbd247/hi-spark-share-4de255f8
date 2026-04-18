import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Activity, Plug, Plus, Radio, RefreshCw, Trash2 } from "lucide-react";
import { oltApi, type OltDevice, type OltDeviceInput } from "@/lib/oltApi";
import { format } from "date-fns";

const emptyForm: OltDeviceInput = {
  name: "",
  ip_address: "",
  port: 22,
  username: "",
  password: "",
  vendor: "huawei",
  connection_type: "cli",
  poll_interval_sec: 300,
  is_active: true,
};

export default function OltDevices() {
  const [devices, setDevices] = useState<OltDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OltDevice | null>(null);
  const [form, setForm] = useState<OltDeviceInput>(emptyForm);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setDevices(await oltApi.list());
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load OLT devices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (d: OltDevice) => {
    setEditing(d);
    setForm({
      name: d.name,
      ip_address: d.ip_address,
      port: d.port,
      api_port: d.api_port ?? undefined,
      username: d.username ?? "",
      password: "",
      vendor: d.vendor,
      connection_type: d.connection_type,
      poll_interval_sec: d.poll_interval_sec,
      is_active: d.is_active,
    });
    setOpen(true);
  };

  const submit = async () => {
    try {
      const payload: OltDeviceInput = { ...form };
      if (editing && !payload.password) delete (payload as any).password;
      if (editing) await oltApi.update(editing.id, payload);
      else await oltApi.create(payload);
      toast.success(editing ? "OLT updated" : "OLT created");
      setOpen(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Save failed");
    }
  };

  const test = async (d: OltDevice) => {
    setBusyId(d.id);
    try {
      const r = await oltApi.test(d.id);
      r.ok ? toast.success(`Connected (${r.mode}): ${r.message ?? "ok"}`)
           : toast.error(`Failed: ${r.message ?? "connection error"}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Test failed");
    } finally {
      setBusyId(null);
    }
  };

  const poll = async (d: OltDevice) => {
    setBusyId(d.id);
    try {
      const r = await oltApi.poll(d.id);
      if (r.ok) toast.success(`Polled ${r.count ?? 0} ONUs (${r.mode})`);
      else toast.error(`Poll failed: ${r.error ?? "unknown"}`);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Poll failed");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (d: OltDevice) => {
    if (!confirm(`Delete OLT "${d.name}"?`)) return;
    try {
      await oltApi.remove(d.id);
      toast.success("Deleted");
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Radio className="h-6 w-6 text-primary" /> Live OLT Devices
            </h1>
            <p className="text-sm text-muted-foreground">
              Hybrid API + CLI monitoring for your fiber OLTs.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add OLT</Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit OLT" : "Add OLT Device"}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-2">
                  <div className="col-span-2">
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>IP Address</Label>
                    <Input value={form.ip_address} onChange={(e) => setForm({ ...form, ip_address: e.target.value })} />
                  </div>
                  <div>
                    <Label>SSH Port</Label>
                    <Input type="number" value={form.port ?? 22}
                      onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Username</Label>
                    <Input value={form.username ?? ""} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                  </div>
                  <div>
                    <Label>Password {editing && <span className="text-xs text-muted-foreground">(leave blank to keep)</span>}</Label>
                    <Input type="password" value={form.password ?? ""}
                      onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  </div>
                  <div>
                    <Label>Vendor</Label>
                    <Select value={form.vendor} onValueChange={(v) => setForm({ ...form, vendor: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="huawei">Huawei</SelectItem>
                        <SelectItem value="zte">ZTE</SelectItem>
                        <SelectItem value="vsol">VSOL</SelectItem>
                        <SelectItem value="bdcom">BDCOM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Connection</Label>
                    <Select value={form.connection_type ?? "cli"}
                      onValueChange={(v) => setForm({ ...form, connection_type: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cli">CLI / SSH</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="hybrid">Hybrid (API → CLI)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Poll Interval (sec)</Label>
                    <Input type="number" min={30} max={3600} value={form.poll_interval_sec ?? 300}
                      onChange={(e) => setForm({ ...form, poll_interval_sec: Number(e.target.value) })} />
                  </div>
                  <div className="flex items-end gap-2">
                    <Switch checked={form.is_active ?? true}
                      onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                    <Label>Active (enable polling)</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={submit}>{editing ? "Update" : "Create"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Configured OLTs</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Last polled</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
                ) : devices.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No OLT devices configured.</TableCell></TableRow>
                ) : devices.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell><Badge variant="outline" className="uppercase">{d.vendor}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{d.ip_address}:{d.port}</TableCell>
                    <TableCell><Badge variant="secondary">{d.connection_type}</Badge></TableCell>
                    <TableCell>
                      <Badge className={
                        d.status === "online" ? "bg-green-500/15 text-green-700 dark:text-green-400"
                        : d.status === "offline" ? "bg-red-500/15 text-red-700 dark:text-red-400"
                        : "bg-muted text-muted-foreground"}>
                        <Activity className="h-3 w-3 mr-1" /> {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{d.poll_interval_sec}s</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {d.last_polled_at ? format(new Date(d.last_polled_at), "MMM d, HH:mm:ss") : "—"}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="sm" variant="outline" disabled={busyId === d.id} onClick={() => test(d)}>
                        <Plug className="h-3 w-3 mr-1" /> Test
                      </Button>
                      <Button size="sm" variant="outline" disabled={busyId === d.id} onClick={() => poll(d)}>
                        <RefreshCw className="h-3 w-3 mr-1" /> Poll
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(d)}>Edit</Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(d)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
