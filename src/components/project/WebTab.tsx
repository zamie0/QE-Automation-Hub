import { useState } from "react";
import type { Project } from "@/lib/mock-data";
import { Globe, Lock, Plus, KeyRound, Eye, EyeOff, GripVertical } from "lucide-react";

export function WebTab({ project }: { project: Project }) {
  const [envId, setEnvId] = useState(project.environments[0]?.id ?? "");
  const [showSecrets, setShowSecrets] = useState(false);
  const env = project.environments.find((e) => e.id === envId);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* Environment selector */}
      <div className="rounded-3xl glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Environment</h3>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {project.environments.map((e) => (
            <button
              key={e.id}
              onClick={() => setEnvId(e.id)}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                e.id === envId
                  ? "bg-foreground text-background"
                  : "bg-white/60 border border-white/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              {e.name}
            </button>
          ))}
        </div>
        {env && (
          <div className="text-xs text-muted-foreground font-mono break-all p-3 rounded-xl bg-white/60 border border-white/70">
            {env.baseUrl}
          </div>
        )}
      </div>

      {/* Credentials / variables */}
      <div className="rounded-3xl glass p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Credentials & variables</h3>
          </div>
          <button
            onClick={() => setShowSecrets((s) => !s)}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-white/60 border border-white/70"
          >
            {showSecrets ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {showSecrets ? "Hide" : "Reveal"}
          </button>
        </div>
        <div className="space-y-2">
          {env?.variables.map((v) => (
            <div key={v.key} className="grid grid-cols-[140px_1fr_auto] items-center gap-2 p-2 rounded-xl bg-white/60 border border-white/70">
              <div className="text-xs font-mono font-semibold truncate">{v.key}</div>
              <div className="text-xs font-mono text-muted-foreground truncate">
                {v.secret && !showSecrets ? "••••••••" : v.value}
              </div>
              {v.secret && <KeyRound className="h-3.5 w-3.5 text-warning-foreground" />}
            </div>
          ))}
          <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-white/70 text-xs text-muted-foreground hover:bg-white/40">
            <Plus className="h-3.5 w-3.5" /> Add variable
          </button>
        </div>
      </div>

      {/* Test suite builder */}
      <div className="lg:col-span-2 rounded-3xl glass p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Test suite builder</h3>
            <p className="text-xs text-muted-foreground">Drag test cases into a suite</p>
          </div>
          <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-foreground text-background text-xs font-medium">
            <Plus className="h-3.5 w-3.5" /> New suite
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {project.suites.map((s) => (
            <div key={s.id} className="rounded-2xl bg-white/60 border border-white/70 p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="font-semibold text-sm">{s.name}</div>
                  {s.schedule && (
                    <div className="text-[11px] text-muted-foreground mt-0.5">⏰ {s.schedule}</div>
                  )}
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 border border-white/70 text-muted-foreground">
                  {s.caseIds.length} cases
                </span>
              </div>
              <div className="space-y-1">
                {s.caseIds.map((id) => {
                  const tc = project.testCases.find((c) => c.id === id);
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/70 text-xs"
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="font-mono text-muted-foreground">{id}</span>
                      <span className="truncate">{tc?.title ?? ""}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
