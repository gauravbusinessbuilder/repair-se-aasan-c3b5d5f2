import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { RefreshCw, Save } from "lucide-react";

export const Route = createFileRoute("/templates")({
  component: Templates,
});

function Templates() {
  const { templates, upsertTemplate, resetTemplates } = useStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <AppShell title="Message Templates" back="/">
      <p className="text-sm text-muted-foreground mb-3">
        Variables: <code className="bg-muted px-1 rounded">{"{{name}}"}</code>{" "}
        <code className="bg-muted px-1 rounded">{"{{device}}"}</code>{" "}
        <code className="bg-muted px-1 rounded">{"{{id}}"}</code>{" "}
        <code className="bg-muted px-1 rounded">{"{{amount}}"}</code>{" "}
        <code className="bg-muted px-1 rounded">{"{{shop}}"}</code>
      </p>

      <div className="space-y-3">
        {templates.map((t) => {
          const isEdit = editing === t.id;
          return (
            <div key={t.id} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-bold">{t.label}</div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{t.key}</div>
                </div>
                {!isEdit && (
                  <button
                    onClick={() => { setEditing(t.id); setDraft(t.body); }}
                    className="text-primary font-semibold text-sm px-3 py-1.5 rounded-lg bg-primary/10"
                  >
                    Edit
                  </button>
                )}
              </div>
              {isEdit ? (
                <>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border-2 border-input focus:border-primary bg-background p-3 text-sm outline-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => { upsertTemplate({ ...t, body: draft }); setEditing(null); }}
                      className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2"
                    >
                      <Save className="h-4 w-4" /> Save
                    </button>
                    <button onClick={() => setEditing(null)} className="px-4 h-11 rounded-xl bg-secondary font-semibold">
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{t.body}</p>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => { if (confirm("Sab templates default pe reset karein?")) resetTemplates(); }}
        className="mt-6 w-full h-12 rounded-xl text-muted-foreground font-medium text-sm flex items-center justify-center gap-2"
      >
        <RefreshCw className="h-4 w-4" /> Reset to defaults
      </button>
    </AppShell>
  );
}
