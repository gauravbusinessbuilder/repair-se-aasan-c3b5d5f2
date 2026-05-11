import { Link } from "@tanstack/react-router";
import { STATUS_META, type Job } from "@/lib/types";
import { Smartphone } from "lucide-react";

export function JobCard({ job }: { job: Job }) {
  const meta = STATUS_META[job.status];
  return (
    <Link
      to="/job/$id"
      params={{ id: job.id }}
      replace
      className="block bg-card rounded-2xl p-4 border border-border active:scale-[0.99] transition shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-muted-foreground">#{job.id}</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
              {meta.hinglish}
            </span>
          </div>
          <h3 className="font-bold text-base mt-1 truncate">{job.customerName}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
            <Smartphone className="h-3.5 w-3.5" />
            <span className="truncate">{job.device}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">₹{job.cost}</div>
          {!job.paid && job.status === "delivered" && (
            <div className="text-[10px] font-bold text-destructive mt-1">PENDING</div>
          )}
        </div>
      </div>
    </Link>
  );
}
