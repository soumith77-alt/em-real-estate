"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { listDataRoom, resolveOcr } from "@/mock/api/acquisitions";
import { FileTree } from "@/components/docs/FileTree";
import { UploadDropzone } from "@/components/docs/UploadDropzone";
import type { DataRoomFile } from "@/types";
import { TableSkeleton } from "@/components/data/Skeletons";
import { toast } from "sonner";
import { AlertTriangle, X } from "lucide-react";

export default function DataRoomPage() {
  const { dealId } = useParams<{ dealId: string }>();
  const [files, setFiles] = useState<DataRoomFile[] | null>(null);
  const [preview, setPreview] = useState<DataRoomFile | null>(null);
  const [ingest, setIngest] = useState<{ total: number; done: number } | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      const list = await listDataRoom(dealId);
      setFiles(list);
    })();
  }, [dealId]);

  async function onDrop() {
    if (!files) return;
    const queued = files.filter((f) => f.status === "queued");
    if (queued.length === 0) {
      toast.info("Ingest already complete. Reset by reloading.");
      return;
    }
    setIngest({ total: queued.length, done: 0 });
    // Simulate staged ingest
    for (let i = 0; i < queued.length; i++) {
      await new Promise((r) => setTimeout(r, 150 + Math.random() * 250));
      setFiles((prev) =>
        prev
          ? prev.map((f) =>
              f.id === queued[i].id ? { ...f, status: "indexed" } : f,
            )
          : prev,
      );
      setIngest((prev) =>
        prev ? { ...prev, done: prev.done + 1 } : prev,
      );
    }
    setIngest(null);
    const failures = (files ?? []).filter(
      (f) => f.status === "failed" || f.status === "needs-ocr",
    );
    if (failures.length > 0) {
      toast.warning(
        `Ingest complete — ${failures.length} files need your attention.`,
      );
    } else {
      toast.success("Ingest complete.");
    }
  }

  async function retryOcr(file: DataRoomFile) {
    toast.info(`Sending ${file.name} to OCR…`);
    await resolveOcr(file.id);
    setFiles((prev) =>
      prev
        ? prev.map((f) => (f.id === file.id ? { ...f, status: "indexed" } : f))
        : prev,
    );
    toast.success(`${file.name} indexed after OCR`);
  }

  if (!files) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <TableSkeleton rows={12} />
      </div>
    );
  }

  const total = files.length;
  const indexed = files.filter((f) => f.status === "indexed").length;
  const failed = files.filter((f) => f.status === "failed");
  const needsOcr = files.filter((f) => f.status === "needs-ocr");

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="eyebrow">Data room</h2>
        <div className="text-[12px] font-mono text-slate">
          {indexed} of {total} indexed
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div>
          <FileTree files={files} onOpen={setPreview} onRetryOcr={retryOcr} />
        </div>

        <div className="space-y-3">
          <UploadDropzone onDrop={onDrop} />
          {ingest && (
            <div className="bg-card border border-rule rounded-sm p-3">
              <div className="flex items-baseline justify-between text-[12px]">
                <span className="eyebrow">Ingesting</span>
                <span className="font-mono">
                  {ingest.done} / {ingest.total}
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-paper rounded-sm overflow-hidden">
                <div
                  className="h-full bg-blueprint transition-all"
                  style={{ width: `${(ingest.done / ingest.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {(failed.length > 0 || needsOcr.length > 0) && (
            <div className="border border-signal/30 bg-signal-tint/40 rounded-sm p-3">
              <div className="flex items-center gap-1.5 eyebrow text-signal mb-2">
                <AlertTriangle size={11} />
                Attention needed
              </div>
              <ul className="space-y-2.5 text-[12px]">
                {failed.map((f) => (
                  <li key={f.id}>
                    <div className="text-ink font-medium truncate">
                      {f.name}
                    </div>
                    <div className="text-slate leading-snug mt-0.5">
                      {f.failureReason ?? "Failed"}
                    </div>
                  </li>
                ))}
                {needsOcr.map((f) => (
                  <li key={f.id}>
                    <div className="text-ink font-medium truncate">
                      {f.name}
                    </div>
                    <div className="text-slate leading-snug mt-0.5">
                      {f.failureReason ??
                        "Scan without a text layer. Send for OCR to include this file."}
                    </div>
                    <button
                      onClick={() => retryOcr(f)}
                      className="mt-1.5 h-7 px-2.5 text-[11px] bg-blueprint text-card rounded-sm hover:bg-blueprint-hover"
                    >
                      Send for OCR
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-[11px] text-slate-2 leading-relaxed">
            Every file that lands here stays inside EM&rsquo;s private
            infrastructure. Nothing is sent to a consumer AI product.
          </div>
        </div>
      </div>

      {preview && (
        <div
          role="dialog"
          className="fixed inset-0 z-50 bg-ink/40 grid place-items-end"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPreview(null);
          }}
        >
          <div className="bg-card w-full max-w-[720px] h-full border-l border-rule flex flex-col">
            <div className="flex items-center justify-between px-5 h-14 border-b border-rule">
              <div className="min-w-0">
                <div className="eyebrow">File preview</div>
                <div className="text-[14px] text-ink truncate">
                  {preview.name}
                </div>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="text-slate hover:text-ink p-1"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-5 grid grid-cols-2 gap-4">
              <div className="border border-rule rounded-sm bg-paper p-4 text-[12px] font-mono text-slate">
                <div className="eyebrow mb-2">Document view</div>
                <div className="space-y-1.5 leading-relaxed">
                  {[
                    "PROPERTY CONDITION ASSESSMENT",
                    "",
                    `Prepared for: EM Real Estate`,
                    `File: ${preview.name}`,
                    `Pages: ${preview.pages ?? "—"}`,
                    "",
                    "1. Executive summary",
                    "The subject property is a strip retail centre",
                    "anchored by Walmart Supercentre. Original",
                    "construction 1998; last major renovation 2016.",
                    "Roof estimated remaining life 8–10 years.",
                    "",
                    "2. Environmental observations",
                    "No visible signs of contamination. Records show",
                    "a former Petro-Canada fuel bar removed in 2004.",
                    "Phase II ESA recommended (see 03 Environmental).",
                  ].map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                </div>
              </div>
              <div>
                <div className="eyebrow mb-2">Extracted text</div>
                <div className="text-[12px] text-slate leading-relaxed">
                  <p>
                    Extracted from {preview.name}. This is stand-in text
                    demonstrating the panel; a production build would render
                    the parsed text with structural markup and citation
                    anchors.
                  </p>
                </div>
                <div className="mt-4 eyebrow mb-2">Metadata</div>
                <dl className="grid grid-cols-2 gap-y-1 text-[11px]">
                  <dt className="text-slate">Path</dt>
                  <dd className="font-mono text-ink truncate" title={preview.path}>
                    {preview.path}
                  </dd>
                  <dt className="text-slate">Size</dt>
                  <dd className="font-mono text-ink">{preview.sizeKB} KB</dd>
                  <dt className="text-slate">Status</dt>
                  <dd className="font-mono text-ink capitalize">
                    {preview.status.replace(/-/g, " ")}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
