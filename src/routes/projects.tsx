import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { projects } from "@/lib/mock-data";
import { useState } from "react";
import { Plus, Search, Users, FolderOpen } from "lucide-react";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — QE Automation Hub" },
      { name: "description", content: "All test automation and RPA projects in one place." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"All" | "Test Automation" | "RPA">("All");

  const visible = projects.filter((p) => filter === "All" || p.type === filter);

  return (
    <Shell>
      <div className="rounded-3xl glass-strong p-6 mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Folder-style workspaces for your automation suites and RPA bots.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-lg hover:opacity-95"
        >
          <Plus className="h-4 w-4" /> Create project
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 px-4 py-2.5 rounded-2xl glass">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search projects..."
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-2xl glass">
          {(["All", "Test Automation", "RPA"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === t
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {visible.map((p) => (
          <Link
            key={p.id}
            to="/projects/$projectId"
            params={{ projectId: p.id }}
            className="rounded-3xl glass glass-hover p-6 block group"
          >
            <div className="flex items-start justify-between">
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${p.color} grid place-items-center text-white text-lg font-bold shadow-lg`}>
                {p.initials}
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-white/60 border border-white/70 text-muted-foreground">
                {p.type}
              </span>
            </div>
            <h3 className="mt-4 text-xl font-semibold group-hover:text-primary transition">
              {p.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/50 border border-white/60 py-2">
                <div className="text-base font-semibold">{p.cases}</div>
                <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Cases</div>
              </div>
              <div className="rounded-xl bg-white/50 border border-white/60 py-2">
                <div className="text-base font-semibold text-success">{p.passRate}%</div>
                <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Pass</div>
              </div>
              <div className="rounded-xl bg-white/50 border border-white/60 py-2">
                <div className="text-base font-semibold">{p.runs.length}</div>
                <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Runs</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> {p.members} members
              </span>
              <span>Last run · {p.lastRun}</span>
            </div>
          </Link>
        ))}

        <button
          onClick={() => setOpen(true)}
          className="rounded-3xl border-2 border-dashed border-border p-6 grid place-items-center text-center min-h-[260px] hover:border-primary/60 hover:bg-white/40 transition"
        >
          <div>
            <div className="mx-auto h-12 w-12 rounded-2xl bg-white/60 border border-white/70 grid place-items-center mb-3">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="font-medium">Create new project</div>
            <div className="text-xs text-muted-foreground mt-1">Test Automation or RPA folder</div>
          </div>
        </button>
      </div>

      {open && <CreateProjectModal onClose={() => setOpen(false)} />}
    </Shell>
  );
}

function CreateProjectModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl glass-strong p-7"
      >
        <h2 className="text-2xl font-bold">Create project</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Spin up a new folder for your automation work.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Project name
            </label>
            <input
              placeholder="e.g. Mobile Banking Regression"
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-white/70 border border-white/70 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Short summary of what this project covers."
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-white/70 border border-white/70 outline-none focus:border-primary resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Project type
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              {["Test Automation", "RPA"].map((t, i) => (
                <button
                  key={t}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium text-left ${
                    i === 0 ? "border-primary bg-primary/5" : "border-white/70 bg-white/50"
                  }`}
                >
                  <div className="font-semibold">{t}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {i === 0 ? "Selenium · Cypress · Playwright" : "Robotic process flows"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-7 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/60"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-lg"
          >
            Create project
          </button>
        </div>
      </div>
    </div>
  );
}
