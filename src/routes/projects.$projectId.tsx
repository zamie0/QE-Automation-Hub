import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { getProject } from "@/lib/mock-data";
import { useState } from "react";
import {
  ArrowLeft,
  Play,
  Calendar,
  BarChart3,
  FileCode2,
  Bot,
  ListChecks,
  Network,
  Smartphone,
  Globe,
  Zap,
  MessageSquare,
  Settings as SettingsIcon,
  TrendingUp,
} from "lucide-react";
import { OverviewTab } from "@/components/project/OverviewTab";
import { CasesTab } from "@/components/project/CasesTab";
import { ApiTab } from "@/components/project/ApiTab";
import { ScriptsTab } from "@/components/project/ScriptsTab";
import { MobileTab } from "@/components/project/MobileTab";
import { WebTab } from "@/components/project/WebTab";
import { ExecutionTab } from "@/components/project/ExecutionTab";
import { ResultsTab } from "@/components/project/ResultsTab";
import { RpaTab } from "@/components/project/RpaTab";
import { DiscussionTab } from "@/components/project/DiscussionTab";
import { SettingsTab } from "@/components/project/SettingsTab";

export const Route = createFileRoute("/projects/$projectId")({
  loader: ({ params }) => {
    const project = getProject(params.projectId);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.project.name ?? "Project"} — QE Hub` },
      { name: "description", content: loaderData?.project.description ?? "" },
    ],
  }),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();

    return (
      <Shell>
        <div className="rounded-3xl glass p-10 text-center">
          <h1 className="text-2xl font-bold">Couldn’t load project</h1>
          <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-lg"
          >
            Try again
          </button>
        </div>
      </Shell>
    );
  },
  notFoundComponent: () => (
    <Shell>
      <div className="rounded-3xl glass p-10 text-center">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <Link to="/projects" className="text-primary mt-3 inline-block">
          ← Back to projects
        </Link>
      </div>
    </Shell>
  ),
  component: ProjectDetail,
});

type Tab =
  | "overview"
  | "cases"
  | "api"
  | "scripts"
  | "mobile"
  | "web"
  | "execution"
  | "results"
  | "rpa"
  | "discussion"
  | "settings";

function ProjectDetail() {
  const { project } = Route.useLoaderData();
  const isRpa = project.type === "RPA";
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string; icon: typeof Play; show?: boolean }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "cases", label: "Test Cases", icon: ListChecks },
    { id: "api", label: "API Testing", icon: Network },
    { id: "scripts", label: "Scripts", icon: FileCode2, show: !isRpa },
    { id: "rpa", label: "RPA Builder", icon: Bot, show: isRpa },
    { id: "mobile", label: "Mobile", icon: Smartphone, show: !isRpa },
    { id: "web", label: "Web & Suites", icon: Globe, show: !isRpa },
    { id: "execution", label: "Execution", icon: Zap },
    { id: "results", label: "Results", icon: TrendingUp },
    { id: "discussion", label: "Discussion", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <Shell>
      {/* Hero */}
      <div className="rounded-3xl glass-strong p-7 mb-5 relative overflow-hidden">
        <div
          className={`absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br ${project.color} opacity-25 blur-3xl`}
        />
        <div className="relative">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> All projects
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${project.color} grid place-items-center text-white text-xl font-bold shadow-lg`}
              >
                {project.initials}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-3xl font-bold">{project.name}</h1>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/60 border border-white/70">
                    {project.type}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/60 border border-white/70 text-muted-foreground">
                    {project.members} members
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                  {project.description}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm font-medium">
                <Calendar className="h-4 w-4" /> Schedule
              </button>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-lg">
                <Play className="h-4 w-4 fill-white" /> Run all
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl glass mb-5 overflow-x-auto">
        {tabs
          .filter((t) => t.show !== false)
          .map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
      </div>

      {tab === "overview" && <OverviewTab project={project} />}
      {tab === "cases" && <CasesTab project={project} />}
      {tab === "api" && <ApiTab project={project} />}
      {tab === "scripts" && !isRpa && <ScriptsTab project={project} />}
      {tab === "rpa" && isRpa && <RpaTab project={project} />}
      {tab === "mobile" && !isRpa && <MobileTab project={project} />}
      {tab === "web" && !isRpa && <WebTab project={project} />}
      {tab === "execution" && <ExecutionTab project={project} />}
      {tab === "results" && <ResultsTab project={project} />}
      {tab === "discussion" && <DiscussionTab project={project} />}
      {tab === "settings" && <SettingsTab project={project} />}
    </Shell>
  );
}
