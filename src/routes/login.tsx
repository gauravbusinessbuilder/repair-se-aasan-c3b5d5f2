import { createFileRoute, useNavigate, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, SECURITY_QUESTIONS } from "@/lib/store";
import { Lock, User, LogIn, Mail, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("repairflow-v1");
      if (raw) {
        try {
          const s = JSON.parse(raw)?.state?.auth;
          if (s?.loggedIn) throw redirect({ to: "/" });
        } catch (e) {
          if ((e as { isRedirect?: boolean })?.isRedirect) throw e;
        }
      }
    }
  },
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { auth, registerOrLogin } = useStore();
  const isFirstTime = !auth.userId;
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [secQ, setSecQ] = useState(SECURITY_QUESTIONS[0]);
  const [secA, setSecA] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = isFirstTime
      ? registerOrLogin(userId, password, { email, securityQuestion: secQ, securityAnswer: secA })
      : registerOrLogin(userId, password);
    if (!res.ok) { setErr(res.error || "Error"); return; }
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-10 safe-top safe-bottom">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-primary/30 mb-4">
            🔧
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">RepairFlow</h1>
          <p className="text-sm text-muted-foreground mt-1">Mobile Shop Manager</p>
        </div>

        <form onSubmit={submit} className="space-y-4 bg-card border border-border rounded-3xl p-5 shadow-sm">
          <h2 className="text-lg font-bold">
            {isFirstTime ? "Account Banayein" : "Login Karein"}
          </h2>

          <Field icon={User} label="Your ID" value={userId} onChange={setUserId} placeholder="ramesh123" />
          <Field icon={Lock} label="Password" value={password} onChange={setPassword} placeholder="••••••" type="password" />

          {isFirstTime && (
            <>
              <Field icon={Mail} label="Recovery Email" value={email} onChange={setEmail} placeholder="aap@email.com" type="email" />
              <label className="block">
                <span className="text-sm font-semibold mb-1.5 block">Security Question</span>
                <div className="flex items-center rounded-2xl border-2 border-input focus-within:border-primary bg-background overflow-hidden">
                  <span className="pl-3 text-muted-foreground"><HelpCircle className="h-4 w-4" /></span>
                  <select
                    value={secQ}
                    onChange={(e) => setSecQ(e.target.value)}
                    className="flex-1 px-3 py-3 bg-transparent outline-none text-base"
                  >
                    {SECURITY_QUESTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
              </label>
              <Field icon={HelpCircle} label="Answer" value={secA} onChange={setSecA} placeholder="Aapka jawab" />
            </>
          )}

          {err && <div className="text-sm font-semibold text-destructive">{err}</div>}

          <button
            type="submit"
            className="w-full h-13 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-base active:scale-[0.99] shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
          >
            <LogIn className="h-5 w-5" />
            {isFirstTime ? "Sign Up & Continue" : "Login"}
          </button>

          {!isFirstTime && (
            <div className="text-center">
              <Link to="/reset" replace className="text-sm font-semibold text-primary">
                ID/Password bhul gaye?
              </Link>
            </div>
          )}

          <p className="text-[11px] text-center text-muted-foreground">
            Aapka ID/password sirf is phone me save hai (offline)
          </p>
        </form>
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
