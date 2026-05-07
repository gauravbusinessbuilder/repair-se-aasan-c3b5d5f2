import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore, fillTemplate, waLink, FREE_LIMIT, PRO_PRICE, isProActive } from "@/lib/store";
import { useState } from "react";
import { Crown, Send } from "lucide-react";

export const Route = createFileRoute("/add")({
  component: AddJob,
});

function AddJob() {
  const navigate = useNavigate();
  const { addJob, templates, shop, jobs, subscription } = useStore();
  const isPro = isProActive(subscription);
  const remaining = Math.max(0, FREE_LIMIT - jobs.length);
  const blocked = !isPro && jobs.length >= FREE_LIMIT;
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    device: "",
    problem: "",
    cost: "",
  });

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (blocked) { navigate({ to: "/upgrade" }); return; }
    if (!form.customerName.trim() || form.phone.length < 10 || !form.device.trim()) return;

    const job = addJob({
      customerName: form.customerName.trim(),
      phone: form.phone.replace(/\D/g, "").slice(-10),
      device: form.device.trim(),
      problem: form.problem.trim(),
      cost: Number(form.cost) || 0,
    });

    // Auto-trigger WhatsApp received message
    const tmpl = templates.find((t) => t.key === "received");
    if (tmpl) {
      const msg = fillTemplate(tmpl.body, {
        name: job.customerName,
        device: job.device,
        id: job.id,
        shop: shop.shopName,
        amount: job.cost,
      });
      window.open(waLink(job.phone, msg), "_blank");
    }

    navigate({ to: "/job/$id", params: { id: job.id } });
  };

  return (
    <AppShell title="Naya Repair" back="/">
      {blocked ? (
        <div className="mt-4 rounded-3xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/30 p-5 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-3">
            <Crown className="h-8 w-8" />
          </div>
          <h2 className="font-extrabold text-xl">Free Limit Khatam</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Aap ne {FREE_LIMIT} customers add kar liye hain. Unlimited customers ke liye Pro lein.
          </p>
          <Link
            to="/upgrade"
            className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/30"
          >
            <Crown className="h-4 w-4" /> Get Pro · ₹{PRO_PRICE}
          </Link>
        </div>
      ) : (
      <form onSubmit={submit} className="space-y-4 mt-2">
        {!isPro && (
          <div className="rounded-2xl bg-accent/50 border border-border p-2.5 text-xs text-center font-medium">
            {remaining} free customers bache hain · <Link to="/upgrade" className="text-primary font-bold underline">Upgrade</Link>
          </div>
        )}
        <Field label="Customer Name *" placeholder="Ramesh Kumar" value={form.customerName} onChange={set("customerName")} />
        <Field
          label="Phone Number *"
          placeholder="98765 43210"
          value={form.phone}
          onChange={(v) => set("phone")(v.replace(/\D/g, "").slice(0, 10))}
          inputMode="tel"
          prefix="+91"
        />
        <Field label="Device Model *" placeholder="Redmi Note 12, iPhone 13..." value={form.device} onChange={set("device")} />
        <Field
          label="Problem"
          placeholder="Screen tuta hai, charging nahi ho raha..."
          value={form.problem}
          onChange={set("problem")}
          textarea
        />
        <Field
          label="Estimated Cost"
          placeholder="1500"
          value={form.cost}
          onChange={(v) => set("cost")(v.replace(/\D/g, ""))}
          inputMode="numeric"
          prefix="₹"
        />

        <div className="rounded-2xl bg-whatsapp/10 border border-whatsapp/30 p-3 text-sm">
          <div className="flex items-start gap-2">
            <Send className="h-4 w-4 text-whatsapp mt-0.5 shrink-0" />
            <div className="text-foreground">
              <span className="font-bold">Auto WhatsApp:</span>{" "}
              <span className="text-muted-foreground">Save karte hi customer ko receive confirmation message bhej diya jayega.</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg active:scale-[0.99] shadow-lg shadow-primary/30"
        >
          Save & Send WhatsApp
        </button>
      </form>
      )}
    </AppShell>
  );
}

function Field({
  label, value, onChange, placeholder, textarea, inputMode, prefix,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; textarea?: boolean;
  inputMode?: "text" | "tel" | "numeric"; prefix?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground mb-1.5 block">{label}</span>
      <div className="flex items-stretch rounded-2xl border-2 border-input focus-within:border-primary bg-card overflow-hidden">
        {prefix && (
          <span className="px-3 flex items-center bg-muted text-muted-foreground font-semibold text-sm border-r border-border">
            {prefix}
          </span>
        )}
        {textarea ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="flex-1 px-4 py-3 bg-transparent outline-none text-base resize-none"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            inputMode={inputMode}
            className="flex-1 px-4 py-3 bg-transparent outline-none text-base"
          />
        )}
      </div>
    </label>
  );
}
