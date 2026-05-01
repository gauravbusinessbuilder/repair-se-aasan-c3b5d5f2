import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { useMemo } from "react";
import { TrendingUp, IndianRupee, Wrench, AlertCircle } from "lucide-react";
import { STATUS_META } from "@/lib/types";

export const Route = createFileRoute("/analytics")({
  component: Analytics,
});

function Analytics() {
  const { jobs } = useStore();

  const stats = useMemo(() => {
    const total = jobs.length;
    const earnings = jobs.filter((j) => j.paid).reduce((s, j) => s + j.cost, 0);
    const pending = jobs.filter((j) => !j.paid && j.status === "delivered").reduce((s, j) => s + j.cost, 0);
    const byStatus = jobs.reduce<Record<string, number>>((acc, j) => {
      acc[j.status] = (acc[j.status] || 0) + 1;
      return acc;
    }, {});
    return { total, earnings, pending, byStatus };
  }, [jobs]);

  return (
    <AppShell title="Analytics" back="/">
      <div className="grid grid-cols-2 gap-3 mt-2">
        <Big icon={Wrench} label="Total Repairs" value={stats.total} tint="bg-primary/10 text-primary" />
        <Big icon={TrendingUp} label="Earnings" value={`₹${stats.earnings}`} tint="bg-status-ready/15 text-status-ready" />
        <Big icon={IndianRupee} label="Avg Bill" value={stats.total ? `₹${Math.round(stats.earnings / Math.max(stats.total, 1))}` : "₹0"} tint="bg-status-waiting/15 text-status-waiting" />
        <Big icon={AlertCircle} label="Pending" value={`₹${stats.pending}`} tint="bg-destructive/10 text-destructive" />
      </div>

      <section className="mt-6 bg-card border border-border rounded-2xl p-4">
        <h3 className="font-bold mb-3">Status Breakdown</h3>
        <div className="space-y-2">
          {Object.entries(STATUS_META).map(([k, m]) => {
            const count = stats.byStatus[k] || 0;
            const pct = stats.total ? (count / stats.total) * 100 : 0;
            return (
              <div key={k}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold">{m.hinglish}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${m.bg}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}

function Big({ icon: Icon, label, value, tint }: { icon: typeof Wrench; label: string; value: string | number; tint: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${tint}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-2 text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
    </div>
  );
}
