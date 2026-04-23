import { ChevronDown, ChevronRight, FileCode2, Folder, FolderPlus, Play, Plus, Trash2, Upload } from "lucide-react";
import type { MobileFolderNode, MobileScriptFile } from "./types";

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

export function FileExplorer({
  tree,
  expanded,
  selectedFileId,
  onToggleFolder,
  onSelectFile,
  onRunFile,
  onDeleteFile,
  onDeleteFolder,
  onUploadFolder,
  onUploadRobot,
  onCreateFolder,
  onCreateRobot,
}: FileExplorerProps) {
  return (
    <div className="rounded-3xl glass p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-semibold">Robot test explorer</h3>
          <p className="text-[11px] text-muted-foreground">Upload folder or create `.robot` scripts manually</p>
        </div>
        <div className="flex items-center gap-1.5">
          <ActionButton onClick={onUploadFolder} icon={<Upload className="h-3 w-3" />} label="Upload folder" />
          <ActionButton onClick={onUploadRobot} icon={<Upload className="h-3 w-3" />} label="Upload file" />
          <ActionButton onClick={onCreateFolder} icon={<FolderPlus className="h-3 w-3" />} label="New folder" />
          <ActionButton onClick={onCreateRobot} icon={<Plus className="h-3 w-3" />} label="New robot" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/70 bg-white/50 p-3 min-h-[240px]">
        {tree.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            No scripts yet. Upload a suite folder or create files.
          </p>
        ) : (
          <div className="space-y-1">
            {tree.map((folder) => (
              <FolderRow
                key={folder.path}
                folder={folder}
                level={0}
                expanded={expanded}
                selectedFileId={selectedFileId}
                onToggleFolder={onToggleFolder}
                onSelectFile={onSelectFile}
                onRunFile={onRunFile}
                onDeleteFile={onDeleteFile}
                onDeleteFolder={onDeleteFolder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FolderRow({
  folder,
  level,
  expanded,
  selectedFileId,
  onToggleFolder,
  onSelectFile,
  onRunFile,
  onDeleteFile,
  onDeleteFolder,
}: {
  folder: MobileFolderNode;
  level: number;
  expanded: Record<string, boolean>;
  selectedFileId: string;
  onToggleFolder: (path: string) => void;
  onSelectFile: (file: MobileScriptFile) => void;
  onRunFile: (file: MobileScriptFile) => void;
  onDeleteFile: (file: MobileScriptFile) => void;
  onDeleteFolder: (path: string) => void;
}) {
  const isOpen = expanded[folder.path] ?? true;
  const indent = { paddingLeft: `${level * 14}px` };

  return (
    <div className="space-y-1">
      <div className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/70" style={indent}>
        <button onClick={() => onToggleFolder(folder.path)} className="h-4 w-4 grid place-items-center rounded hover:bg-white">
          {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
        <Folder className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        <span className="text-sm font-medium">{folder.name}</span>
        <button
          onClick={() => onDeleteFolder(folder.path)}
          className="ml-auto opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
          aria-label="Delete folder"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {isOpen && (
        <div className="space-y-1">
          {folder.folders.map((child) => (
            <FolderRow
              key={child.path}
              folder={child}
              level={level + 1}
              expanded={expanded}
              selectedFileId={selectedFileId}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFile}
              onRunFile={onRunFile}
              onDeleteFile={onDeleteFile}
              onDeleteFolder={onDeleteFolder}
            />
          ))}
          {folder.files.map((file) => (
            <div
              key={file.id}
              className={[
                "group flex items-center gap-2 rounded-lg px-2 py-1.5 border",
                file.id === selectedFileId
                  ? "bg-primary/10 border-primary/40"
                  : "bg-white/60 border-white/70 hover:bg-white",
              ].join(" ")}
              style={{ paddingLeft: `${(level + 1) * 14 + 24}px` }}
            >
              <FileCode2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <button onClick={() => onSelectFile(file)} className="text-left text-sm flex-1 truncate">
                {file.name}
              </button>
              <button
                onClick={() => onRunFile(file)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-emerald-100 text-muted-foreground hover:text-emerald-700"
                aria-label="Run script"
              >
                <Play className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDeleteFile(file)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                aria-label="Delete script"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
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
