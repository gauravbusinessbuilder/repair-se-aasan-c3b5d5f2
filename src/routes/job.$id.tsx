import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore, fillTemplate, waLink } from "@/lib/store";
import { STATUS_META, STATUS_ORDER, type JobStatus } from "@/lib/types";
import { downloadInvoice } from "@/lib/invoice";
import { Phone, MessageSquare, FileText, Trash2, Check, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/job/$id")({
  component: JobDetail,
});

function JobDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { jobs, setStatus, updateJob, deleteJob, templates, shop } = useStore();
  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <AppShell title="Not Found" back="/">
        <p className="text-muted-foreground text-center mt-10">Job nahi mila.</p>
      </AppShell>
    );
  }

  const meta = STATUS_META[job.status];

  const sendStatusMsg = (status: JobStatus) => {
    setStatus(job.id, status);
    const keyMap: Record<JobStatus, string> = {
      received: "received",
      in_progress: "in_progress",
      waiting: "waiting",
      ready: "ready",
      delivered: "feedback",
    };
    const tmpl = templates.find((t) => t.key === keyMap[status]);
    if (tmpl) {
      const msg = fillTemplate(tmpl.body, {
        name: job.customerName, device: job.device, id: job.id,
        shop: shop.shopName, amount: job.cost,
      });
      window.open(waLink(job.phone, msg), "_blank");
    }
  };

  const sendCustom = (key: string) => {
    const tmpl = templates.find((t) => t.key === key);
    if (!tmpl) return;
    const msg = fillTemplate(tmpl.body, {
      name: job.customerName, device: job.device, id: job.id,
      shop: shop.shopName, amount: job.cost,
    });
    window.open(waLink(job.phone, msg), "_blank");
  };

  return (
    <AppShell title={`#${job.id}`} back="/">
      <div className="bg-card border border-border rounded-2xl p-5 mt-2">
        <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${meta.bg} ${meta.text}`}>
          {meta.hinglish} • {meta.label}
        </div>
        <h2 className="text-2xl font-extrabold mt-3">{job.customerName}</h2>
        <p className="text-muted-foreground">{job.device}</p>
        {job.problem && <p className="mt-3 text-sm bg-muted/60 rounded-xl p-3">{job.problem}</p>}

        <div className="grid grid-cols-2 gap-2 mt-4">
          <a
            href={`tel:+91${job.phone}`}
            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-secondary font-semibold active:scale-[0.99]"
          >
            <Phone className="h-4 w-4" /> Call
          </a>
          <a
            href={waLink(job.phone, "")}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-whatsapp text-whatsapp-foreground font-semibold active:scale-[0.99]"
          >
            <MessageSquare className="h-4 w-4" /> WhatsApp
          </a>
        </div>

        <div className="mt-4 flex items-center justify-between bg-muted/50 rounded-xl p-3">
          <div>
            <div className="text-xs text-muted-foreground">Total Amount</div>
            <div className="text-2xl font-extrabold flex items-center"><IndianRupee className="h-5 w-5" />{job.cost}</div>
          </div>
          <button
            onClick={() => updateJob(job.id, { paid: !job.paid })}
            className={`px-4 h-11 rounded-xl font-bold text-sm flex items-center gap-2 ${
              job.paid ? "bg-status-ready text-status-ready-foreground" : "bg-destructive text-destructive-foreground"
            }`}
          >
            {job.paid ? <><Check className="h-4 w-4" /> PAID</> : "Mark Paid"}
          </button>
        </div>
      </div>

      {/* Status flow */}
      <section className="mt-5">
        <h3 className="font-bold mb-2">Status Update Karein</h3>
        <p className="text-xs text-muted-foreground mb-3">Tap karte hi WhatsApp message bhej diya jayega 📲</p>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_ORDER.map((s) => {
            const m = STATUS_META[s];
            const active = job.status === s;
            return (
              <button
                key={s}
                onClick={() => sendStatusMsg(s)}
                className={`h-14 rounded-2xl font-bold text-sm flex flex-col items-center justify-center gap-0.5 border-2 transition ${
                  active
                    ? `${m.bg} ${m.text} border-transparent shadow-md`
                    : "bg-card border-border text-foreground active:scale-[0.99]"
                }`}
              >
                <span>{m.hinglish}</span>
                <span className={`text-[10px] font-medium ${active ? "opacity-90" : "text-muted-foreground"}`}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Quick messages */}
      <section className="mt-5">
        <h3 className="font-bold mb-2">Quick Messages</h3>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => sendCustom("payment")} className="h-12 rounded-xl bg-card border border-border font-semibold text-sm">
            💰 Payment Reminder
          </button>
          <button onClick={() => sendCustom("feedback")} className="h-12 rounded-xl bg-card border border-border font-semibold text-sm">
            ⭐ Feedback Mango
          </button>
        </div>
      </section>

      {/* Invoice */}
      <section className="mt-5">
        <button
          onClick={() => downloadInvoice(job, shop)}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 active:scale-[0.99] shadow-md shadow-primary/20"
        >
          <FileText className="h-5 w-5" /> Invoice Download Karein
        </button>
      </section>

      <button
        onClick={() => {
          if (confirm("Yeh job delete karna hai?")) {
            deleteJob(job.id);
            navigate({ to: "/", replace: true });
          }
        }}
        className="mt-6 w-full h-12 rounded-xl text-destructive font-semibold text-sm flex items-center justify-center gap-2"
      >
        <Trash2 className="h-4 w-4" /> Delete Job
      </button>
    </AppShell>
  );
}
