import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore, FREE_LIMIT, PRO_PRICE } from "@/lib/store";
import { useState } from "react";
import { Check, Crown, LogOut } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const navigate = useNavigate();
  const { shop, setShop, subscription, jobs, auth, logout } = useStore();
  const [form, setForm] = useState(shop);
  const [saved, setSaved] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setShop(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <AppShell title="Shop Setup" back="/">
      <div className={`rounded-2xl p-4 mb-4 border ${subscription.pro ? "bg-status-ready/10 border-status-ready/30" : "bg-primary/5 border-primary/20"}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
              <Crown className={`h-4 w-4 ${subscription.pro ? "text-status-ready" : "text-primary"}`} />
              {subscription.pro ? "Pro Plan" : "Free Plan"}
            </div>
            <div className="text-sm mt-0.5 text-muted-foreground">
              {subscription.pro ? "Unlimited customers" : `${jobs.length} / ${FREE_LIMIT} customers used`}
            </div>
          </div>
          {!subscription.pro && (
            <Link to="/upgrade" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold whitespace-nowrap">
              Get Pro · ₹{PRO_PRICE}
            </Link>
          )}
        </div>
      </div>

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
