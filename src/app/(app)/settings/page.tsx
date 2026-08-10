"use client";
import { useState } from "react";
import { db } from "@/mock/db";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, ShieldCheck } from "lucide-react";
import { fmtDate } from "@/lib/format";
import type { WorkspaceUser } from "@/mock/fixtures/users";

export default function SettingsPage() {
  const [users, setUsers] = useState<WorkspaceUser[]>(db.users);
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"analyst" | "read-only">("analyst");

  function invite() {
    if (!email) return;
    setUsers((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        name: email.split("@")[0],
        email,
        role,
        status: "pending",
        invitedOn: "2026-08-10",
      },
    ]);
    setEmail("");
    setInviting(false);
    toast.success("Invitation sent (mock)");
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <div className="eyebrow">Settings</div>
      <h1 className="font-display text-[24px] font-medium tracking-tight text-ink mt-0.5">
        Workspace
      </h1>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/settings/security"
          className="bg-card border border-rule rounded-sm p-4 hover:border-blueprint"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-slate" />
            <div className="font-display text-[15px] font-medium tracking-tight">
              Security &amp; hosting
            </div>
          </div>
          <p className="text-[12px] text-slate mt-1.5">
            Where data lives, who can see it, access log.
          </p>
        </Link>
        <div className="bg-card border border-rule rounded-sm p-4">
          <div className="font-display text-[15px] font-medium tracking-tight">
            Workspace name
          </div>
          <div className="text-[13px] text-ink mt-1">EM Real Estate</div>
          <div className="text-[11px] text-slate-2 mt-0.5">
            single-tenant instance · Montréal, QC
          </div>
        </div>
      </div>

      <h2 className="eyebrow mt-8 mb-2">Users</h2>
      <p className="text-[12px] text-slate mb-3">
        Single user at launch. More seats can be added when needed — analyst
        or read-only exec.
      </p>

      <div className="bg-card border border-rule rounded-sm overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="bg-card-2 border-b border-rule">
            <tr>
              <th className="eyebrow text-left px-3 h-9">Name</th>
              <th className="eyebrow text-left px-3 h-9">Email</th>
              <th className="eyebrow text-left px-3 h-9 w-[110px]">Role</th>
              <th className="eyebrow text-left px-3 h-9 w-[110px]">Status</th>
              <th className="eyebrow text-right px-3 h-9 w-[110px]">Invited</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-rule-2 last:border-b-0">
                <td className="px-3 py-2 text-ink">{u.name}</td>
                <td className="px-3 py-2 font-mono text-slate">{u.email}</td>
                <td className="px-3 py-2 text-slate capitalize">{u.role}</td>
                <td className="px-3 py-2">
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                      u.status === "active"
                        ? "bg-pass-tint text-pass"
                        : "bg-signal-tint text-signal"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-right text-[11px] text-slate">
                  {fmtDate(u.invitedOn)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        {!inviting ? (
          <button
            onClick={() => setInviting(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3 border border-rule bg-card hover:border-blueprint rounded-sm text-[12px]"
          >
            <Plus size={12} /> Invite user
          </button>
        ) : (
          <div className="flex gap-2 items-center bg-card border border-rule rounded-sm p-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@company"
              className="flex-1 h-8 px-3 border border-rule bg-paper rounded-sm text-[12px]"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "analyst" | "read-only")}
              className="h-8 px-2 border border-rule bg-paper rounded-sm text-[12px]"
            >
              <option value="analyst">Analyst</option>
              <option value="read-only">Read-only exec</option>
            </select>
            <button
              onClick={invite}
              className="h-8 px-3 bg-blueprint text-card rounded-sm text-[12px] font-medium"
            >
              Send invite
            </button>
            <button
              onClick={() => setInviting(false)}
              className="h-8 px-3 text-[12px] text-slate hover:text-ink"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
