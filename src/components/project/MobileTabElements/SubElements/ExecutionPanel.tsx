import { AlertTriangle, CheckCircle2, Loader2, Play, Smartphone } from "lucide-react";
import type { DeviceConfig } from "@/lib/automation-runs";

interface ExecutionPanelProps {
  selectedApkName: string;
  selectedScriptPath: string;
  selectedDeviceId: string;
  devices: DeviceConfig[];
  running: boolean;
  canRun: boolean;
  onSelectDevice: (id: string) => void;
  onRun: () => void;
}

export function ExecutionPanel({
  selectedApkName,
  selectedScriptPath,
  selectedDeviceId,
  devices,
  running,
  canRun,
  onSelectDevice,
  onRun,
}: ExecutionPanelProps) {
  const hasApk = !!selectedApkName;
  const hasScript = !!selectedScriptPath;
  const hasDevice = !!selectedDeviceId;

  return (
    <div className="rounded-3xl glass-strong p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-lg">Execution control</h3>
          <p className="text-xs text-muted-foreground">Robot Framework + Appium run trigger</p>
        </div>
        <button
          onClick={onRun}
          disabled={!canRun || running}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[image:var(--gradient-primary)] text-white text-sm font-semibold shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
          {running ? "Running..." : "Run selected script"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/70 bg-white/60 p-3">
          <div className="text-xs text-muted-foreground mb-1">Selected APK</div>
          <div className="text-sm font-medium truncate">{selectedApkName || "No APK selected"}</div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/60 p-3">
          <div className="text-xs text-muted-foreground mb-1">Selected script</div>
          <div className="text-sm font-medium truncate">{selectedScriptPath || "No script selected"}</div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-white/70 bg-white/60 p-3">
        <div className="text-xs text-muted-foreground mb-1">Target device</div>
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedDeviceId}
            onChange={(e) => onSelectDevice(e.target.value)}
            className="bg-transparent text-sm font-medium outline-none w-full"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.platform} {d.platformVersion})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs">
        <ValidationChip ok={hasApk} label="APK uploaded" />
        <ValidationChip ok={hasScript} label="Robot script selected" />
        <ValidationChip ok={hasDevice} label="Device selected" />
      </div>
    </div>
  );
}

function ValidationChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className={[
        "rounded-lg border px-2 py-1.5 flex items-center gap-1.5",
        ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700",
      ].join(" ")}
    >
      {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
      <span>{label}</span>
    </div>
  );
}
