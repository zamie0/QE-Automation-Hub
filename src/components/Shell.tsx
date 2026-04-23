import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderKanban,
  PlayCircle,
  Calendar,
  Settings as SettingsIcon,
  Bell,
  Sparkles,
  LifeBuoy,
  MessageCircle,
  HelpCircle,
  GraduationCap,
  Phone,
  User as UserIcon,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { seedNotifications } from "@/lib/notifications";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/runs", label: "Runs", icon: PlayCircle },
  { to: "/schedule", label: "Schedule", icon: Calendar },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

const helpNav = [
  { to: "/help/chat", label: "AI Assistant", icon: MessageCircle },
  { to: "/help/faq", label: "FAQ", icon: HelpCircle },
  { to: "/help/tutorial", label: "Tutorial", icon: GraduationCap },
  { to: "/help/contact", label: "Contact", icon: Phone },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const { location } = useRouterState();
  const path = location.pathname;
  const helpOpen = path.startsWith("/help");

  return (
    <div className="min-h-screen flex">
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
                Ask the AI Assistant or contact Hazami directly.
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 m-4 rounded-3xl glass px-4 py-3 flex items-center gap-3">
          <div className="lg:hidden h-9 w-9 rounded-xl bg-[image:var(--gradient-primary)] grid place-items-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1" />
          <ProfileMenu />
        </header>

        <main className="px-4 pb-10 flex-1">{children}</main>
      </div>
    </div>
  );
}

function ProfileMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = seedNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function go(to: string) {
    setOpen(false);
    navigate({ to });
  }

  function logout() {
    setOpen(false);
    // demo only — clear notifications read state and route home
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("qe-hub.session");
    }
    navigate({ to: "/" });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pr-2 pl-1 py-1 rounded-2xl glass-strong hover:bg-white/80 transition"
      >
        <div className="relative h-9 w-9 rounded-xl bg-[image:var(--gradient-primary)] grid place-items-center text-white text-sm font-semibold shadow">
          HZ
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold grid place-items-center">
              {unread}
            </span>
          )}
        </div>
        <div className="hidden sm:block text-left leading-tight">
          <div className="text-xs font-semibold">Hazami</div>
          <div className="text-[10px] text-muted-foreground">System Developer</div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl glass-strong p-2 shadow-xl z-40">
          <div className="px-3 py-3 border-b border-white/40 flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-[image:var(--gradient-primary)] grid place-items-center text-white font-semibold">
              HZ
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">Hazami</div>
              <div className="text-xs text-muted-foreground truncate">System Developer · Admin</div>
            </div>
          </div>

          <DropItem
            icon={Bell}
            label="Notifications"
            badge={unread}
            onClick={() => go("/notifications")}
          />
          <DropItem icon={UserIcon} label="Profile" onClick={() => go("/profile")} />
          <DropItem icon={SettingsIcon} label="Settings" onClick={() => go("/settings")} />
          <div className="my-1 border-t border-white/40" />
          <DropItem icon={LogOut} label="Logout" danger onClick={logout} />
        </div>
      )}
    </div>
  );
}

function DropItem({
  icon: Icon,
  label,
  badge,
  onClick,
  danger,
}: {
  icon: typeof Bell;
  label: string;
  badge?: number;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition",
        danger
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-white/70",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1 text-left">{label}</span>
      {!!badge && badge > 0 && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground">
          {badge}
        </span>
      )}
    </button>
  );
}
