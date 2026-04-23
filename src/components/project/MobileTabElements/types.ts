export interface MobileScriptFile {
  id: string;
  name: string;
  path: string;
  scriptId: string;
}

export interface MobileFolderNode {
  id: string;
  name: string;
  path: string;
  folders: MobileFolderNode[];
  files: MobileScriptFile[];
}
