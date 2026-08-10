"use client";
import { useMemo, useState } from "react";
import type { DataRoomFile } from "@/types";
import { cn } from "@/lib/cn";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface Props {
  files: DataRoomFile[];
  onOpen: (file: DataRoomFile) => void;
  onRetryOcr?: (file: DataRoomFile) => void;
}

interface Node {
  name: string;
  path: string;
  children: Map<string, Node>;
  files: DataRoomFile[];
}

function buildTree(files: DataRoomFile[]): Node {
  const root: Node = {
    name: "",
    path: "",
    children: new Map(),
    files: [],
  };
  for (const f of files) {
    const parts = f.path.split("/");
    const fileName = parts.pop() ?? f.name;
    let node = root;
    let pathAcc = "";
    for (const p of parts) {
      pathAcc = pathAcc ? `${pathAcc}/${p}` : p;
      if (!node.children.has(p)) {
        node.children.set(p, {
          name: p,
          path: pathAcc,
          children: new Map(),
          files: [],
        });
      }
      node = node.children.get(p)!;
    }
    node.files.push({ ...f, name: fileName });
  }
  return root;
}

function fileIcon(ext: string) {
  if (ext === "pdf") return FileText;
  if (ext === "xlsx" || ext === "csv") return FileSpreadsheet;
  if (["png", "jpg", "jpeg", "tif"].includes(ext)) return FileImage;
  return File;
}

function StatusChip({ status }: { status: DataRoomFile["status"] }) {
  const map = {
    indexed: { icon: CheckCircle2, cls: "text-pass", label: "indexed" },
    queued: { icon: Loader2, cls: "text-slate animate-spin", label: "queued" },
    "needs-ocr": {
      icon: AlertTriangle,
      cls: "text-signal",
      label: "needs OCR",
    },
    failed: { icon: XCircle, cls: "text-fail", label: "failed" },
  } as const;
  const { icon: Icon, cls, label } = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider", cls)}>
      <Icon size={11} />
      <span>{label}</span>
    </span>
  );
}

function fmtSize(kb: number) {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

function NodeView({
  node,
  depth,
  onOpen,
  onRetryOcr,
}: {
  node: Node;
  depth: number;
  onOpen: (f: DataRoomFile) => void;
  onRetryOcr?: (f: DataRoomFile) => void;
}) {
  const [open, setOpen] = useState(depth < 2);
  const isRoot = depth === 0;

  const dirs = Array.from(node.children.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div>
      {!isRoot && (
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 py-1.5 w-full text-left hover:bg-blueprint/5"
          style={{ paddingLeft: `${depth * 14 + 6}px` }}
        >
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <span className="text-[13px] text-ink font-medium">{node.name}</span>
          <span className="ml-2 text-[10px] font-mono text-slate-2">
            {countFiles(node)} files
          </span>
        </button>
      )}
      {open && (
        <div>
          {dirs.map((d) => (
            <NodeView
              key={d.path}
              node={d}
              depth={depth + 1}
              onOpen={onOpen}
              onRetryOcr={onRetryOcr}
            />
          ))}
          {node.files.map((f) => {
            const Icon = fileIcon(f.ext);
            return (
              <div
                key={f.id}
                className="flex items-center gap-2 py-1.5 hover:bg-blueprint/5 group"
                style={{ paddingLeft: `${(depth + 1) * 14 + 12}px` }}
              >
                <Icon size={12} className="text-slate-2" />
                <button
                  onClick={() => onOpen(f)}
                  className="text-[13px] text-ink truncate hover:underline underline-offset-2 text-left flex-1 min-w-0"
                >
                  {f.name}
                </button>
                <span className="text-[10px] font-mono text-slate-2 shrink-0">
                  {fmtSize(f.sizeKB)}
                  {f.pages ? ` · ${f.pages}p` : ""}
                </span>
                <StatusChip status={f.status} />
                {f.status === "needs-ocr" && onRetryOcr && (
                  <button
                    onClick={() => onRetryOcr(f)}
                    className="text-[10px] text-blueprint hover:underline"
                  >
                    Send for OCR
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function countFiles(n: Node): number {
  let c = n.files.length;
  for (const child of n.children.values()) c += countFiles(child);
  return c;
}

export function FileTree({ files, onOpen, onRetryOcr }: Props) {
  const tree = useMemo(() => buildTree(files), [files]);
  return (
    <div className="bg-card border border-rule rounded-sm py-2">
      <NodeView
        node={tree}
        depth={0}
        onOpen={onOpen}
        onRetryOcr={onRetryOcr}
      />
    </div>
  );
}
