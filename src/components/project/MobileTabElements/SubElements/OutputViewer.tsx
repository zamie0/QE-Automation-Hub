import { FileCode2, FolderTree } from "lucide-react";
import type { AutomationRun } from "@/lib/automation-runs";

export function OutputViewer({ runs }: { runs: AutomationRun[] }) {
  const latestByScript = new Map<string, AutomationRun>();
  runs
    .filter((run) => run.scriptName)
    .forEach((run) => {
      const key = scriptKey(run.scriptName || "unknown");
      if (!latestByScript.has(key)) latestByScript.set(key, run);
    });

  return (
    <div className="rounded-3xl glass p-5">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <FolderTree className="h-4 w-4" /> Outputs
      </h3>

      {latestByScript.size === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No output artifacts yet. Run a `.robot` script to generate `log.html`, `report.html`, and `output.xml`.
        </p>
      ) : (
        <div className="space-y-2">
          {Array.from(latestByScript.entries()).map(([name, run]) => (
            <div key={name} className="rounded-xl border border-white/70 bg-white/60 p-3">
              <div className="text-sm font-semibold">Outputs/{name}</div>
              <div className="text-[11px] text-muted-foreground mb-2">
                Last run: {new Date(run.startedAt).toLocaleString()} · {run.status.toUpperCase()}
              </div>
              <div className="grid sm:grid-cols-3 gap-2">
                <ArtifactCard name="log.html" />
                <ArtifactCard name="report.html" />
                <ArtifactCard name="output.xml" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ArtifactCard({ name }: { name: string }) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/80 p-2 flex items-center gap-2">
      <FileCode2 className="h-3.5 w-3.5 text-primary" />
      <span className="text-xs font-medium">{name}</span>
    </div>
  );
}

function scriptKey(scriptName: string): string {
  return scriptName.replace(/\.robot$/i, "").replaceAll(" ", "-");
}
