import { useServerInfo } from "@/hooks/useServerInfo";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";

/**
 * Reusable DNS configuration display box.
 * Auto-detects server IP from backend.
 */
export default function DnsConfigBox() {
  const { t } = useLanguage();
  const sa = t.superAdmin;
  const { data: serverInfo, isLoading } = useServerInfo();

  const serverIp = serverInfo?.server_ip || "Loading...";
  const cnameTarget = serverInfo?.hostname || window.location.hostname;

  return (
    <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
      <p className="font-medium text-foreground text-sm">{sa.dnsConfiguration}</p>
      {isLoading ? (
        <div className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Detecting server IP...</div>
      ) : (
        <>
          <p>Add an A record pointing to: <code className="bg-muted px-1 rounded">{serverIp}</code></p>
          <p>Or CNAME to: <code className="bg-muted px-1 rounded">{cnameTarget}</code></p>
        </>
      )}
    </div>
  );
}
