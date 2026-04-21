import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderKanban,
  PlayCircle,
  Calendar,
  Settings,
  Bell,
  Search,
  Sparkles,
  LifeBuoy,
  MessageCircle,
  HelpCircle,
  GraduationCap,
} from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/runs", label: "Runs", icon: PlayCircle },
  { to: "/schedule", label: "Schedule", icon: Calendar },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const helpNav = [
  { to: "/help/chat", label: "AI Assistant", icon: MessageCircle },
  { to: "/help/faq", label: "FAQ", icon: HelpCircle },
  { to: "/help/tutorial", label: "Tutorial", icon: GraduationCap },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const { location } = useRouterState();
  const path = location.pathname;
  const helpOpen = path.startsWith("/help");

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 m-4 mr-0 rounded-3xl glass p-5 sticky top-4 self-start h-[calc(100vh-2rem)] overflow-y-auto">
        <Link to="/" className="flex items-center gap-3 px-2 mb-8">
          <div className="h-10 w-10 rounded-2xl bg-[image:var(--gradient-primary)] grid place-items-center shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold leading-tight">QE Hub</div>
            <div className="text-xs text-muted-foreground">Automation OS</div>
          </div>
        </Link>

        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                  active
                    ? "bg-[image:var(--gradient-primary)] text-white shadow-md"
                    : "text-foreground/70 hover:bg-white/60 hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          {/* Help group */}
          <div className="mt-5 mb-1.5 px-3 flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            <LifeBuoy className="h-3.5 w-3.5" /> Help
          </div>
          {helpNav.map((item) => {
            const active = path.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                  active
                    ? "bg-foreground text-background shadow-md"
                    : "text-foreground/70 hover:bg-white/60 hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl glass-strong p-4 text-sm">
          {helpOpen ? (
            <>
              <div className="font-medium">Need a hand?</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ask the AI Assistant anything about your projects, runs, scripts, or RPA flows.
              </p>
              <Link
                to="/help/chat"
                className="mt-3 block text-center w-full rounded-lg bg-[image:var(--gradient-primary)] text-white text-xs font-medium py-2"
              >
                Open AI Assistant
              </Link>
            </>
          ) : (
            <>
              <div className="font-medium">Need power?</div>
              <p className="text-xs text-muted-foreground mt-1">
                Connect Jenkins, GitHub Actions or GitLab CI to trigger runs automatically.
              </p>
              <button className="mt-3 w-full rounded-lg bg-foreground text-background text-xs font-medium py-2">
                Connect CI/CD
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 m-4 rounded-3xl glass px-4 py-3 flex items-center gap-3">
          <div className="lg:hidden h-9 w-9 rounded-xl bg-[image:var(--gradient-primary)] grid place-items-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/50 border border-white/60 max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search projects, test cases, runs..."
              className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
            />
          </div>
          <button className="h-10 w-10 rounded-xl glass-strong grid place-items-center">
            <Bell className="h-4 w-4" />
          </button>
          <div className="h-10 w-10 rounded-xl bg-[image:var(--gradient-primary)] grid place-items-center text-white text-sm font-semibold">
            QE
          </div>
        </header>

        <main className="px-4 pb-10 flex-1">{children}</main>
      </div>
    </div>
  );
}
