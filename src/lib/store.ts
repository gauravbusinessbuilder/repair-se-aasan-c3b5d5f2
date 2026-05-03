import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Job, JobStatus, ShopInfo, Template } from "./types";

const DEFAULT_TEMPLATES: Template[] = [
  { id: "t1", key: "received",    label: "Job Receive",        body: "Namaste 🙏 {{name}} ji, aapka {{device}} repair ke liye receive ho gaya hai. Job ID: #{{id}}. Dhanyavaad! - {{shop}}" },
  { id: "t2", key: "in_progress", label: "Repair Shuru",       body: "{{name}} ji, aapka {{device}} ab repair me hai 🔧. Job ID: #{{id}}. Update jaldi dunga. - {{shop}}" },
  { id: "t3", key: "waiting",     label: "Parts Ka Wait",      body: "{{name}} ji, aapke {{device}} ke liye part order kiya hai. Thoda time lagega 🙏. Job ID: #{{id}}. - {{shop}}" },
  { id: "t4", key: "ready",       label: "Tayar Hai",          body: "{{name}} ji, aapka {{device}} repair ho gaya hai 👍. Aake collect kar lijiye. Total: ₹{{amount}}. Job ID: #{{id}}. - {{shop}}" },
  { id: "t5", key: "payment",     label: "Payment Reminder",   body: "{{name}} ji, ek choti si yaad 🙏 — {{device}} ke ₹{{amount}} pending hain. Job ID: #{{id}}. - {{shop}}" },
  { id: "t6", key: "feedback",    label: "Feedback Mango",     body: "{{name}} ji, hamari service kaisi lagi? Aapka feedback hamare liye important hai 🙏. - {{shop}}" },
  { id: "t7", key: "followup",    label: "Pickup Reminder",    body: "{{name}} ji, aapka {{device}} hamare paas ready hai. Kab aa rahe hain collect karne? - {{shop}}" },
];

export interface AuthState {
  userId: string;     // chosen ID
  password: string;   // local-only (demo)
  loggedIn: boolean;
}

export interface SubscriptionState {
  pro: boolean;
  since?: number;
  upiTxnRef?: string;
}

export const FREE_LIMIT = 20;
export const PRO_PRICE = 149;
export const UPI_ID = "repairflow@upi"; // shop owner can change in settings later

interface State {
  shop: ShopInfo;
  jobs: Job[];
  templates: Template[];
  counter: number;
  auth: AuthState;
  subscription: SubscriptionState;

  setShop: (s: Partial<ShopInfo>) => void;
  addJob: (j: Omit<Job, "id" | "status" | "createdAt" | "updatedAt" | "paid">) => Job;
  updateJob: (id: string, patch: Partial<Job>) => void;
  setStatus: (id: string, status: JobStatus) => void;
  deleteJob: (id: string) => void;
  upsertTemplate: (t: Template) => void;
  resetTemplates: () => void;

  registerOrLogin: (userId: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  activatePro: (txnRef: string) => void;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      shop: { shopName: "Mera Mobile Shop", ownerName: "", whatsapp: "" },
      jobs: [],
      templates: DEFAULT_TEMPLATES,
      counter: 1,
      auth: { userId: "", password: "", loggedIn: false },
      subscription: { pro: false },

      setShop: (s) => set((st) => ({ shop: { ...st.shop, ...s } })),

      addJob: (j) => {
        const num = get().counter;
        const id = `RF-${String(num).padStart(3, "0")}`;
        const now = Date.now();
        const job: Job = {
          ...j,
          id,
          status: "received",
          createdAt: now,
          updatedAt: now,
          paid: false,
        };
        set((st) => ({ jobs: [job, ...st.jobs], counter: st.counter + 1 }));
        return job;
      },

      updateJob: (id, patch) =>
        set((st) => ({
          jobs: st.jobs.map((j) => (j.id === id ? { ...j, ...patch, updatedAt: Date.now() } : j)),
        })),

      setStatus: (id, status) =>
        set((st) => ({
          jobs: st.jobs.map((j) =>
            j.id === id
              ? { ...j, status, updatedAt: Date.now(), deliveredAt: status === "delivered" ? Date.now() : j.deliveredAt }
              : j
          ),
        })),

      deleteJob: (id) => set((st) => ({ jobs: st.jobs.filter((j) => j.id !== id) })),

      upsertTemplate: (t) =>
        set((st) => {
          const exists = st.templates.find((x) => x.id === t.id);
          return { templates: exists ? st.templates.map((x) => (x.id === t.id ? t : x)) : [...st.templates, t] };
        }),

      resetTemplates: () => set({ templates: DEFAULT_TEMPLATES }),

      registerOrLogin: (userId, password) => {
        const id = userId.trim();
        if (id.length < 3) return { ok: false, error: "ID kam se kam 3 letters ka ho" };
        if (password.length < 4) return { ok: false, error: "Password kam se kam 4 letters ka ho" };
        const existing = get().auth;
        // First-time: register. Subsequent: must match.
        if (existing.userId) {
          if (existing.userId !== id || existing.password !== password) {
            return { ok: false, error: "ID ya password galat hai" };
          }
          set({ auth: { ...existing, loggedIn: true } });
          return { ok: true };
        }
        set({ auth: { userId: id, password, loggedIn: true } });
        return { ok: true };
      },

      logout: () => set((st) => ({ auth: { ...st.auth, loggedIn: false } })),

      activatePro: (txnRef) =>
        set({ subscription: { pro: true, since: Date.now(), upiTxnRef: txnRef.trim() } }),
    }),
    { name: "repairflow-v1" }
  )
);

export function fillTemplate(body: string, vars: Record<string, string | number>) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ""));
}

export function waLink(phone: string, message: string) {
  // Clean, ensure 91 prefix for Indian 10-digit
  const digits = phone.replace(/\D/g, "");
  const intl = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}
