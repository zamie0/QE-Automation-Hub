import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  FileCode2,
  Folder,
  FolderPlus,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import type { MobileFolderNode, MobileScriptFile } from "../types";

interface FileExplorerProps {
  tree: MobileFolderNode[];
  expanded: Record<string, boolean>;
  selectedFileId: string;
  onToggleFolder: (path: string) => void;
  onSelectFile: (file: MobileScriptFile) => void;
  onRunFile: (file: MobileScriptFile) => void;
  onDeleteFile: (file: MobileScriptFile) => void;
  onDeleteFolder: (path: string) => void;
  onUploadFolder: () => void;
  onUploadRobot: () => void;
  onCreateFolder: () => void;
  onCreateRobot: () => void;
}

type ExplorerNodeType = "file" | "folder";

interface ExplorerNode {
  name: string;
  type: ExplorerNodeType;
  path: string;
  children: ExplorerNode[];
  script?: MobileScriptFile;
}

interface ContextMenuState {
  path: string;
  x: number;
  y: number;
}

export function FileExplorer({
  tree,
  expanded: externalExpanded,
  selectedFileId: externalSelectedFileId,
  onToggleFolder,
  onSelectFile,
  onRunFile,
  onDeleteFile,
  onDeleteFolder,
  onUploadFolder: _onUploadFolder,
  onUploadRobot: _onUploadRobot,
  onCreateFolder: _onCreateFolder,
  onCreateRobot: _onCreateRobot,
}: FileExplorerProps) {
  const initializedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  const [fileTree, setFileTree] = useState<ExplorerNode[]>(() => reindexPaths(fromExternalTree(tree)));
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ ...externalExpanded });
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [contextMenuTarget, setContextMenuTarget] = useState<ContextMenuState | null>(null);
  const [deleteTargetPath, setDeleteTargetPath] = useState<string>("");
  const [dragOverPath, setDragOverPath] = useState<string>("");

  useEffect(() => {
    if (initializedRef.current) return;
    setFileTree(reindexPaths(fromExternalTree(tree)));
    initializedRef.current = true;
  }, [tree]);

  useEffect(() => {
    setExpandedFolders((prev) => ({ ...externalExpanded, ...prev }));
  }, [externalExpanded]);

  useEffect(() => {
    function closeMenu(e: MouseEvent) {
      if (!contextMenuRef.current?.contains(e.target as Node)) setContextMenuTarget(null);
    }
    window.addEventListener("mousedown", closeMenu);
    return () => window.removeEventListener("mousedown", closeMenu);
  }, []);

  useEffect(() => {
    if (!externalSelectedFileId || selectedFilePath) return;
    const node = findByScriptId(fileTree, externalSelectedFileId);
    if (node) setSelectedFilePath(node.path);
  }, [externalSelectedFileId, fileTree, selectedFilePath]);

  const selectedNode = useMemo(() => findNode(fileTree, selectedFilePath), [fileTree, selectedFilePath]);
  const hasNodes = fileTree.length > 0;

  function openMenu(path: string, x: number, y: number) {
    const menuWidth = 190;
    const menuHeight = 170;
    const pad = 8;
    const maxX = window.innerWidth - menuWidth - pad;
    const maxY = window.innerHeight - menuHeight - pad;
    setContextMenuTarget({
      path,
      x: Math.max(pad, Math.min(x, maxX)),
      y: Math.max(pad, Math.min(y, maxY)),
    });
  }

  function toggleFolder(path: string) {
    setExpandedFolders((prev) => ({ ...prev, [path]: !(prev[path] ?? true) }));
    onToggleFolder(path);
  }

  function defaultTargetFolder(): string {
    if (!selectedNode) return "";
    return selectedNode.type === "folder" ? selectedNode.path : parentPath(selectedNode.path);
  }

  function createFolderInteractive() {
    const base = defaultTargetFolder();
    const input = window.prompt(`Create folder in "${base || "Workspace"}"`);
    if (input === null) return;
    if (!addFolder(base, input)) {
      window.alert("Folder name cannot be empty and must be unique in the same directory.");
      return;
    }
  }

  function createRobotInteractive() {
    const base = defaultTargetFolder();
    const input = window.prompt(`Create .robot file in "${base || "Workspace"}"`);
    if (input === null) return;
    if (!addRobotFile(base, input)) {
      window.alert("Only .robot files are allowed and file name must be unique in the same directory.");
      return;
    }
  }

  function addFolder(folderPath: string, nameRaw: string): boolean {
    const name = nameRaw.trim();
    if (!name || name.includes("/")) return false;
    const siblings = getChildrenAt(fileTree, folderPath);
    if (!siblings) return false;
    if (siblings.some((s) => s.type === "folder" && s.name.toLowerCase() === name.toLowerCase())) return false;
    setFileTree((prev) => reindexPaths(insertChild(prev, folderPath, { name, type: "folder", path: "", children: [] })));
    const nextPath = joinPath(folderPath, name);
    setExpandedFolders((prev) => ({ ...prev, [folderPath]: true, [nextPath]: true }));
    return true;
  }

  function addRobotFile(folderPath: string, input: string): boolean {
    const fileName = normalizeRobotFileName(input);
    if (!fileName) return false;
    const siblings = getChildrenAt(fileTree, folderPath);
    if (!siblings) return false;
    if (siblings.some((s) => s.type === "file" && s.name.toLowerCase() === fileName.toLowerCase())) return false;
    const scriptPath = joinPath(folderPath, fileName);
    const node: ExplorerNode = {
      name: fileName,
      type: "file",
      path: "",
      children: [],
      script: { id: `local-${Date.now()}`, name: fileName, path: scriptPath, scriptId: `local-${Date.now()}-${Math.random()}` },
    };
    setFileTree((prev) => reindexPaths(insertChild(prev, folderPath, node)));
    setExpandedFolders((prev) => ({ ...prev, [folderPath]: true }));
    return true;
  }

  function selectFile(node: ExplorerNode) {
    if (node.type !== "file" || !node.script) return;
    setSelectedFilePath(node.path);
    onSelectFile(node.script);
  }

  function runFile(node: ExplorerNode) {
    if (node.type !== "file" || !node.script) return;
    onRunFile(node.script);
  }

  function renameNode(path: string) {
    const current = findNode(fileTree, path);
    if (!current) return;
    const raw = window.prompt(`Rename "${current.name}"`, current.name);
    if (raw === null) return;
    const nextName = current.type === "file" ? renameRobotName(current.name, raw) : raw.trim();
    if (!nextName) {
      window.alert("Name cannot be empty.");
      return;
    }
    const siblings = getChildrenAt(fileTree, parentPath(path)) || [];
    const duplicate = siblings.some((s) => s.path !== path && s.name.toLowerCase() === nextName.toLowerCase());
    if (duplicate) {
      window.alert("Duplicate name in the same directory.");
      return;
    }
    setFileTree((prev) =>
      reindexPaths(
        updateNode(prev, path, (n) => ({
          ...n,
          name: nextName,
          script: n.script ? { ...n.script, name: nextName } : undefined,
        })),
      ),
    );
  }

  function duplicateNode(path: string) {
    const current = findNode(fileTree, path);
    if (!current) return;
    const parent = parentPath(path);
    const siblings = getChildrenAt(fileTree, parent) || [];
    const nextName = getCopyName(current.name, current.type, siblings.map((s) => s.name));
    const copy = cloneNode(current);
    copy.name = nextName;
    setFileTree((prev) => reindexPaths(insertChild(prev, parent, copy)));
  }

  function moveNodeDialog(path: string) {
    const current = findNode(fileTree, path);
    if (!current) return;
    const destinationInput = window.prompt(`Move "${current.name}" to folder path (empty = Workspace)`, "");
    if (destinationInput === null) return;
    const destination = normalizePath(destinationInput);
    if (!canMove(fileTree, path, destination)) {
      window.alert("Invalid move target: blocked self-move, child-move, or duplicate name.");
      return;
    }
    setFileTree((prev) => reindexPaths(moveNodeTo(prev, path, destination)));
    setExpandedFolders((prev) => ({ ...prev, [destination]: true }));
  }

  function requestDelete(path: string) {
    setDeleteTargetPath(path);
    setContextMenuTarget(null);
  }

  function confirmDelete() {
    const target = findNode(fileTree, deleteTargetPath);
    if (!target) {
      setDeleteTargetPath("");
      return;
    }
    setFileTree((prev) => reindexPaths(removeNode(prev, deleteTargetPath)));
    if (target.type === "folder") onDeleteFolder(target.path);
    if (target.type === "file" && target.script) onDeleteFile(target.script);
    if (selectedFilePath === deleteTargetPath) setSelectedFilePath("");
    setDeleteTargetPath("");
  }

  function ingestFiles(files: FileList | null) {
    if (!files?.length) return;
    const unique = new Map<string, File>();
    Array.from(files).forEach((file) => {
      const rel = normalizePath((file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name);
      if (!file.name.toLowerCase().endsWith(".robot")) return;
      if (!unique.has(rel.toLowerCase())) unique.set(rel.toLowerCase(), file);
    });
    const robotFiles = Array.from(unique.values());
    if (!robotFiles.length) return;

    setFileTree((prev) => {
      let next = [...prev];
      robotFiles.forEach((file) => {
        const rel = normalizePath((file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name);
        const directory = parentPath(rel);
        next = ensureFolderPath(next, directory);

        const fileName = normalizeRobotFileName(filePart(rel));
        if (!fileName) return;
        const siblings = getChildrenAt(next, directory) || [];
        if (siblings.some((s) => s.type === "file" && s.name.toLowerCase() === fileName.toLowerCase())) return;

        next = insertChild(next, directory, {
          name: fileName,
          type: "file",
          path: "",
          children: [],
          script: {
            id: `upload-${Date.now()}-${Math.random()}`,
            name: fileName,
            path: joinPath(directory, fileName),
            scriptId: `upload-${Date.now()}-${Math.random()}`,
          },
        });
      });
      return reindexPaths(next);
    });
  }

  function handleDropUpload(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    ingestFiles(e.dataTransfer.files);
    setDragOverPath("");
  }

  return (
    <div className="rounded-3xl glass p-5 relative h-[560px] flex flex-col" onDragOver={(e) => e.preventDefault()} onDrop={handleDropUpload}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-semibold">Robot test explorer</h3>
          <p className="text-[11px] text-muted-foreground">IDE-style explorer for suites and `.robot` scripts</p>
        </div>
        <div className="flex items-center gap-1.5">
          <ActionButton onClick={() => folderInputRef.current?.click()} icon={<Upload className="h-3 w-3" />} label="Upload folder" />
          <ActionButton onClick={() => fileInputRef.current?.click()} icon={<Upload className="h-3 w-3" />} label="Upload file" />
          <ActionButton onClick={createFolderInteractive} icon={<FolderPlus className="h-3 w-3" />} label="New folder" />
          <ActionButton onClick={createRobotInteractive} icon={<Plus className="h-3 w-3" />} label="New robot" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/70 bg-white/50 p-3 flex-1 min-h-0 overflow-y-auto">
        {!hasNodes ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Drop a folder here or create files and folders manually.
          </p>
        ) : (
          <div className="space-y-1">
            {fileTree.map((node) => (
              <NodeRow
                key={node.path}
                node={node}
                level={0}
                expandedFolders={expandedFolders}
                selectedFilePath={selectedFilePath}
                dragOverPath={dragOverPath}
                onToggleFolder={toggleFolder}
                onSelectFile={selectFile}
                onRunFile={runFile}
                onOpenContextMenu={openMenu}
                onDragPath={setDragOverPath}
                onMovePath={(fromPath, toFolderPath) => {
                  if (!canMove(fileTree, fromPath, toFolderPath)) return;
                  setFileTree((prev) => reindexPaths(moveNodeTo(prev, fromPath, toFolderPath)));
                }}
              />
            ))}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".robot"
        multiple
        className="hidden"
        onChange={(e) => {
          ingestFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          ingestFiles(e.target.files);
          e.target.value = "";
        }}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore Folder upload attribute.
        webkitdirectory=""
      />

      {contextMenuTarget && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 min-w-[170px] rounded-xl border border-white/70 bg-white shadow-lg p-1"
          style={{ left: contextMenuTarget.x, top: contextMenuTarget.y }}
        >
          <MenuItem icon={<Pencil className="h-3.5 w-3.5" />} label="Rename" onClick={() => { renameNode(contextMenuTarget.path); setContextMenuTarget(null); }} />
          <MenuItem icon={<Copy className="h-3.5 w-3.5" />} label="Copy" onClick={() => { duplicateNode(contextMenuTarget.path); setContextMenuTarget(null); }} />
          <MenuItem icon={<Folder className="h-3.5 w-3.5" />} label="Move to..." onClick={() => { moveNodeDialog(contextMenuTarget.path); setContextMenuTarget(null); }} />
          <MenuItem icon={<Trash2 className="h-3.5 w-3.5" />} label="Delete" danger onClick={() => requestDelete(contextMenuTarget.path)} />
        </div>
      )}

      {deleteTargetPath && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 border border-white/70 shadow-xl">
            <h4 className="font-semibold mb-2">Delete Item</h4>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete:</p>
            <p className="text-sm font-mono mt-1 mb-3">"{deleteTargetPath}"</p>
            <p className="text-xs text-destructive mb-4">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTargetPath("")} className="px-3 py-1.5 rounded-lg border border-border text-sm">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NodeRow({
  node,
  level,
  expandedFolders,
  selectedFilePath,
  dragOverPath,
  onToggleFolder,
  onSelectFile: onSelectFileNode,
  onRunFile: onRunFileNode,
  onOpenContextMenu,
  onDragPath,
  onMovePath,
}: {
  node: ExplorerNode;
  level: number;
  expandedFolders: Record<string, boolean>;
  selectedFilePath: string;
  dragOverPath: string;
  onToggleFolder: (path: string) => void;
  onSelectFile: (node: ExplorerNode) => void;
  onRunFile: (node: ExplorerNode) => void;
  onOpenContextMenu: (path: string, x: number, y: number) => void;
  onDragPath: (path: string) => void;
  onMovePath: (fromPath: string, toFolderPath: string) => void;
}) {
  const isFolder = node.type === "folder";
  const isOpen = expandedFolders[node.path] ?? true;
  const isSelected = node.type === "file" && selectedFilePath === node.path;
  const isDropTarget = isFolder && dragOverPath === node.path;

  return (
    <div className="space-y-1">
      <div
        className={[
          "group flex items-center gap-2 rounded-lg px-2 py-1.5 border",
          isSelected ? "bg-primary/10 border-primary/40" : "border-transparent hover:bg-white/70",
          isDropTarget ? "ring-1 ring-primary" : "",
        ].join(" ")}
        style={{ paddingLeft: `${level * 14 + 6}px` }}
        draggable
        onDragStart={(e) => {
          if ((e.target as HTMLElement).closest("button")) {
            e.preventDefault();
            return;
          }
          e.dataTransfer.setData("text/x-path", node.path);
          onDragPath(node.path);
        }}
        onDragOver={(e) => {
          if (!isFolder) return;
          e.preventDefault();
          onDragPath(node.path);
        }}
        onDrop={(e) => {
          if (!isFolder) return;
          e.preventDefault();
          const from = e.dataTransfer.getData("text/x-path");
          if (!from) return;
          onMovePath(from, node.path);
          onDragPath("");
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenContextMenu(node.path, e.clientX, e.clientY);
        }}
      >
        {isFolder ? (
          <button
            onClick={() => onToggleFolder(node.path)}
            className="h-4 w-4 grid place-items-center rounded hover:bg-white"
          >
            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {isFolder ? (
          <Folder className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        ) : (
          <FileCode2 className="h-3.5 w-3.5 text-primary shrink-0" />
        )}

        <button
          onClick={() => {
            if (isFolder) onToggleFolder(node.path);
            else onSelectFileNode(node);
          }}
          onDoubleClick={() => {
            if (isFolder) onToggleFolder(node.path);
          }}
          className="text-left text-sm flex-1 truncate"
        >
          {node.name}
        </button>

        {!isFolder && (
          <button
            onClick={() => onRunFileNode(node)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-emerald-100 text-muted-foreground hover:text-emerald-700"
            aria-label="Run script"
          >
            <Play className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenContextMenu(node.path, e.clientX, e.clientY);
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white text-muted-foreground"
          aria-label="Actions"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      </div>

      {isFolder && isOpen && (
        <div className="space-y-1">
          {node.children.map((child) => (
            <NodeRow
              key={child.path}
              node={child}
              level={level + 1}
              expandedFolders={expandedFolders}
              selectedFilePath={selectedFilePath}
              dragOverPath={dragOverPath}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFileNode}
              onRunFile={onRunFileNode}
              onOpenContextMenu={onOpenContextMenu}
              onDragPath={onDragPath}
              onMovePath={onMovePath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2",
        danger ? "hover:bg-destructive/10 text-destructive" : "hover:bg-white",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}

function ActionButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-white/70 border border-white/70 hover:bg-white"
    >
      {icon}
      {label}
    </button>
  );
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
}

function normalizeRobotFileName(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  return trimmed.toLowerCase().endsWith(".robot") ? trimmed : `${trimmed}.robot`;
}

function renameRobotName(oldName: string, nextInput: string): string {
  const trimmed = nextInput.trim();
  if (!trimmed) return "";
  if (!oldName.toLowerCase().endsWith(".robot")) return trimmed;
  const base = trimmed.replace(/\.robot$/i, "");
  return `${base}.robot`;
}

function joinPath(parent: string, name: string): string {
  const p = normalizePath(parent);
  const n = normalizePath(name);
  if (!p) return n;
  if (!n) return p;
  return `${p}/${n}`;
}

function parentPath(path: string): string {
  const normalized = normalizePath(path);
  if (!normalized) return "";
  const parts = normalized.split("/");
  parts.pop();
  return parts.join("/");
}

function filePart(path: string): string {
  const parts = normalizePath(path).split("/");
  return parts[parts.length - 1] || "";
}

function fromExternalTree(tree: MobileFolderNode[]): ExplorerNode[] {
  return tree.map((folder) => ({
    name: folder.name,
    type: "folder",
    path: normalizePath(folder.path),
    children: [
      ...fromExternalTree(folder.folders),
      ...folder.files.map((file) => ({
        name: file.name,
        type: "file" as const,
        path: normalizePath(file.path),
        children: [],
        script: file,
      })),
    ],
  }));
}

function reindexPaths(nodes: ExplorerNode[], parent = ""): ExplorerNode[] {
  return nodes
    .map((node) => {
      const path = joinPath(parent, node.name);
      return {
        ...node,
        path,
        children: node.type === "folder" ? reindexPaths(node.children, path) : [],
        script: node.script ? { ...node.script, name: node.name, path } : undefined,
      };
    })
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

function findNode(nodes: ExplorerNode[], targetPath: string): ExplorerNode | null {
  const normalized = normalizePath(targetPath);
  for (const node of nodes) {
    if (node.path === normalized) return node;
    const nested = findNode(node.children, normalized);
    if (nested) return nested;
  }
  return null;
}

function findByScriptId(nodes: ExplorerNode[], scriptId: string): ExplorerNode | null {
  for (const node of nodes) {
    if (node.type === "file" && node.script?.id === scriptId) return node;
    const nested = findByScriptId(node.children, scriptId);
    if (nested) return nested;
  }
  return null;
}

function getChildrenAt(nodes: ExplorerNode[], folderPath: string): ExplorerNode[] | null {
  const normalized = normalizePath(folderPath);
  if (!normalized) return nodes;
  const folder = findNode(nodes, normalized);
  if (!folder || folder.type !== "folder") return null;
  return folder.children;
}

function insertChild(nodes: ExplorerNode[], folderPath: string, child: ExplorerNode): ExplorerNode[] {
  const normalized = normalizePath(folderPath);
  if (!normalized) return [...nodes, child];
  return nodes.map((node) => {
    if (node.path === normalized && node.type === "folder") return { ...node, children: [...node.children, child] };
    return { ...node, children: insertChild(node.children, normalized, child) };
  });
}

function updateNode(nodes: ExplorerNode[], targetPath: string, updater: (n: ExplorerNode) => ExplorerNode): ExplorerNode[] {
  const normalized = normalizePath(targetPath);
  return nodes.map((node) => {
    if (node.path === normalized) return updater(node);
    if (!node.children.length) return node;
    return { ...node, children: updateNode(node.children, normalized, updater) };
  });
}

function removeNode(nodes: ExplorerNode[], targetPath: string): ExplorerNode[] {
  const normalized = normalizePath(targetPath);
  return nodes
    .filter((node) => node.path !== normalized)
    .map((node) => ({ ...node, children: removeNode(node.children, normalized) }));
}

function pullNode(nodes: ExplorerNode[], targetPath: string): { node: ExplorerNode | null; tree: ExplorerNode[] } {
  const normalized = normalizePath(targetPath);
  let found: ExplorerNode | null = null;
  function walk(items: ExplorerNode[]): ExplorerNode[] {
    return items
      .filter((i) => {
        if (i.path === normalized) {
          found = i;
          return false;
        }
        return true;
      })
      .map((i) => ({ ...i, children: walk(i.children) }));
  }
  return { node: found, tree: walk(nodes) };
}

function moveNodeTo(nodes: ExplorerNode[], fromPath: string, toFolderPath: string): ExplorerNode[] {
  const pulled = pullNode(nodes, fromPath);
  if (!pulled.node) return nodes;
  return insertChild(pulled.tree, toFolderPath, pulled.node);
}

function canMove(nodes: ExplorerNode[], fromPath: string, toFolderPath: string): boolean {
  const from = normalizePath(fromPath);
  const to = normalizePath(toFolderPath);
  const moving = findNode(nodes, from);
  if (!moving) return false;
  if (from === to) return false;
  if (moving.type === "folder" && to && (to === from || to.startsWith(`${from}/`))) return false;
  if (to) {
    const destination = findNode(nodes, to);
    if (!destination || destination.type !== "folder") return false;
  }
  const siblings = getChildrenAt(nodes, to) || [];
  if (siblings.some((s) => s.path !== from && s.name.toLowerCase() === moving.name.toLowerCase())) return false;
  return true;
}

function cloneNode(node: ExplorerNode): ExplorerNode {
  return {
    ...node,
    children: node.children.map(cloneNode),
    script: node.script ? { ...node.script, id: `copy-${Date.now()}-${Math.random()}`, scriptId: `copy-${Date.now()}-${Math.random()}` } : undefined,
  };
}

function getCopyName(name: string, type: ExplorerNodeType, siblingNames: string[]): string {
  const low = new Set(siblingNames.map((n) => n.toLowerCase()));
  if (type === "folder") {
    const base = `${name}_copy`;
    if (!low.has(base.toLowerCase())) return base;
    let i = 1;
    while (low.has(`${base}(${i})`.toLowerCase())) i += 1;
    return `${base}(${i})`;
  }
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : ".robot";
  const first = `${base}_copy${ext}`;
  if (!low.has(first.toLowerCase())) return first;
  let i = 1;
  while (low.has(`${base}_copy(${i})${ext}`.toLowerCase())) i += 1;
  return `${base}_copy(${i})${ext}`;
}

function ensureFolderPath(nodes: ExplorerNode[], folderPath: string): ExplorerNode[] {
  let next = nodes;
  const parts = normalizePath(folderPath).split("/").filter(Boolean);
  let built = "";
  parts.forEach((part) => {
    built = built ? `${built}/${part}` : part;
    if (!findNode(next, built)) {
      const parent = parentPath(built);
      const currentChildren = getChildrenAt(next, parent);
      if (!currentChildren) return;
      // Reindex immediately so subsequent path checks in this loop see the new folder.
      next = reindexPaths(insertChild(next, parent, { name: part, type: "folder", path: "", children: [] }));
    }
  });
  return reindexPaths(next);
}
