import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { projects } from "@/lib/mock-data";
import { Clock, Repeat } from "lucide-react";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Schedule — QE Automation Hub" },
      { name: "description", content: "Schedule daily and weekly automation runs." },
    ],
  }),
  component: SchedulePage,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const scheduled = [
  { project: "TMForce", title: "Nightly regression", cron: "Daily · 02:00", next: "in 13h", color: "from-violet-400 to-indigo-500" },
  { project: "INTT", title: "API regression", cron: "Daily · 11:00", next: "in 22h", color: "from-sky-400 to-cyan-500" },
  { project: "INTT", title: "Release smoke", cron: "Weekdays · 19:00", next: "in 6h", color: "from-sky-400 to-cyan-500" },
  { project: "Camelia", title: "Daily ledger reconciliation", cron: "Daily · 06:30", next: "in 17h", color: "from-rose-400 to-pink-500" },
  { project: "Camelia", title: "Weekly KPI deck", cron: "Fri · 17:00", next: "in 4d", color: "from-rose-400 to-pink-500" },
];

export default function SchedulePage() {
  return (
    <Shell>
      <div className="rounded-3xl glass-strong p-6 mb-5">
        <h1 className="text-3xl font-bold">Schedule</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Plan recurring automation runs across {projects.length} projects.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-3xl glass p-6">
          <h2 className="font-semibold mb-4">Weekly view</h2>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d, i) => (
              <div key={d} className="rounded-2xl bg-white/40 border border-white/60 p-3 min-h-[160px]">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{d}</div>
                <div className="mt-2 space-y-1.5">
                  {scheduled
                    .filter((_, idx) => (idx + i) % 3 !== 0)
                    .slice(0, 2)
                    .map((s, j) => (
                      <div key={j} className="rounded-lg p-2 text-[10px] font-medium glass">
                        <div className={`h-1 w-6 rounded-full bg-gradient-to-r ${s.color} mb-1`} />
                        <div className="truncate">{s.title}</div>
                        <div className="text-muted-foreground">{s.cron.split("·")[1]}</div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl glass p-6">
          <h2 className="font-semibold mb-4">Upcoming</h2>
          <div className="space-y-3">
            {scheduled.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/50 border border-white/60 p-3 flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${s.color} grid place-items-center text-white text-[10px] font-bold`}>
                  {s.project.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{s.title}</div>
                  <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                    <Repeat className="h-3 w-3" /> {s.cron}
                  </div>
                </div>
                <div className="text-xs inline-flex items-center gap-1 text-primary font-medium">
                  <Clock className="h-3 w-3" /> {s.next}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

export { SchedulePage as Component };
