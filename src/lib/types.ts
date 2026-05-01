export type JobStatus = "received" | "in_progress" | "waiting" | "ready" | "delivered";

export interface Job {
  id: string;          // Job ID like RF-001
  customerName: string;
  phone: string;       // 10-digit Indian number, no +91
  device: string;
  problem: string;
  cost: number;
  status: JobStatus;
  createdAt: number;
  updatedAt: number;
  deliveredAt?: number;
  paid: boolean;
  notes?: string;
}

export interface ShopInfo {
  shopName: string;
  ownerName: string;
  whatsapp: string;    // shop's own whatsapp
  address?: string;
}

export interface Template {
  id: string;
  key: string;         // e.g. 'received', 'ready'
  label: string;       // Hinglish label
  body: string;        // supports {{name}} {{device}} {{id}} {{shop}} {{amount}}
}

export const STATUS_META: Record<JobStatus, { label: string; hinglish: string; bg: string; text: string; dot: string }> = {
  received:    { label: "Received",        hinglish: "Naya",          bg: "bg-status-new",       text: "text-status-new-foreground",       dot: "bg-status-new" },
  in_progress: { label: "In Progress",     hinglish: "Repair Me",     bg: "bg-status-progress",  text: "text-status-progress-foreground",  dot: "bg-status-progress" },
  waiting:     { label: "Waiting Parts",   hinglish: "Parts Ka Wait", bg: "bg-status-waiting",   text: "text-status-waiting-foreground",   dot: "bg-status-waiting" },
  ready:       { label: "Ready",           hinglish: "Tayar Hai",     bg: "bg-status-ready",     text: "text-status-ready-foreground",     dot: "bg-status-ready" },
  delivered:   { label: "Delivered",       hinglish: "De Diya",       bg: "bg-status-delivered", text: "text-status-delivered-foreground", dot: "bg-status-delivered" },
};

export const STATUS_ORDER: JobStatus[] = ["received", "in_progress", "waiting", "ready", "delivered"];
