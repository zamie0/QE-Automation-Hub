import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/mock-data";
import { Play, Pause, Repeat, Zap, Square, Terminal } from "lucide-react";

const initialLogs = [
  { ts: "00:00.000", level: "info", msg: "Initializing executor (parallel: 4, retries: 1)…" },
  { ts: "00:00.214", level: "info", msg: "Loaded environment: UAT — https://uat.tmforce.io" },
  { ts: "00:00.318", level: "info", msg: "Discovering 12 test cases…" },
];

const streamLines = [
  { level: "info", msg: "▶ TM-001 Login with valid SSO credentials" },
  { level: "info", msg: "  ↳ navigated to /login" },
  { level: "info", msg: "  ↳ SSO clicked" },
  { level: "ok", msg: "✓ TM-001 passed in 4.2s" },
  { level: "info", msg: "▶ TM-002 Create new lead from pipeline view" },
  { level: "info", msg: "  ↳ POST /v1/leads → 201 in 287ms" },
  { level: "ok", msg: "✓ TM-002 passed in 6.1s" },
  { level: "info", msg: "▶ TM-003 Export weekly performance report" },
  { level: "warn", msg: "  ⚠ Retry 1/1 after 500 from /v1/reports/weekly" },
  { level: "err", msg: "✗ TM-003 failed: expected 200 got 500" },
  { level: "info", msg: "▶ TM-004 Bulk reassign leads to manager" },
  { level: "ok", msg: "✓ TM-004 passed in 5.4s" },
  { level: "info", msg: "Run summary: 3 passed · 1 failed · 0 skipped (15.7s)" },
];

const levelColor: Record<string, string> = {
  info: "text-background/70",
  ok: "text-emerald-300",
  warn: "text-amber-300",
  err: "text-rose-300",
};

export function ExecutionTab({ project: _project }: { project: Project }) {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState(initialLogs);
  const [parallel, setParallel] = useState(true);
  const [retry, setRetry] = useState(true);
  const idxRef = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!running) return;
    idxRef.current = 0;
    setLogs(initialLogs);
    const interval = setInterval(() => {
      const i = idxRef.current;
      if (i >= streamLines.length) {
        clearInterval(interval);
        setRunning(false);
        return;
      }
      const ts = ((i + 1) * 0.4).toFixed(3).padStart(7, "0");
      setLogs((prev) => [...prev, { ts: `00:${ts}`, ...streamLines[i] }]);
      idxRef.current = i + 1;
    }, 450);
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl glass p-6 grid md:grid-cols-[1fr_auto] gap-4 items-center">
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <button className="px-3 py-2 rounded-xl glass text-sm font-medium">Single test</button>
            <button className="px-3 py-2 rounded-xl glass text-sm font-medium">Suite</button>
            <button className="px-3 py-2 rounded-xl bg-foreground text-background text-sm font-medium">All</button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Toggle on={parallel} setOn={setParallel} icon={Zap} label="Parallel ⚡" />
            <Toggle on={retry} setOn={setRetry} icon={Repeat} label="Retry failed" />
          </div>
        </div>
        <button
          onClick={() => setRunning((r) => !r)}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold shadow-lg transition ${
            running
              ? "bg-destructive text-destructive-foreground"
              : "bg-[image:var(--gradient-primary)] text-white"
          }`}
        >
          {running ? <Square className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white" />}
          {running ? "Stop run" : "Start run"}
        </button>
      </div>

      <div className="rounded-3xl glass p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/40">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Live execution log</h3>
          {running && (
            <span className="ml-2 inline-flex items-center gap-1.5 text-xs text-success font-medium">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" /> streaming
            </span>
          )}
        </div>
        <div
          ref={logRef}
          className="bg-foreground p-4 font-mono text-xs h-80 overflow-y-auto"
        >
          {logs.map((l, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-background/40 shrink-0">{l.ts}</span>
              <span className={levelColor[l.level] ?? "text-background/80"}>{l.msg}</span>
            </div>
          ))}
          {!running && logs.length <= initialLogs.length && (
            <div className="text-background/50 italic mt-2">Press “Start run” to stream logs.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({
  on,
  setOn,
  icon: Icon,
  label,
}: {
  on: boolean;
  setOn: (v: boolean) => void;
  icon: typeof Pause;
  label: string;
}) {
  return (
    <button
      onClick={() => setOn(!on)}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
        on
          ? "bg-foreground text-background border-foreground"
          : "bg-white/60 text-muted-foreground border-white/70"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
