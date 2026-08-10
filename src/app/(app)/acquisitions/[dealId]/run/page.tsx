"use client";
import { useParams, useRouter } from "next/navigation";
import { PipelineRunner } from "@/components/pipeline/PipelineRunner";

export default function RunPage() {
  const { dealId } = useParams<{ dealId: string }>();
  const router = useRouter();
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <h2 className="eyebrow mb-4">Run underwriting</h2>
      <PipelineRunner
        dealId={dealId}
        onComplete={() =>
          setTimeout(() => router.push(`/acquisitions/${dealId}/report`), 800)
        }
      />
    </div>
  );
}
