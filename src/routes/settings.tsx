import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { Check } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const { shop, setShop } = useStore();
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
