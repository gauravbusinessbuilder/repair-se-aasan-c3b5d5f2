import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore, FREE_LIMIT, PRO_PRICE, UPI_ID, isProActive } from "@/lib/store";
import { useState } from "react";
import { Check, Crown, Infinity, MessageSquare, Sparkles } from "lucide-react";

export const Route = createFileRoute("/upgrade")({
  component: Upgrade,
});

function Upgrade() {
  const navigate = useNavigate();
  const { subscription, jobs, activatePro } = useStore();
  const [txn, setTxn] = useState("");
  const [showPay, setShowPay] = useState(false);

  if (isProActive(subscription)) {
    const expires = subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;
    return (
      <AppShell title="Pro Active" back="/">
        <div className="text-center py-12">
          <div className="mx-auto h-20 w-20 rounded-full bg-status-ready/15 text-status-ready flex items-center justify-center mb-4">
            <Crown className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-extrabold">Aap Pro Hain 🎉</h2>
          <p className="text-muted-foreground mt-2 text-sm">Unlimited customers add karein</p>
          {expires && (
            <p className="mt-3 text-sm font-semibold">Valid till: <span className="text-primary">{expires}</span></p>
          )}
          {subscription.upiTxnRef && (
            <p className="mt-4 text-xs text-muted-foreground font-mono">Ref: {subscription.upiTxnRef}</p>
          )}
        </div>
      </AppShell>
    );
  }

  const upiUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent("RepairFlow Pro")}&am=${PRO_PRICE}&cu=INR&tn=${encodeURIComponent("RepairFlow Pro Subscription")}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUrl)}`;

  const submitPaid = (e: React.FormEvent) => {
    e.preventDefault();
    if (txn.trim().length < 4) return;
    activatePro(txn);
    setTimeout(() => navigate({ to: "/" }), 800);
  };

  return (
    <AppShell title="Pro Plan" back="/">
      <div className="rounded-3xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground p-5 shadow-lg shadow-primary/30">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          <span className="text-sm font-bold uppercase tracking-wide opacity-90">RepairFlow Pro</span>
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-5xl font-extrabold">₹{PRO_PRICE}</span>
          <span className="opacity-80 text-sm">/ lifetime</span>
        </div>
        <p className="text-sm opacity-90 mt-1">
          Aap ne {jobs.length} / {FREE_LIMIT} free customers use kiye hain
        </p>
      </div>

      <div className="mt-5 space-y-2.5">
        <Feature icon={Infinity} text="Unlimited customers add karein" />
        <Feature icon={MessageSquare} text="Bulk WhatsApp message bhejein" />
        <Feature icon={Sparkles} text="Sab future features free" />
      </div>

      {!showPay ? (
        <button
          onClick={() => setShowPay(true)}
          className="mt-6 w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg active:scale-[0.99] shadow-lg shadow-primary/30"
        >
          Pay ₹{PRO_PRICE} via UPI
        </button>
      ) : (
        <div className="mt-6 bg-card border border-border rounded-3xl p-5">
          <h3 className="font-bold text-base mb-3">UPI se pay karein</h3>
          <div className="flex flex-col items-center bg-background rounded-2xl p-4 border border-border">
            <img src={qrUrl} alt="UPI QR" width={220} height={220} className="rounded-xl" />
            <div className="mt-3 text-center">
              <div className="text-xs text-muted-foreground">UPI ID</div>
              <div className="font-mono font-bold text-sm">{UPI_ID}</div>
              <div className="mt-1 text-xs text-muted-foreground">Amount: <span className="font-bold text-foreground">₹{PRO_PRICE}</span></div>
            </div>
            <a
              href={upiUrl}
              className="mt-3 w-full text-center py-2.5 rounded-xl bg-whatsapp text-white font-semibold text-sm"
            >
              UPI App Kholo
            </a>
          </div>

          <form onSubmit={submitPaid} className="mt-4 space-y-3">
            <label className="block">
              <span className="text-sm font-semibold mb-1.5 block">Payment ke baad UTR / Txn ID daalein</span>
              <input
                value={txn}
                onChange={(e) => setTxn(e.target.value)}
                placeholder="UPI Reference Number"
                className="w-full px-4 py-3 rounded-2xl border-2 border-input focus:border-primary bg-background outline-none text-base"
              />
            </label>
            <button
              type="submit"
              disabled={txn.trim().length < 4}
              className="w-full h-13 py-3 rounded-2xl bg-status-ready text-status-ready-foreground font-bold text-base active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Check className="h-5 w-5" /> Maine Pay Kar Diya — Pro Activate Karein
            </button>
            <p className="text-[11px] text-center text-muted-foreground">
              Activation turant hota hai. Owner verification baad me karega.
            </p>
          </form>
        </div>
      )}
    </AppShell>
  );
}

function Feature({ icon: Icon, text }: { icon: typeof Check; text: string }) {
  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-2xl p-3">
      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </div>
      <span className="font-semibold text-sm">{text}</span>
    </div>
  );
}
