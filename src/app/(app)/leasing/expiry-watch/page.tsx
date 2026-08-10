"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { listExpiries, listReminders, saveExpirySettings } from "@/mock/api/leasing";
import { db } from "@/mock/db";
import type { Tenant } from "@/types";
import type { Reminder } from "@/mock/fixtures/reminders";
import { TableSkeleton } from "@/components/data/Skeletons";
import { fmtDate, daysUntil } from "@/lib/format";
import { toast } from "sonner";

export default function ExpiryWatch() {
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [reminders, setReminders] = useState<Reminder[] | null>(null);
  const [notice, setNotice] = useState(6);
  const [sendDay, setSendDay] = useState(1);

  useEffect(() => {
    (async () => {
      const [t, r] = await Promise.all([listExpiries(), listReminders()]);
      setTenants(t);
      setReminders(r);
    })();
  }, []);

  async function save() {
    await saveExpirySettings({
      noticeMonths: notice,
      recipients: ["kyle@emrealestate.ca"],
      sendDay,
    });
    toast.success("Expiry watch settings saved");
  }

  if (!tenants || !reminders)
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <TableSkeleton rows={12} />
      </div>
    );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="eyebrow">Leasing · Expiry watch</div>
      <h1 className="font-display text-[24px] font-medium tracking-tight text-ink mt-0.5">
        Lease expiry watch
      </h1>
      <p className="text-[13px] text-slate mt-1 max-w-2xl">
        The workspace watches lease end dates and emails you when notice
        needs to be given. It does nothing else.
      </p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <div className="space-y-4">
          <div className="bg-card border border-rule rounded-sm p-4">
            <div className="eyebrow mb-3">Settings</div>
            <div className="space-y-3">
              <label className="block">
                <div className="eyebrow mb-1">Notice interval</div>
                <select
                  value={notice}
                  onChange={(e) => setNotice(Number(e.target.value))}
                  className="w-full h-8 px-2 border border-rule bg-paper rounded-sm text-[13px]"
                >
                  <option value={3}>3 months before expiry</option>
                  <option value={6}>6 months before expiry (default)</option>
                  <option value={9}>9 months before expiry</option>
                  <option value={12}>12 months before expiry</option>
                </select>
              </label>
              <label className="block">
                <div className="eyebrow mb-1">Recipients</div>
                <div className="text-[13px] text-ink bg-paper border border-rule px-3 h-8 flex items-center rounded-sm">
                  kyle@emrealestate.ca
                </div>
                <div className="text-[11px] text-slate-2 mt-1">
                  Kyle only. No tenants, no brokers. Ever.
                </div>
              </label>
              <label className="block">
                <div className="eyebrow mb-1">Send day</div>
                <select
                  value={sendDay}
                  onChange={(e) => setSendDay(Number(e.target.value))}
                  className="w-full h-8 px-2 border border-rule bg-paper rounded-sm text-[13px]"
                >
                  <option value={1}>First Monday of the month</option>
                  <option value={2}>15th of the month</option>
                </select>
              </label>
              <button
                onClick={save}
                className="w-full h-9 bg-blueprint text-card rounded-sm text-[13px] font-medium hover:bg-blueprint-hover"
              >
                Save settings
              </button>
            </div>
          </div>

          <div className="border border-blueprint/30 bg-blueprint/5 rounded-sm p-4 text-[12px] text-ink leading-relaxed">
            <div className="eyebrow text-blueprint mb-1.5">
              What this watch does
            </div>
            This watch notifies <span className="font-medium">you</span>. It
            does not start a tenant search. When you want candidates for a
            unit, start the search yourself — the manual link is in every
            row.
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="eyebrow mb-2">
              Upcoming expiries · {tenants.length}
            </h2>
            <div className="bg-card border border-rule rounded-sm overflow-hidden">
              <table className="w-full text-[13px]">
                <thead className="bg-card-2 border-b border-rule">
                  <tr>
                    <th className="eyebrow text-left px-3 h-9">Tenant</th>
                    <th className="eyebrow text-left px-3 h-9">Property</th>
                    <th className="eyebrow text-left px-3 h-9 w-[110px]">Expiry</th>
                    <th className="eyebrow text-right px-3 h-9 w-[80px]">Days</th>
                    <th className="eyebrow text-right px-3 h-9 w-[100px]">Options</th>
                    <th className="eyebrow text-right px-3 h-9 w-[150px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t) => {
                    const p = db.properties.find((x) => x.id === t.propertyId);
                    const u = db.units.find((x) => x.id === t.unitId);
                    const d = daysUntil(t.endDate);
                    return (
                      <tr
                        key={t.id}
                        className="border-b border-rule-2 last:border-b-0"
                      >
                        <td className="px-3 py-2">
                          <Link
                            href={`/vault/${t.id}`}
                            className="text-ink hover:underline"
                          >
                            {t.brand}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-slate">
                          {p?.name}, {p?.town}
                        </td>
                        <td className="px-3 py-2 font-mono">
                          {fmtDate(t.endDate)}
                        </td>
                        <td className="px-3 py-2 font-mono text-right">
                          {d != null ? `${d}d` : "—"}
                        </td>
                        <td className="px-3 py-2 font-mono text-right text-slate">
                          {t.optionsToRenew}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {u && (
                            <Link
                              href={`/leasing/search?unit=${u.id}`}
                              className="text-[11px] text-blueprint hover:underline"
                            >
                              Start tenant search →
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="eyebrow mb-2">
              Reminder log · {reminders.length} notifications
            </h2>
            <div className="bg-card border border-rule rounded-sm divide-y divide-rule-2 max-h-[380px] overflow-y-auto">
              {reminders.map((r) => {
                const t = db.tenants.find((x) => x.id === r.tenantId);
                return (
                  <div
                    key={r.id}
                    className="flex items-baseline gap-3 px-3 py-2 text-[12px]"
                  >
                    <span className="font-mono text-[11px] text-slate-2 w-[90px] shrink-0">
                      {r.sentAt.slice(0, 10)}
                    </span>
                    <span className="text-ink flex-1 min-w-0 truncate">
                      Sent notice for{" "}
                      <span className="font-medium">{t?.brand}</span> —
                      expires {r.expiryDate.slice(0, 7)}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider ${r.acknowledged ? "text-pass" : "text-signal"}`}
                    >
                      {r.acknowledged ? "acknowledged" : "unread"}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="text-[11px] text-slate-2 mt-2">
              Only Kyle receives these notifications — they are never sent to
              tenants or third parties.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
