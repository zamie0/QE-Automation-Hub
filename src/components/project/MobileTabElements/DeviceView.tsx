import { Loader2, Smartphone } from "lucide-react";
import type { RunLog } from "@/lib/automation-runs";

export function DeviceView({
  running,
  logs,
  deviceName,
}: {
  running: boolean;
  logs: RunLog[];
  deviceName: string;
}) {
  return (
    <div className="rounded-3xl glass p-5">
      <h3 className="font-semibold mb-3">Live execution view</h3>
      <div className="grid lg:grid-cols-[280px_1fr] gap-3">
        <div className="rounded-2xl border border-white/70 bg-white/70 p-3">
          <div className="mx-auto w-[190px] h-[360px] rounded-[28px] border-[6px] border-slate-900 bg-slate-800 p-2">
            <div className="h-full rounded-[20px] bg-gradient-to-b from-slate-200 to-white grid place-items-center text-center p-3">
              {running ? (
                <div className="space-y-2">
                  <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
                  <p className="text-xs font-medium">Executing on {deviceName}</p>
                  <p className="text-[11px] text-muted-foreground">Simulated stream until backend websocket is connected</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Smartphone className="h-6 w-6 mx-auto text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Device screen idle</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/70 p-3">
          <div className="text-xs text-muted-foreground mb-2">Logs</div>
          <div className="h-[360px] overflow-y-auto rounded-xl bg-slate-950 text-slate-100 p-3 font-mono text-[11px] space-y-1.5">
            {logs.length === 0 ? (
              <div className="text-slate-400">No logs yet.</div>
            ) : (
              logs.map((log, idx) => (
                <div key={`${log.ts}-${idx}`} className={logColor(log.level)}>
                  [{log.ts}] {log.msg}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function logColor(level: RunLog["level"]) {
  if (level === "ok") return "text-emerald-300";
  if (level === "warn") return "text-amber-300";
  if (level === "err") return "text-rose-300";
  return "text-slate-200";
}
