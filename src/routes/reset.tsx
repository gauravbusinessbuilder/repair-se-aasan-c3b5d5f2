import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Mail, HelpCircle, User, Lock, KeyRound, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/reset")({
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const { getRecoveryQuestion, resetCredentials } = useStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [newId, setNewId] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const onCheckEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const r = getRecoveryQuestion(email);
    if (!r.ok) { setErr(r.error || "Error"); return; }
    setQuestion(r.question || "");
    setNewId(r.userId || "");
    setStep(2);
  };

  const onReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const r = resetCredentials(email, answer, newId, newPwd);
    if (!r.ok) { setErr(r.error || "Error"); return; }
    setOk("Password reset ho gaya! Naye details se login karein.");
    setStep(3);
    setTimeout(() => navigate({ to: "/login", replace: true }), 1800);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-10 safe-top safe-bottom">
      <div className="w-full max-w-sm">
        <Link to="/login" replace className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Login pe wapas
        </Link>

        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-3">
            <KeyRound className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Password Reset</h1>
          <p className="text-sm text-muted-foreground mt-1">Recovery email se reset karein</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
          {step === 1 && (
            <form onSubmit={onCheckEmail} className="space-y-4">
              <Field icon={Mail} label="Recovery Email" value={email} onChange={setEmail} placeholder="aap@email.com" type="email" />
              {err && <div className="text-sm font-semibold text-destructive">{err}</div>}
              <button type="submit" className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2">
                Aage badhein
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={onReset} className="space-y-4">
              <div className="rounded-2xl bg-muted p-3">
                <div className="text-xs font-semibold text-muted-foreground mb-1">Security Question</div>
                <div className="text-sm font-bold">{question}</div>
              </div>
              <Field icon={HelpCircle} label="Aapka Jawab" value={answer} onChange={setAnswer} placeholder="Answer" />
              <Field icon={User} label="New ID" value={newId} onChange={setNewId} placeholder="naya-id" />
              <Field icon={Lock} label="New Password" value={newPwd} onChange={setNewPwd} placeholder="••••••" type="password" />
              {err && <div className="text-sm font-semibold text-destructive">{err}</div>}
              <button type="submit" className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2">
                Reset Karein
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="text-sm font-semibold text-status-ready">{ok}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, placeholder, type = "text" }: {
  icon: typeof User; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold mb-1.5 block">{label}</span>
      <div className="flex items-center rounded-2xl border-2 border-input focus-within:border-primary bg-background overflow-hidden">
        <span className="pl-3 text-muted-foreground"><Icon className="h-4 w-4" /></span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          autoCapitalize="none"
          autoComplete="off"
          className="flex-1 px-3 py-3 bg-transparent outline-none text-base"
        />
      </div>
    </label>
  );
}
