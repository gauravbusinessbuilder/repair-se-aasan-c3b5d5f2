import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore, fillTemplate, waLink } from "@/lib/store";
import { useMemo, useState } from "react";
import { Check, Copy, MessageSquare, Send, Users } from "lucide-react";

export const Route = createFileRoute("/bulk")({
  component: BulkSend,
});

function BulkSend() {
  const { jobs, templates, shop } = useStore();
  const [templateId, setTemplateId] = useState(templates[0]?.id || "");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(
    () => (statusFilter === "all" ? jobs : jobs.filter((j) => j.status === statusFilter)),
    [jobs, statusFilter]
  );

  const tmpl = templates.find((t) => t.id === templateId);

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((j) => j.id)));
  };

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

  const buildMessages = () =>
    filtered
      .filter((j) => selected.has(j.id))
      .map((j) => {
        const msg = tmpl ? fillTemplate(tmpl.body, {
          name: j.customerName, device: j.device, id: j.id, shop: shop.shopName, amount: j.cost,
        }) : "";
        return { job: j, msg, link: waLink(j.phone, msg) };
      });

  const copyAll = async () => {
    const items = buildMessages();
    const text = items
      .map((i) => `+91 ${i.job.phone}  (${i.job.customerName})\n${i.msg}\n`)
      .join("\n----------------\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      alert("Copy nahi hua, manually select karein");
    }
  };

  const items = buildMessages();
  const filters: { k: string; label: string }[] = [
    { k: "all", label: "Sab" },
    { k: "received", label: "Naya" },
    { k: "ready", label: "Tayar" },
    { k: "delivered", label: "Delivered" },
    { k: "waiting", label: "Waiting" },
  ];

  return (
    <AppShell title="Bulk Message" back="/">
      <p className="text-sm text-muted-foreground mt-1 mb-3">
        Ek template chunein, customers select karein, aur sab messages clipboard pe copy karein.
      </p>

      {/* Template picker */}
      <label className="block mb-3">
        <span className="text-sm font-semibold mb-1.5 block flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4" /> Template
        </span>
        <select
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border-2 border-input focus:border-primary bg-card outline-none text-base font-medium"
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </label>

      {/* Status filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 mb-3">
        {filters.map((f) => (
          <button
            key={f.k}
            onClick={() => setStatusFilter(f.k)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border ${
              statusFilter === f.k
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Customer list */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Users className="h-4 w-4" /> {selected.size} / {filtered.length} selected
          </div>
          <button onClick={toggleAll} className="text-primary text-sm font-bold">
            {selected.size === filtered.length && filtered.length > 0 ? "Clear" : "Select All"}
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            Koi customer nahi mila
          </div>
        ) : (
          <ul className="divide-y divide-border max-h-[40vh] overflow-y-auto">
            {filtered.map((j) => {
              const isSel = selected.has(j.id);
              return (
                <li key={j.id}>
                  <button
                    onClick={() => toggle(j.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 active:bg-muted text-left"
                  >
                    <span className={`h-6 w-6 rounded-md border-2 flex items-center justify-center shrink-0 ${
                      isSel ? "bg-primary border-primary text-primary-foreground" : "border-input"
                    }`}>
                      {isSel && <Check className="h-4 w-4" strokeWidth={3} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm truncate">{j.customerName}</div>
                      <div className="text-xs text-muted-foreground truncate">+91 {j.phone} · {j.device}</div>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">#{j.id}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Preview first message */}
      {items.length > 0 && tmpl && (
        <div className="mt-4 bg-accent/40 border border-border rounded-2xl p-3">
          <div className="text-[11px] uppercase font-bold text-muted-foreground mb-1">Preview (1st msg)</div>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{items[0].msg}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 grid grid-cols-1 gap-2 sticky bottom-24">
        <button
          onClick={copyAll}
          disabled={selected.size === 0}
          className={`w-full h-14 rounded-2xl font-bold text-base active:scale-[0.99] shadow-lg flex items-center justify-center gap-2 ${
            copied
              ? "bg-status-ready text-status-ready-foreground shadow-status-ready/30"
              : "bg-primary text-primary-foreground shadow-primary/30 disabled:opacity-50 disabled:shadow-none"
          }`}
        >
          {copied ? (<><Check className="h-5 w-5" /> Copy Ho Gaya — {selected.size} messages</>) : (<><Copy className="h-5 w-5" /> Copy {selected.size > 0 ? selected.size : ""} Messages</>)}
        </button>
        {items.length > 0 && (
          <a
            href={items[0].link}
            target="_blank"
            rel="noreferrer"
            className="w-full h-12 rounded-2xl bg-whatsapp text-white font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" /> Pehla WhatsApp Open Karein
          </a>
        )}
      </div>
    </AppShell>
  );
}
