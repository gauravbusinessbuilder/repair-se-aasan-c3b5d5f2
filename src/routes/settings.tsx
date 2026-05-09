import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore, FREE_LIMIT, PRO_PRICE, isProActive } from "@/lib/store";
import { useState } from "react";
import { Check, Crown, LogOut, Mail, Download, Lock, Users, ChevronRight } from "lucide-react";
import { STATUS_META } from "@/lib/types";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const navigate = useNavigate();
  const { shop, setShop, subscription, jobs, auth, logout } = useStore();
  const [form, setForm] = useState(shop);
  const [saved, setSaved] = useState(false);
  const [backupEmail, setBackupEmail] = useState(auth.email || "");

  const buildCsv = () => {
    const headers = ["Job ID","Customer","Phone","Device","Problem","Cost","Status","Paid","Created","Updated","Delivered","Notes"];
    const esc = (v: string | number | undefined) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const fmt = (t?: number) => t ? new Date(t).toLocaleString("en-IN") : "";
    const rows = jobs.map(j => [
      j.id, j.customerName, j.phone, j.device, j.problem, j.cost,
      STATUS_META[j.status].label, j.paid ? "Yes" : "No",
      fmt(j.createdAt), fmt(j.updatedAt), fmt(j.deliveredAt), j.notes || ""
    ].map(esc).join(","));
    return [headers.join(","), ...rows].join("\n");
  };

  const downloadCsv = () => {
    const csv = buildCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `repairflow-backup-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const emailBackup = () => {
    const email = backupEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Sahi email daalein");
      return;
    }
    downloadCsv();
    const subject = `RepairFlow Backup - ${shop.shopName} - ${new Date().toLocaleDateString("en-IN")}`;
    const body = `Namaste,\n\n${shop.shopName} ka customer data backup attached hai.\n\nTotal customers: ${jobs.length}\nDate: ${new Date().toLocaleString("en-IN")}\n\nCSV file abhi download ho gayi hai - is email me attach kar dijiye.\n\n- RepairFlow`;
    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };


  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setShop(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <AppShell title="Shop Setup" back="/">
      {(() => {
        const pro = isProActive(subscription);
        const expires = subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;
        return (
      <div className={`rounded-2xl p-4 mb-4 border ${pro ? "bg-status-ready/10 border-status-ready/30" : "bg-primary/5 border-primary/20"}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
              <Crown className={`h-4 w-4 ${pro ? "text-status-ready" : "text-primary"}`} />
              {pro ? "Pro Plan" : "Free Plan"}
            </div>
            <div className="text-sm mt-0.5 text-muted-foreground">
              {pro ? (expires ? `Valid till ${expires}` : "Unlimited customers") : `${jobs.length} / ${FREE_LIMIT} customers used`}
            </div>
          </div>
          {!pro && (
            <Link to="/upgrade" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold whitespace-nowrap">
              Get Pro · ₹{PRO_PRICE}
            </Link>
          )}
          {pro && (
            <Link to="/upgrade" className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold whitespace-nowrap">
              Renew
            </Link>
          )}
        </div>
      </div>
        );
      })()}

      <div className="rounded-2xl p-4 mb-4 bg-card border border-border flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Logged in as</div>
          <div className="font-bold">{auth.userId || "—"}</div>
        </div>
        <button
          onClick={() => { logout(); navigate({ to: "/login" }); }}
          className="px-3 py-2 rounded-xl bg-destructive/10 text-destructive font-bold text-sm flex items-center gap-1.5"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      <div className="rounded-2xl p-4 mb-4 bg-card border border-border">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="h-4 w-4 text-primary" />
          <div className="font-bold">Email Backup</div>
        </div>
        <div className="text-xs text-muted-foreground mb-3">
          Saare {jobs.length} customers ka CSV download karke email me bhejein
        </div>
        <input
          type="email"
          value={backupEmail}
          onChange={(e) => setBackupEmail(e.target.value)}
          placeholder="aapka@email.com"
          className="w-full px-4 py-3 rounded-xl border-2 border-input focus:border-primary bg-background outline-none text-base mb-2"
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={downloadCsv}
            disabled={jobs.length === 0}
            className="h-11 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> CSV
          </button>
          <button
            type="button"
            onClick={emailBackup}
            disabled={jobs.length === 0}
            className="h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Mail className="h-4 w-4" /> Email Bhejein
          </button>
        </div>
        <div className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
          Tip: CSV file download hogi + email app khulega. File ko email me manually attach karke bhej dijiye.
        </div>
      </div>

      <Link
        to="/customers"
        className="rounded-2xl p-4 mb-4 bg-card border border-border flex items-center justify-between active:scale-[0.99] transition"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold flex items-center gap-1.5">
              Customer List <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground">Password protected record</div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </Link>

      <form onSubmit={save} className="space-y-4 mt-2">
        <Field label="Shop Name *" value={form.shopName} onChange={(v) => setForm({ ...form, shopName: v })} placeholder="Sharma Mobile Repair" />
        <Field label="Owner Name" value={form.ownerName} onChange={(v) => setForm({ ...form, ownerName: v })} placeholder="Aapka naam" />
        <Field
          label="WhatsApp Number"
          value={form.whatsapp}
          onChange={(v) => setForm({ ...form, whatsapp: v.replace(/\D/g, "").slice(0, 10) })}
          placeholder="98765 43210"
          prefix="+91"
          inputMode="tel"
        />
        <Field label="Address (Optional)" value={form.address || ""} onChange={(v) => setForm({ ...form, address: v })} placeholder="Shop address" textarea />

        <button
          type="submit"
          className={`w-full h-14 rounded-2xl font-bold text-lg active:scale-[0.99] transition shadow-lg ${
            saved ? "bg-status-ready text-status-ready-foreground" : "bg-primary text-primary-foreground shadow-primary/30"
          } flex items-center justify-center gap-2`}
        >
          {saved ? <><Check className="h-5 w-5" /> Save Ho Gaya</> : "Save Karein"}
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        RepairFlow v1 · Data aapke phone me hi save hai
      </div>
    </AppShell>
  );
}

function Field({
  label, value, onChange, placeholder, prefix, textarea, inputMode,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; prefix?: string; textarea?: boolean;
  inputMode?: "text" | "tel" | "numeric";
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold mb-1.5 block">{label}</span>
      <div className="flex items-stretch rounded-2xl border-2 border-input focus-within:border-primary bg-card overflow-hidden">
        {prefix && (
          <span className="px-3 flex items-center bg-muted text-muted-foreground font-semibold text-sm border-r border-border">
            {prefix}
          </span>
        )}
        {textarea ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2}
            className="flex-1 px-4 py-3 bg-transparent outline-none text-base resize-none" />
        ) : (
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode}
            className="flex-1 px-4 py-3 bg-transparent outline-none text-base" />
        )}
      </div>
    </label>
  );
}
