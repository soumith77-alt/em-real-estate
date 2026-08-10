"use client";
import { useRef, useState } from "react";
import { FolderUp } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  onDrop: (fileCount: number) => void;
}

export function UploadDropzone({ onDrop }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        onDrop(e.dataTransfer.files?.length ?? 0);
      }}
      className={cn(
        "border-2 border-dashed rounded-sm p-4 text-center transition-colors",
        drag
          ? "border-blueprint bg-blueprint/5"
          : "border-rule bg-card/40",
      )}
    >
      <FolderUp size={22} className="mx-auto text-slate mb-1.5" />
      <div className="text-[13px] text-ink">Drop a folder to ingest</div>
      <div className="text-[11px] text-slate mt-0.5">
        We accept the full data-room folder — subfolders, messy names, all of it
      </div>
      <button
        onClick={() => inputRef.current?.click()}
        className="mt-2.5 h-8 px-3 text-[12px] text-blueprint hover:underline"
      >
        Choose folder…
      </button>
      <input
        ref={inputRef}
        type="file"
        // Non-standard attributes for folder upload
        {...({ webkitdirectory: "true", directory: "true" } as unknown as Record<
          string,
          string
        >)}
        multiple
        onChange={(e) => onDrop(e.target.files?.length ?? 0)}
        className="hidden"
      />
    </div>
  );
}
