"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getDeal } from "@/mock/api/acquisitions";
import type { Deal } from "@/types";
import { ScenarioCalculator } from "@/components/model/ScenarioCalculator";
import { TableSkeleton } from "@/components/data/Skeletons";

export default function ModelPage() {
  const { dealId } = useParams<{ dealId: string }>();
  const [deal, setDeal] = useState<Deal | null>(null);

  useEffect(() => {
    (async () => {
      const d = await getDeal(dealId);
      setDeal(d);
    })();
  }, [dealId]);

  if (!deal)
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <TableSkeleton rows={10} />
      </div>
    );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="eyebrow">Financing scenario</h2>
        <div className="text-[11px] text-slate max-w-md text-right">
          Real math, real recalculation. The Excel export includes live
          formulas — changing LTV in Excel updates DSCR.
        </div>
      </div>

      <ScenarioCalculator
        dealName={deal.propertyName}
        askingPrice={deal.askingPrice}
        gla={deal.gla}
        goingInCap={deal.capRate}
      />
    </div>
  );
}
