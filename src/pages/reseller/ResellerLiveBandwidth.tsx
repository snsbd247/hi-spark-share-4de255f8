import { useState, useEffect, useCallback, useRef } from "react";
import ResellerLayout from "@/components/reseller/ResellerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, ArrowUp, ArrowDown, Users, Play, Pause, Wifi } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useResellerAuth } from "@/contexts/ResellerAuthContext";

const MAX_HISTORY = 30;

interface LiveUser {
  pppoe_username: string;
  customer_name: string;
  customer_id: string;
  upload_bps: number;
  download_bps: number;
  upload_formatted: string;
  download_formatted: string;
  uptime: string;
  ip_address: string;
  router_name: string;
}

interface SpeedPoint {
  time: string;
  upload: number;
  download: number;
}

function formatBps(bps: number): string {
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(1)} Mbps`;
  if (bps >= 1_000) return `${(bps / 1_000).toFixed(0)} Kbps`;
  return `${bps} bps`;
}

export default function ResellerLiveBandwidth() {
  const { reseller } = useResellerAuth();
  const [isPolling, setIsPolling] = useState(true);
  const [interval, setInterval_] = useState(10);
  const [users, setUsers] = useState<LiveUser[]>([]);
  const [totalUpload, setTotalUpload] = useState(0);
  const [totalDownload, setTotalDownload] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [history, setHistory] = useState<SpeedPoint[]>([]);
  const [lastUpdate, setLastUpdate] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLive = useCallback(async () => {
    if (!reseller?.id || !reseller?.tenant_id) return;
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const url = `https://${projectId}.supabase.co/functions/v1/live-bandwidth?tenant_id=${reseller.tenant_id}&reseller_id=${reseller.id}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${anonKey}` } });
      if (!res.ok) return;
      const data = await res.json();

      setUsers(data.users || []);
      setTotalUpload(data.total_upload || 0);
      setTotalDownload(data.total_download || 0);
      setActiveCount(data.active_count || 0);

      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastUpdate(timeStr);

      setHistory((prev) => {
        const next = [...prev, {
          time: timeStr,
          upload: Math.round((data.total_upload || 0) / 1_000_000 * 100) / 100,
          download: Math.round((data.total_download || 0) / 1_000_000 * 100) / 100,
        }];
        return next.slice(-MAX_HISTORY);
      });
    } catch (e) {
      console.error("Live bandwidth fetch error:", e);
    }
  }, [reseller?.id, reseller?.tenant_id]);

  useEffect(() => {
    if (!isPolling) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    fetchLive();
    timerRef.current = setInterval(fetchLive, interval * 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPolling, interval, fetchLive]);

  const top5 = users.slice(0, 5);

  return (
    <ResellerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" /> Live Bandwidth
            </h1>
            <p className="text-muted-foreground mt-1">Real-time speed of your customers</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(interval)} onValueChange={(v) => setInterval_(Number(v))}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5s</SelectItem>
                <SelectItem value="10">10s</SelectItem>
                <SelectItem value="15">15s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
              </SelectContent>
            </Select>
            <Button variant={isPolling ? "destructive" : "default"} size="sm" onClick={() => setIsPolling(!isPolling)}>
              {isPolling ? <><Pause className="h-4 w-4 mr-1" /> Pause</> : <><Play className="h-4 w-4 mr-1" /> Resume</>}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant={isPolling ? "default" : "secondary"} className="gap-1 text-xs">
            <Wifi className="h-3 w-3" /> {isPolling ? "LIVE" : "PAUSED"}
          </Badge>
          {lastUpdate && <span>Last: {lastUpdate}</span>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Active</p>
            <p className="text-2xl font-bold text-primary">{activeCount}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><ArrowUp className="h-3 w-3" /> Upload</p>
            <p className="text-xl font-bold">{formatBps(totalUpload)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><ArrowDown className="h-3 w-3" /> Download</p>
            <p className="text-xl font-bold">{formatBps(totalDownload)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-primary">{formatBps(totalUpload + totalDownload)}</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Speed Over Time (Mbps)</CardTitle></CardHeader>
          <CardContent>
            {history.length < 2 ? (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <div className="text-center"><Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" /><p>Collecting data...</p></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(2)} Mbps`} />
                  <Legend />
                  <Line type="monotone" dataKey="upload" stroke="hsl(150, 60%, 45%)" strokeWidth={2} dot={false} name="Upload" />
                  <Line type="monotone" dataKey="download" stroke="hsl(210, 70%, 55%)" strokeWidth={2} dot={false} name="Download" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Top 5 Users</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {top5.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No active users</p>
              ) : top5.map((u, i) => (
                <div key={u.pppoe_username} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">{i + 1}</span>
                    <div>
                      <p className="font-medium text-foreground truncate max-w-[120px]">{u.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{u.customer_id}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-emerald-600">↑ {u.upload_formatted}</p>
                    <p className="text-blue-600">↓ {u.download_formatted}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="text-base">Active Users ({activeCount})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>PPPoE</TableHead>
                      <TableHead className="text-right">Upload</TableHead>
                      <TableHead className="text-right">Download</TableHead>
                      <TableHead>Uptime</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No active sessions</TableCell></TableRow>
                    ) : users.slice(0, 50).map((u) => (
                      <TableRow key={u.pppoe_username}>
                        <TableCell className="font-medium text-sm">{u.customer_name}</TableCell>
                        <TableCell className="font-mono text-xs">{u.pppoe_username}</TableCell>
                        <TableCell className="text-right text-xs text-emerald-600 font-medium">{u.upload_formatted}</TableCell>
                        <TableCell className="text-right text-xs text-blue-600 font-medium">{u.download_formatted}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{u.uptime}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ResellerLayout>
  );
}
