import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore, fillTemplate, waLink } from "@/lib/store";
import { JobCard } from "@/components/JobCard";
import { Send } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/followups")({
  component: FollowUps,
});

const DAY = 24 * 60 * 60 * 1000;

function FollowUps() {
  const { jobs, templates, shop } = useStore();

  const { pending, oldCustomers } = useMemo(() => {
    const now = Date.now();
    const pending = jobs.filter((j) => j.status === "ready" && now - j.updatedAt > 0);
    const oldCustomers = jobs.filter(
      (j) => j.status === "delivered" && j.deliveredAt && now - j.deliveredAt > 30 * DAY
    );
    return { pending, oldCustomers };
  }, [jobs]);

  const sendReminder = (jobId: string, key: string) => {
    const job = jobs.find((j) => j.id === jobId);
    const tmpl = templates.find((t) => t.key === key);
    if (!job || !tmpl) return;
    const msg = fillTemplate(tmpl.body, {
      name: job.customerName, device: job.device, id: job.id,
      shop: shop.shopName, amount: job.cost,
    });
    window.open(waLink(job.phone, msg), "_blank");
  };

  return (
    <AppShell title="Follow-Ups" back="/">
      <section className="mt-2">
        <h2 className="font-bold mb-1">Pickup Pending</h2>
        <p className="text-xs text-muted-foreground mb-3">Ready hai par customer aaye nahi</p>
        {pending.length === 0 ? (
          <Empty msg="Sab pickups complete hai 🎉" />
        ) : (
          <div className="space-y-2">
            {pending.map((j) => (
              <div key={j.id} className="space-y-2">
                <JobCard job={j} />
                <button
                  onClick={() => sendReminder(j.id, "followup")}
                  className="w-full h-11 rounded-xl bg-whatsapp text-whatsapp-foreground font-semibold flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" /> Pickup Reminder Bhejein
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-7">
        <h2 className="font-bold mb-1">Purane Customers (30+ din)</h2>
        <p className="text-xs text-muted-foreground mb-3">Feedback ya re-engagement ke liye</p>
        {oldCustomers.length === 0 ? (
          <Empty msg="Abhi koi purana customer nahi" />
        ) : (
          <div className="space-y-2">
            {oldCustomers.map((j) => (
              <div key={j.id} className="space-y-2">
                <JobCard job={j} />
                <button
                  onClick={() => sendReminder(j.id, "feedback")}
                  className="w-full h-11 rounded-xl bg-secondary font-semibold flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" /> Feedback Mango
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-center py-8 text-sm text-muted-foreground rounded-2xl border-2 border-dashed border-border">{msg}</div>;
}
