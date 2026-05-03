import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { JobCard } from "@/components/JobCard";
import { Plus, MessageSquare, FileText, IndianRupee, Wrench, Clock } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RepairFlow – Mobile Shop Manager" },
      { name: "description", content: "Manage mobile repair jobs, send WhatsApp updates, generate invoices in 2 taps." },
      { name: "theme-color", content: "#3b1d8a" },
    ],
    links: [{ rel: "manifest", href: "/manifest.webmanifest" }],
  }),
  component: Index,
});

function Index() {
  const { jobs, shop } = useStore();

  const { active, pickups, todayEarn } = useMemo(() => {
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const active = jobs.filter((j) => j.status !== "delivered");
    const pickups = jobs.filter((j) => j.status === "ready");
    const todayEarn = jobs
      .filter((j) => j.deliveredAt && j.deliveredAt >= startOfDay.getTime() && j.paid)
      .reduce((s, j) => s + j.cost, 0);
    return { active, pickups, todayEarn };
  }, [jobs]);

  const isFirstRun = !shop.ownerName && jobs.length === 0;

  return (
    <AppShell>
      <div className="safe-top">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm text-muted-foreground">Namaste 🙏</p>
            <h1 className="text-2xl font-extrabold tracking-tight">{shop.shopName || "RepairFlow"}</h1>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md shadow-primary/20">
            {(shop.ownerName || "R").slice(0, 1).toUpperCase()}
          </div>
        </div>
      </div>

      {isFirstRun && (
        <Link
          to="/settings"
          className="block mt-4 rounded-2xl bg-accent border border-primary/20 p-4 text-sm"
        >
          <div className="font-bold text-accent-foreground">👋 Welcome! Pehle apni shop set karein</div>
          <div className="text-muted-foreground mt-1">Tap karke shop name aur WhatsApp number add karein →</div>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-5">
        <StatCard icon={Wrench} label="Active" value={active.length} tint="bg-status-progress/15 text-status-progress" />
        <StatCard icon={Clock} label="Pickup" value={pickups.length} tint="bg-status-ready/15 text-status-ready" />
        <StatCard icon={IndianRupee} label="Aaj" value={`₹${todayEarn}`} tint="bg-primary/10 text-primary" />
      </div>

      {/* Big actions */}
      <div className="mt-5 grid grid-cols-1 gap-3">
        <Link
          to="/add"
          className="flex items-center gap-4 bg-primary text-primary-foreground rounded-2xl p-5 active:scale-[0.99] transition shadow-lg shadow-primary/20"
        >
          <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg leading-tight">Add Repair</div>
            <div className="text-sm opacity-80">Naya job entry karein</div>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/bulk" className="bg-card border border-border rounded-2xl p-4 active:scale-[0.99] transition">
            <div className="h-10 w-10 rounded-xl bg-whatsapp/15 text-whatsapp flex items-center justify-center mb-2">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="font-bold leading-tight">Bulk Send</div>
            <div className="text-xs text-muted-foreground mt-0.5">Multiple customers</div>
          </Link>
          <Link to="/followups" className="bg-card border border-border rounded-2xl p-4 active:scale-[0.99] transition">
            <div className="h-10 w-10 rounded-xl bg-status-waiting/15 text-status-waiting flex items-center justify-center mb-2">
              <FileText className="h-5 w-5" />
            </div>
            <div className="font-bold leading-tight">Follow-Ups</div>
            <div className="text-xs text-muted-foreground mt-0.5">Pending pickups</div>
          </Link>
        </div>
      </div>

      {/* Active list */}
      <section className="mt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Active Repairs</h2>
          <span className="text-xs text-muted-foreground">{active.length} jobs</span>
        </div>

        {active.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-border">
            <Wrench className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Koi active repair nahi hai</p>
            <Link
              to="/add"
              className="inline-block mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
            >
              + Pehla Repair Add Karein
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {active.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value, tint }: { icon: typeof Plus; label: string; value: string | number; tint: string }) {
  return (
    <div className="bg-card rounded-2xl p-3 border border-border">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${tint}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 text-lg font-extrabold leading-tight">{value}</div>
      <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{label}</div>
    </div>
  );
}
