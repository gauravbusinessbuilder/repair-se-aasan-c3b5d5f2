import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore, waLink } from "@/lib/store";
import { useState, useMemo } from "react";
import { Lock, Search, Phone, MessageCircle, Trash2, Eye, EyeOff, ShieldCheck, Users, Wrench } from "lucide-react";
import { STATUS_META } from "@/lib/types";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const { customers, customersPassword, setCustomersPassword, deleteCustomer, jobs } = useStore();
  const jobsByPhone = useMemo(() => {
    const m = new Map<string, typeof jobs>();
    for (const j of jobs) {
      const arr = m.get(j.phone) || [];
      arr.push(j);
      m.set(j.phone, arr);
    }
    for (const arr of m.values()) arr.sort((a, b) => b.updatedAt - a.updatedAt);
    return m;
  }, [jobs]);
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const hasPassword = customersPassword.length > 0;

  if (!unlocked) {
    return (
      <AppShell title="Customers" back="/">
        <div className="mt-6 max-w-md mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/30 p-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-3">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="font-extrabold text-xl">
              {hasPassword ? "Password Daalein" : "Naya Password Banayein"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {hasPassword
                ? "Customer list dekhne ke liye password zaruri hai"
                : "Customer list ko surakshit rakhne ke liye ek password set karein"}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setErr("");
              if (hasPassword) {
                if (pw === customersPassword) {
                  setUnlocked(true);
                  setPw("");
                } else setErr("Galat password");
              } else {
                if (pw.length < 4) { setErr("Password kam se kam 4 letters ka ho"); return; }
                if (pw !== pw2) { setErr("Dono password match nahi ho rahe"); return; }
                setCustomersPassword(pw);
                setUnlocked(true);
                setPw(""); setPw2("");
              }
            }}
            className="mt-5 space-y-3"
          >
            <div className="flex items-stretch rounded-2xl border-2 border-input focus-within:border-primary bg-card overflow-hidden">
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Password"
                className="flex-1 px-4 py-3 bg-transparent outline-none text-base"
                autoFocus
              />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="px-3 text-muted-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {!hasPassword && (
              <input
                type={showPw ? "text" : "password"}
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                placeholder="Password dobara daalein"
                className="w-full px-4 py-3 rounded-2xl border-2 border-input focus:border-primary bg-card outline-none text-base"
              />
            )}
            {err && <div className="text-sm text-destructive font-semibold">{err}</div>}
            <button
              type="submit"
              className="w-full h-13 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-5 w-5" />
              {hasPassword ? "Unlock" : "Set & Unlock"}
            </button>
          </form>
        </div>
      </AppShell>
    );
  }

  const filtered = customers.filter((c) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return c.name.toLowerCase().includes(s) || c.phone.includes(s) || (c.device || "").toLowerCase().includes(s);
  });

  return (
    <AppShell title="Customers" back="/">
      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Users className="h-4 w-4 text-primary" />
          {customers.length} Total
        </div>
        <button
          onClick={() => setUnlocked(false)}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-muted text-muted-foreground flex items-center gap-1"
        >
          <Lock className="h-3 w-3" /> Lock
        </button>
      </div>

      <div className="mt-3 flex items-stretch rounded-2xl border-2 border-input focus-within:border-primary bg-card overflow-hidden">
        <span className="px-3 flex items-center text-muted-foreground"><Search className="h-4 w-4" /></span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Naam, phone ya device"
          className="flex-1 px-2 py-3 bg-transparent outline-none text-base"
        />
      </div>

      <div className="mt-4 space-y-2">
        {filtered.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-12">
            {customers.length === 0 ? "Abhi koi customer nahi" : "Kuch nahi mila"}
          </div>
        )}
        {filtered.map((c) => {
          const cJobs = jobsByPhone.get(c.phone) || [];
          const active = cJobs.filter((j) => j.status !== "delivered");
          const pending = cJobs.filter((j) => j.status === "delivered" && !j.paid);
          const latest = cJobs[0];
          const latestMeta = latest ? STATUS_META[latest.status] : null;
          return (
          <div key={c.phone} className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-bold truncate">{c.name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Phone className="h-3.5 w-3.5" /> +91 {c.phone}
                </div>
                {c.device && (
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{c.device}</div>
                )}
                <div className="text-[11px] text-muted-foreground mt-1">
                  {c.visits} visit{c.visits > 1 ? "s" : ""} · last {new Date(c.lastAt).toLocaleDateString("en-IN")}
                </div>
                {latest && latestMeta && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Link
                      to="/job/$id"
                      params={{ id: latest.id }}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${latestMeta.bg} ${latestMeta.text} flex items-center gap-1`}
                    >
                      <Wrench className="h-3 w-3" />
                      #{latest.id} · {latestMeta.hinglish}
                    </Link>
                    {active.length > 1 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-progress/15 text-status-progress">
                        +{active.length - 1} active
                      </span>
                    )}
                    {pending.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">
                        ₹{pending.reduce((s, j) => s + (j.cost || 0), 0)} pending
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <a
                  href={`tel:+91${c.phone}`}
                  className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <a
                  href={waLink(c.phone, "")}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 w-9 rounded-xl bg-whatsapp/15 text-whatsapp flex items-center justify-center"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
                <button
                  onClick={() => {
                    if (confirm(`${c.name} ko delete karein?`)) deleteCustomer(c.phone);
                  }}
                  className="h-9 w-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      <button
        onClick={() => {
          const np = prompt("Naya password daalein (kam se kam 4 letters)");
          if (np && np.length >= 4) {
            setCustomersPassword(np);
            alert("Password update ho gaya");
          } else if (np !== null) {
            alert("Password kam se kam 4 letters ka ho");
          }
        }}
        className="mt-6 w-full h-11 rounded-2xl bg-muted text-foreground font-bold text-sm flex items-center justify-center gap-2"
      >
        <Lock className="h-4 w-4" /> Password Change Karein
      </button>
    </AppShell>
  );
}
