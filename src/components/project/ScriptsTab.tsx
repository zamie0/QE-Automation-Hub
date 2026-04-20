import { useState } from "react";
import type { Project, Script } from "@/lib/mock-data";
import { FileCode2, Play, Plus, Upload, FolderOpen, GitBranch, Save } from "lucide-react";

const langColors: Record<string, string> = {
  robot: "bg-rose-100 text-rose-700",
  python: "bg-amber-100 text-amber-700",
  typescript: "bg-blue-100 text-blue-700",
  javascript: "bg-yellow-100 text-yellow-800",
};

export function ScriptsTab({ project }: { project: Project }) {
  const [selectedId, setSelectedId] = useState<string>(project.scripts[0]?.id ?? "");
  const selected = project.scripts.find((s) => s.id === selectedId);

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-4">
      <div className="rounded-3xl glass p-4 self-start">
        <div className="flex gap-1.5 mb-3">
          <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl glass text-xs font-medium">
            <Upload className="h-3.5 w-3.5" /> Upload
          </button>
          <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-foreground text-background text-xs font-medium">
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        </div>

        <div className="text-xs font-mono space-y-1 text-foreground/80">
          <div className="flex items-center gap-1.5 font-semibold">
            <FolderOpen className="h-3.5 w-3.5" /> /automation
          </div>
          <div className="space-y-0.5 pl-4">
            {project.scripts.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg transition ${
                  s.id === selectedId
                    ? "bg-foreground text-background"
                    : "hover:bg-white/60"
                }`}
              >
                <FileCode2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{s.name}</span>
              </button>
            ))}
          </div>
          {project.scripts.length === 0 && (
            <div className="text-muted-foreground italic px-2 py-4">No scripts yet.</div>
          )}
        </div>
      </div>

      {selected ? <ScriptEditor script={selected} /> : (
        <div className="rounded-3xl glass p-10 text-center text-sm text-muted-foreground">
          Select a script to edit.
        </div>
      )}
    </div>
  );
}

function ScriptEditor({ script }: { script: Script }) {
  return (
    <div className="rounded-3xl glass p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-lg truncate">{script.name}</h3>
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${langColors[script.language] ?? "bg-muted text-muted-foreground"}`}>
              {script.language}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <GitBranch className="h-3 w-3" /> {script.version}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 font-mono truncate">{script.path}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {script.framework} · {script.cases} cases · updated {script.updated}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm font-medium">
            <Save className="h-4 w-4" /> Save
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow">
            <Play className="h-4 w-4 fill-white" /> Run
          </button>
        </div>
      </div>

      {/* Code editor */}
      <div className="rounded-2xl bg-foreground overflow-hidden border border-white/10">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-foreground">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-[11px] text-background/60 font-mono ml-2">{script.path}</div>
        </div>
        <div className="grid grid-cols-[auto_1fr] text-xs font-mono">
          <div className="px-3 py-3 text-background/30 select-none border-r border-white/10 text-right">
            {script.content.split("\n").map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <pre className="px-4 py-3 text-background/95 overflow-x-auto whitespace-pre">{script.content}</pre>
        </div>
      </div>
    </div>
  );
}
