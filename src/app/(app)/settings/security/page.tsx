import Link from "next/link";
import { ArrowLeft, Server, Users, Cpu, Key, ScrollText } from "lucide-react";

const ACCESS_LOG = [
  { at: "2026-08-10 09:42", user: "Kyle Robitaille", action: "Signed in", resource: "workspace", ip: "142.150.44.12" },
  { at: "2026-08-10 09:43", user: "Kyle Robitaille", action: "Opened data room", resource: "deal-open", ip: "142.150.44.12" },
  { at: "2026-08-10 09:58", user: "Kyle Robitaille", action: "Exported report", resource: "Underwriting — Carrefour Trois-Rivières Ouest", ip: "142.150.44.12" },
  { at: "2026-08-10 10:12", user: "Kyle Robitaille", action: "Viewed document", resource: "Walmart Lease Executed.pdf", ip: "142.150.44.12" },
  { at: "2026-08-09 17:22", user: "Kyle Robitaille", action: "Ran tenant search", resource: "unit-prop-11-04", ip: "142.150.44.12" },
  { at: "2026-08-09 15:04", user: "Charles Beaulieu", action: "Signed in (read-only)", resource: "workspace", ip: "142.150.30.7" },
  { at: "2026-08-09 15:05", user: "Charles Beaulieu", action: "Viewed report", resource: "Underwriting — Sydney River Plaza", ip: "142.150.30.7" },
  { at: "2026-08-08 08:14", user: "Kyle Robitaille", action: "Updated standing rule", resource: "cap-rate-range", ip: "142.150.44.12" },
  { at: "2026-08-07 11:31", user: "Kyle Robitaille", action: "Signed in", resource: "workspace", ip: "142.150.44.12" },
  { at: "2026-08-06 09:18", user: "Kyle Robitaille", action: "Ran underwriting", resource: "deal-open", ip: "142.150.44.12" },
];

export default function SecurityPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <Link
        href="/settings"
        className="inline-flex items-center gap-1 text-[12px] text-slate hover:text-ink"
      >
        <ArrowLeft size={12} /> Settings
      </Link>
      <div className="eyebrow mt-2">Settings</div>
      <h1 className="font-display text-[24px] font-medium tracking-tight text-ink mt-0.5">
        Security &amp; hosting
      </h1>
      <p className="text-[13px] text-slate mt-1 max-w-2xl">
        The single reason this workspace exists: confidential documents stay on
        infrastructure EM controls. Everything below is a straightforward
        answer to a question a technical evaluator would ask.
      </p>

      <div className="mt-6 space-y-3">
        <Section
          icon={Server}
          title="Where documents are stored"
          body="Single-tenant instance on a dedicated Canadian region. All files are encrypted at rest (AES-256) and in transit (TLS 1.3). Backups are encrypted, retained 30 days, restorable on request. There is no shared multi-tenant database."
        />
        <Section
          icon={Users}
          title="How access is controlled"
          body="Password + optional SSO. Sessions expire after 12 hours idle. Roles: owner (Kyle), analyst (invite/view/run), read-only exec (view + download). Every read is logged. There is no external sharing surface — no public links, no anonymous invites."
        />
        <Section
          icon={Cpu}
          title="Model access"
          body="Document text is sent to the Anthropic API under a commercial agreement with EM Real Estate — no training on your data, zero-retention mode. Files themselves are stored only on your instance and never uploaded to any third-party consumer product. Every stage in the underwriting pipeline records exactly what was sent to the model, so the trail is auditable."
        />
        <Section
          icon={Key}
          title="Secrets"
          body="API keys and hosting credentials live in a managed secret store on your instance. Never sent to the browser, never checked into the repository."
        />
      </div>

      <h2 className="eyebrow mt-8 mb-2">Hosting options</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-card border border-rule rounded-sm p-4">
          <div className="font-display text-[14px] font-medium tracking-tight">
            Client-managed server
          </div>
          <p className="text-[12px] text-slate mt-1.5 leading-relaxed">
            EM operates the machine on premises or in their own cloud. Fastest
            path to complete control; requires IT to run patches, backups, and
            uptime.
          </p>
          <ul className="text-[11px] text-slate mt-2 space-y-1">
            <li>+ Full control · + Nothing leaves your network</li>
            <li>− You own operations · − Local uptime work</li>
          </ul>
        </div>
        <div className="bg-card border border-rule rounded-sm p-4">
          <div className="font-display text-[14px] font-medium tracking-tight">
            Dedicated private cloud (default)
          </div>
          <p className="text-[12px] text-slate mt-1.5 leading-relaxed">
            We operate a single-tenant instance in a Canadian AWS region on
            your behalf. Same isolation, no ops overhead.
          </p>
          <ul className="text-[11px] text-slate mt-2 space-y-1">
            <li>+ We handle uptime + patches</li>
            <li>+ Data stays in Canada</li>
            <li>− You depend on our operations SLA</li>
          </ul>
        </div>
      </div>

      <h2 className="eyebrow mt-8 mb-2 flex items-center gap-1.5">
        <ScrollText size={12} /> Access log · last 10 events
      </h2>
      <div className="bg-card border border-rule rounded-sm overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-card-2 border-b border-rule">
            <tr>
              <th className="eyebrow text-left px-3 h-8 w-[140px]">When</th>
              <th className="eyebrow text-left px-3 h-8">User</th>
              <th className="eyebrow text-left px-3 h-8">Action</th>
              <th className="eyebrow text-left px-3 h-8">Resource</th>
              <th className="eyebrow text-left px-3 h-8 w-[120px]">IP</th>
            </tr>
          </thead>
          <tbody>
            {ACCESS_LOG.map((row, i) => (
              <tr key={i} className="border-b border-rule-2 last:border-b-0">
                <td className="px-3 py-1.5 font-mono text-[11px] text-slate">
                  {row.at}
                </td>
                <td className="px-3 py-1.5">{row.user}</td>
                <td className="px-3 py-1.5">{row.action}</td>
                <td className="px-3 py-1.5 text-slate truncate">{row.resource}</td>
                <td className="px-3 py-1.5 font-mono text-[11px] text-slate">
                  {row.ip}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-card border border-rule rounded-sm p-4 flex gap-3">
      <div className="pt-0.5">
        <Icon size={14} className="text-slate" />
      </div>
      <div>
        <div className="font-display text-[14px] font-medium tracking-tight text-ink">
          {title}
        </div>
        <p className="text-[12px] text-slate mt-1 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
