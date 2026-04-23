import { useEffect, useMemo, useRef, useState } from "react";
import type { Project } from "@/lib/mock-data";
import {
  addApk,
  addDevice,
  addRobotScript,
  getState,
  removeApk,
  removeDevice,
  removeScript,
  startRun,
  AUTOMATION_EVENT, type DeviceConfig,
} from "@/lib/automation-runs";
import { useEventTick } from "@/lib/use-storage";
import { FileExplorer } from "./FileExplorer";
import { ExecutionPanel } from "./ExecutionPanel";
import { DeviceView } from "./DeviceView";
import { OutputViewer } from "./OutputViewer";
import type { MobileFolderNode, MobileScriptFile } from "./types";
import { Package, Smartphone, Upload, Plus, Apple, Trash2, Settings2, X } from "lucide-react";

export function MobileTab({ project }: { project: Project }) {
  useEventTick(AUTOMATION_EVENT);
  const state = getState(project.id);
  const apkInputRef = useRef<HTMLInputElement>(null);
  const robotInputRef = useRef<HTMLInputElement | null>(null);
  const robotFolderInputRef = useRef<HTMLInputElement | null>(null);

  const [selApk, setSelApk] = useState<string>("");
  const [selDevice, setSelDevice] = useState<string>(state.devices[0]?.id ?? "");
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [activeRunId, setActiveRunId] = useState<string>("");
  const [scripts, setScripts] = useState<MobileScriptFile[]>([]);
  const [manualFolders, setManualFolders] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [selectedFileId, setSelectedFileId] = useState<string>("");

  const STORAGE_KEY = `qe-hub.mobile-scripts.${project.id}`;
  const FOLDERS_KEY = `qe-hub.mobile-folders.${project.id}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rawScripts = localStorage.getItem(STORAGE_KEY);
    const rawFolders = localStorage.getItem(FOLDERS_KEY);
    if (rawScripts) {
      try {
        setScripts(JSON.parse(rawScripts) as MobileScriptFile[]);
      } catch {
        setScripts([]);
      }
    } else if (state.scripts.length > 0) {
      setScripts(
        state.scripts.map((s) => ({
          id: s.id,
          name: s.name,
          path: `Imported/${s.name}`,
          scriptId: s.id,
        })),
      );
      setManualFolders(["Imported"]);
      setExpandedFolders({ Imported: true });
    }
    if (rawFolders) {
      try {
        setManualFolders(JSON.parse(rawFolders) as string[]);
      } catch {
        setManualFolders([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts));
  }, [scripts, STORAGE_KEY]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(manualFolders));
  }, [manualFolders, FOLDERS_KEY]);

  const selectedFile = useMemo(
    () => scripts.find((s) => s.id === selectedFileId) ?? null,
    [scripts, selectedFileId],
  );
  const selectedApk = useMemo(() => state.apks.find((apk) => apk.id === selApk), [state.apks, selApk]);
  const activeRun = useMemo(
    () => state.runs.find((r) => r.id === activeRunId) ?? state.runs[0],
    [state.runs, activeRunId],
  );

  useEffect(() => {
    if (!activeRunId && state.runs.length) setActiveRunId(state.runs[0].id);
  }, [state.runs, activeRunId]);

  function onApkPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const platform: "Android" | "iOS" = file.name.toLowerCase().endsWith(".ipa") ? "iOS" : "Android";
    const apk = addApk(project.id, file, platform);
    setSelApk(apk.id);
    e.target.value = "";
  }

  async function onRobotPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      if (!file.name.toLowerCase().endsWith(".robot")) continue;
      const s = await addRobotScript(project.id, file);
      const fullPath = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
      const relativePath = fullPath || `Imported/${file.name}`;
      setScripts((prev) => [
        ...prev.filter((x) => x.scriptId !== s.id),
        { id: `tree-${s.id}`, name: file.name, path: normalizePath(relativePath), scriptId: s.id },
      ]);
      const folderPath = pathDir(relativePath);
      if (folderPath) {
        setManualFolders((prev) => (prev.includes(folderPath) ? prev : [...prev, folderPath]));
      }
    }
    e.target.value = "";
  }

  function handleRun(file?: MobileScriptFile) {
    const target = file ?? selectedFile;
    if (!target) return;
    const device = selDevice || state.devices[0]?.id;
    const runId = startRun(project.id, { apkId: selApk, scriptId: target.scriptId, deviceId: device, name: target.path });
    setActiveRunId(runId);
  }

  function handleCreateFolder() {
    const path = window.prompt("Create folder (example: TestSuite/LoginFlow)");
    if (!path?.trim()) return;
    const normalized = normalizeFolder(path);
    setManualFolders((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
    setExpandedFolders((prev) => ({ ...prev, [normalized]: true }));
  }

  async function handleCreateRobot() {
    const path = window.prompt("Create .robot file path (example: TestSuite/login.robot)");
    if (!path?.trim()) return;
    const normalized = normalizePath(path.endsWith(".robot") ? path : `${path}.robot`);
    const file = new File(["*** Test Cases ***\nSmoke Test\n    Log    Hello Mobile\n"], fileName(normalized), {
      type: "text/plain",
    });
    const script = await addRobotScript(project.id, file);
    setScripts((prev) => [...prev, { id: `tree-${script.id}`, name: script.name, path: normalized, scriptId: script.id }]);
    const folder = pathDir(normalized);
    if (folder) setManualFolders((prev) => (prev.includes(folder) ? prev : [...prev, folder]));
  }

  function toggleFolder(path: string) {
    setExpandedFolders((prev) => ({ ...prev, [path]: !(prev[path] ?? true) }));
  }

  function handleDeleteFile(file: MobileScriptFile) {
    setScripts((prev) => prev.filter((x) => x.id !== file.id));
    removeScript(project.id, file.scriptId);
    if (selectedFileId === file.id) setSelectedFileId("");
  }

  function handleDeleteFolder(folderPath: string) {
    const prefix = `${folderPath}/`;
    setManualFolders((prev) => prev.filter((f) => f !== folderPath && !f.startsWith(prefix)));
    setScripts((prev) => {
      const deleting = prev.filter((s) => s.path.startsWith(prefix));
      deleting.forEach((s) => removeScript(project.id, s.scriptId));
      return prev.filter((s) => !s.path.startsWith(prefix));
    });
  }

  const canRun = !!selApk && !!selDevice && !!selectedFile?.scriptId;
  const tree = useMemo(() => buildTree(scripts, manualFolders), [scripts, manualFolders]);
  const isRunning = activeRun?.status === "running";
  const selectedDeviceName = state.devices.find((d) => d.id === selDevice)?.name || "device";

  return (
    <div className="space-y-4">
      <div className="rounded-3xl glass-strong p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-lg">Mobile automation execution workspace</h3>
            <p className="text-xs text-muted-foreground">Upload APK + Robot folders, run tests, monitor logs, review outputs</p>
          </div>
          <button
            onClick={() => apkInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-foreground text-background text-sm font-medium"
          >
            <Upload className="h-4 w-4" /> Upload APK
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/70 bg-white/60 p-3">
            <div className="text-xs text-muted-foreground mb-1">Selected APK</div>
            <select
              value={selApk}
              onChange={(e) => setSelApk(e.target.value)}
              className="w-full text-sm bg-white/80 border border-white/70 rounded-lg px-2 py-1.5"
            >
              <option value="">-- choose apk --</option>
              {state.apks.map((apk) => (
                <option key={apk.id} value={apk.id}>
                  {apk.name} ({apk.size})
                </option>
              ))}
            </select>
            <div className="text-[11px] text-muted-foreground mt-1">
              {selectedApk ? `Selected APK: ${selectedApk.name}` : "No APK selected"}
            </div>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/60 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Device configs</span>
              <button
                onClick={() => setShowDeviceForm(true)}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-foreground text-background"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            <div className="space-y-1">
              {state.devices.map((d) => (
                <label key={d.id} className="flex items-center gap-2 text-xs rounded-lg bg-white/70 px-2 py-1.5">
                  <input type="radio" checked={selDevice === d.id} onChange={() => setSelDevice(d.id)} />
                  {d.name} ({d.platform} {d.platformVersion})
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <FileExplorer
          tree={tree}
          expanded={expandedFolders}
          selectedFileId={selectedFileId}
          onToggleFolder={toggleFolder}
          onSelectFile={(file) => setSelectedFileId(file.id)}
          onRunFile={(file) => {
            setSelectedFileId(file.id);
            handleRun(file);
          }}
          onDeleteFile={handleDeleteFile}
          onDeleteFolder={handleDeleteFolder}
          onUploadFolder={() => robotFolderInputRef.current?.click()}
          onUploadRobot={() => robotInputRef.current?.click()}
          onCreateFolder={handleCreateFolder}
          onCreateRobot={handleCreateRobot}
        />
        <ExecutionPanel
          selectedApkName={selectedApk?.name ?? ""}
          selectedScriptPath={selectedFile?.path ?? ""}
          selectedDeviceId={selDevice}
          devices={state.devices}
          running={isRunning}
          canRun={canRun}
          onSelectDevice={setSelDevice}
          onRun={() => handleRun()}
        />
      </div>

      <DeviceView running={isRunning} logs={activeRun?.logs ?? []} deviceName={selectedDeviceName} />
      <OutputViewer runs={state.runs} />

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-3xl glass p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="h-4 w-4" /> App builds
          </h3>
          {state.apks.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No APK / IPA uploaded.</p>
          )}
          <div className="space-y-2">
            {state.apks.map((b) => {
              const Icon = b.platform === "iOS" ? Apple : Smartphone;
              return (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-white/70">
                  <div className="h-10 w-10 rounded-xl bg-[image:var(--gradient-primary)] grid place-items-center text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{b.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {b.platform} · {b.size} · {new Date(b.uploaded).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => removeApk(project.id, b.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl glass p-6 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Settings2 className="h-4 w-4" /> Devices
            </h3>
            <button
              onClick={() => setShowDeviceForm(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-foreground text-background text-[11px] font-medium"
            >
              <Plus className="h-3 w-3" /> Add device
            </button>
          </div>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {state.devices.map((d) => (
              <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-white/70">
                <div className="h-10 w-10 rounded-xl bg-white/80 border border-white/70 grid place-items-center">
                  {d.platform === "iOS" ? <Apple className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground font-mono truncate">
                    {d.deviceName} · {d.automationName} · v{d.platformVersion}
                  </div>
                </div>
                <button
                  onClick={() => removeDevice(project.id, d.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  aria-label="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <input ref={apkInputRef} type="file" accept=".apk,.ipa" className="hidden" onChange={onApkPicked} />
      <input ref={robotInputRef} type="file" multiple accept=".robot" className="hidden" onChange={onRobotPicked} />
      <input
        ref={robotFolderInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={onRobotPicked}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore webkitdirectory is required for folder upload in browsers that support it.
        webkitdirectory=""
      />

      {showDeviceForm && (
        <DeviceModal
          onClose={() => setShowDeviceForm(false)}
          onSave={(d) => {
            const dev = addDevice(project.id, d);
            setSelDevice(dev.id);
            setShowDeviceForm(false);
          }}
        />
      )}
    </div>
  );
}

function DeviceModal({
  onClose, onSave,
}: {
  onClose: () => void;
  onSave: (d: Omit<DeviceConfig, "id">) => void;
}) {
  const [name, setName] = useState("Pixel 8 Emulator");
  const [platform, setPlatform] = useState<"Android" | "iOS">("Android");
  const [deviceName, setDeviceName] = useState("emulator-5554");
  const [platformVersion, setPlatformVersion] = useState("14");
  const [automationName, setAutomationName] = useState("UiAutomator2");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl glass-strong p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-white/60">
          <X className="h-4 w-4" />
        </button>
        <h3 className="font-semibold text-lg mb-4">New device config</h3>
        <div className="space-y-3 text-sm">
          <Field label="Display name" value={name} onChange={setName} />
          <div>
            <label className="text-xs font-medium text-muted-foreground">Platform</label>
            <select
              value={platform}
              onChange={(e) => {
                const p = e.target.value as "Android" | "iOS";
                setPlatform(p);
                setAutomationName(p === "iOS" ? "XCUITest" : "UiAutomator2");
              }}
              className="w-full mt-1 bg-white/70 border border-white/70 rounded-lg px-2 py-1.5"
            >
              <option>Android</option>
              <option>iOS</option>
            </select>
          </div>
          <Field label="Device name (UDID / emulator id)" value={deviceName} onChange={setDeviceName} mono />
          <Field label="Platform version" value={platformVersion} onChange={setPlatformVersion} />
          <Field label="Automation driver" value={automationName} onChange={setAutomationName} mono />
        </div>
        <button
          onClick={() => onSave({ name, platform, deviceName, platformVersion, automationName })}
          className="mt-5 w-full px-4 py-2.5 rounded-xl bg-[image:var(--gradient-primary)] text-white text-sm font-semibold shadow"
        >
          Save device
        </button>
      </div>
    </div>
  );
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\/+/, "");
}

function normalizeFolder(path: string): string {
  return normalizePath(path).replace(/\/+$/, "");
}

function fileName(path: string): string {
  return normalizePath(path).split("/").pop() || "test.robot";
}

function pathDir(path: string): string {
  const normalized = normalizePath(path);
  const parts = normalized.split("/");
  parts.pop();
  return parts.join("/");
}

function buildTree(files: MobileScriptFile[], folderPaths: string[]): MobileFolderNode[] {
  const root: MobileFolderNode = { id: "root", name: "root", path: "", folders: [], files: [] };
  const allFolders = new Set<string>();

  folderPaths.filter(Boolean).forEach((f) => allFolders.add(normalizeFolder(f)));
  files.forEach((file) => {
    const parts = normalizePath(file.path).split("/");
    for (let i = 1; i < parts.length; i += 1) {
      allFolders.add(parts.slice(0, i).join("/"));
    }
  });

  const sortedFolders = Array.from(allFolders).sort((a, b) => a.localeCompare(b));
  sortedFolders.forEach((folderPath) => {
    addFolder(root, folderPath);
  });

  files.forEach((file) => {
    const dir = pathDir(file.path);
    const parent = findFolder(root, dir);
    parent.files.push(file);
  });

  sortTree(root);
  return root.folders;
}

function addFolder(root: MobileFolderNode, folderPath: string) {
  const parts = folderPath.split("/").filter(Boolean);
  let current = root;
  let built = "";
  parts.forEach((part) => {
    built = built ? `${built}/${part}` : part;
    let next = current.folders.find((f) => f.path === built);
    if (!next) {
      next = { id: `folder-${built}`, name: part, path: built, folders: [], files: [] };
      current.folders.push(next);
    }
    current = next;
  });
}

function findFolder(root: MobileFolderNode, folderPath: string): MobileFolderNode {
  if (!folderPath) return root;
  const parts = folderPath.split("/").filter(Boolean);
  let current = root;
  let built = "";
  for (const part of parts) {
    built = built ? `${built}/${part}` : part;
    const next = current.folders.find((f) => f.path === built);
    if (!next) return root;
    current = next;
  }
  return current;
}

function sortTree(folder: MobileFolderNode) {
  folder.folders.sort((a, b) => a.name.localeCompare(b.name));
  folder.files.sort((a, b) => a.name.localeCompare(b.name));
  folder.folders.forEach(sortTree);
}

function Field({
  label, value, onChange, mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full mt-1 bg-white/70 border border-white/70 rounded-lg px-2 py-1.5 ${mono ? "font-mono text-xs" : ""}`}
      />
    </div>
  );
}
