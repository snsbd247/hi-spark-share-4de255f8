import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, RefreshCw, Search } from "lucide-react";
import { oltApi, type OltDevice, type OnuLiveStatus } from "@/lib/oltApi";
import { format } from "date-fns";
import { toast } from "sonner";

function signalClass(rx?: number | null) {
  if (rx === null || rx === undefined) return "text-muted-foreground";
  if (rx > -20) return "text-green-600 dark:text-green-400";
  if (rx > -25) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export default function OnuLiveStatusPage() {
  const [olts, setOlts] = useState<OltDevice[]>([]);
  const [rows, setRows] = useState<OnuLiveStatus[]>([]);
  const [oltFilter, setOltFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [oltList, statusList] = await Promise.all([
        oltApi.list(),
        oltApi.liveStatus({
          olt_device_id: oltFilter !== "all" ? oltFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: search || undefined,
        }),
      ]);
      setOlts(oltList);
      setRows(statusList);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load live status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [oltFilter, statusFilter]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [autoRefresh, oltFilter, statusFilter, search]);

  const stats = useMemo(() => {
    const total = rows.length;
    const online = rows.filter((r) => r.status === "online").length;
    const offline = rows.filter((r) => r.status === "offline").length;
    const los = rows.filter((r) => r.status === "los").length;
    return { total, online, offline, los };
  }, [rows]);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" /> ONU Live Status
            </h1>
            <p className="text-sm text-muted-foreground">
              Real-time signal & uptime per ONU (auto-refresh every 15s).
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Button variant={autoRefresh ? "default" : "outline"} size="sm" onClick={() => setAutoRefresh((v) => !v)}>
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} /> Auto refresh
            </Button>
            <Button variant="outline" size="sm" onClick={load}>Refresh now</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total ONUs", value: stats.total, color: "bg-primary/10 text-primary" },
            { label: "Online", value: stats.online, color: "bg-green-500/15 text-green-700 dark:text-green-400" },
            { label: "Offline", value: stats.offline, color: "bg-red-500/15 text-red-700 dark:text-red-400" },
            { label: "LOS", value: stats.los, color: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className={`text-2xl font-bold mt-1 inline-flex px-2 py-0.5 rounded ${s.color}`}>{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search by serial..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()} />
            </div>
            <Select value={oltFilter} onValueChange={setOltFilter}>
              <SelectTrigger><SelectValue placeholder="OLT" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All OLTs</SelectItem>
                {olts.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="los">LOS</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={load}>Apply</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Live ONUs ({rows.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>RX (dBm)</TableHead>
                  <TableHead>TX (dBm)</TableHead>
                  <TableHead>OLT RX</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Last seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
                ) : rows.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No live data yet — add an OLT and poll.</TableCell></TableRow>
                ) : rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.serial_number}</TableCell>
                    <TableCell>
                      <Badge className={
                        r.status === "online" ? "bg-green-500/15 text-green-700 dark:text-green-400"
                        : r.status === "offline" ? "bg-red-500/15 text-red-700 dark:text-red-400"
                        : r.status === "los" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                        : "bg-muted text-muted-foreground"
                      }>{r.status}</Badge>
                    </TableCell>
                    <TableCell className={`font-mono ${signalClass(r.rx_power)}`}>{r.rx_power ?? "—"}</TableCell>
                    <TableCell className="font-mono">{r.tx_power ?? "—"}</TableCell>
                    <TableCell className={`font-mono ${signalClass(r.olt_rx_power)}`}>{r.olt_rx_power ?? "—"}</TableCell>
                    <TableCell className="text-xs">{r.uptime ?? "—"}</TableCell>
                    <TableCell className="text-xs">{r.distance_m ? `${r.distance_m} m` : "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.last_seen ? format(new Date(r.last_seen), "MMM d, HH:mm:ss") : "—"}
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
