"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getDeal } from "@/mock/api/acquisitions";
import type { Deal } from "@/types";
import { DealChat } from "@/components/chat/DealChat";
import { TableSkeleton } from "@/components/data/Skeletons";

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <TableSkeleton rows={8} />
        </div>
      }
    >
      <ChatBody />
    </Suspense>
  );
}

function ChatBody() {
  const { dealId } = useParams<{ dealId: string }>();
  const search = useSearchParams();
  const initialQuery = search.get("q") ?? undefined;
  const [deal, setDeal] = useState<Deal | null>(null);

  useEffect(() => {
    (async () => setDeal(await getDeal(dealId)))();
  }, [dealId]);

  if (!deal)
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <TableSkeleton rows={8} />
      </div>
    );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <h2 className="eyebrow mb-4">Chat with the deal agent</h2>
      <DealChat deal={deal} initialQuery={initialQuery} />
    </div>
  );
}
