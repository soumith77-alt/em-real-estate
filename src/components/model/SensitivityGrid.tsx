"use client";
import { cn } from "@/lib/cn";
import { fmtPctPoints } from "@/lib/format";

interface Props {
  xLabel: string;
  yLabel: string;
  xValues: string[];
  yValues: string[];
  matrix: number[][]; // IRR values (0..1)
}

export function SensitivityGrid({
  xLabel,
  yLabel,
  xValues,
  yValues,
  matrix,
}: Props) {
  const flat = matrix.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  const scale = (v: number) => (max === min ? 0.5 : (v - min) / (max - min));

  return (
    <div className="bg-card border border-rule rounded-sm p-4">
      <div className="eyebrow mb-3">
        Sensitivity — IRR by {yLabel} × {xLabel}
      </div>
      <div className="overflow-auto">
        <table className="text-[11px] font-mono border-collapse min-w-full">
          <thead>
            <tr>
              <th className="text-[10px] text-slate-2 px-2 py-1 text-right eyebrow">
                {yLabel} \ {xLabel}
              </th>
              {xValues.map((x) => (
                <th
                  key={x}
                  className="text-slate px-2 py-1 text-right border-b border-rule"
                >
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {yValues.map((y, yi) => (
              <tr key={y}>
                <th className="text-slate px-2 py-1 text-right border-r border-rule">
                  {y}
                </th>
                {xValues.map((_, xi) => {
                  const v = matrix[yi][xi];
                  const t = scale(v);
                  return (
                    <td
                      key={xi}
                      className="px-2 py-1 text-right"
                      style={{
                        background:
                          v < 0.06
                            ? `rgba(158,53,32,${0.15 + (1 - t) * 0.15})`
                            : v > 0.12
                              ? `rgba(46,106,87,${0.15 + t * 0.2})`
                              : `rgba(200,205,215,${0.15 + t * 0.15})`,
                      }}
                    >
                      <span
                        className={cn(
                          v < 0.06
                            ? "text-fail"
                            : v > 0.12
                              ? "text-pass"
                              : "text-ink",
                        )}
                      >
                        {fmtPctPoints(v * 100)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
