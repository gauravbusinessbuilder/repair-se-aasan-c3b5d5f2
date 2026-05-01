import jsPDF from "jspdf";
import type { Job, ShopInfo } from "./types";

export function generateInvoice(job: Job, shop: ShopInfo): { dataUrl: string; filename: string } {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  let y = 20;

  // Header band
  doc.setFillColor(59, 29, 138);
  doc.rect(0, 0, pageW, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(shop.shopName || "Repair Shop", 15, 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (shop.ownerName) doc.text(shop.ownerName, 15, 22);
  if (shop.whatsapp) doc.text(`WhatsApp: +91 ${shop.whatsapp}`, 15, 27);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageW - 15, 18, { align: "right" });

  y = 45;
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Invoice #: ${job.id}`, 15, y);
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, pageW - 15, y, { align: "right" });

  y += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Bill To:", 15, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(job.customerName, 15, y);
  y += 5;
  doc.text(`+91 ${job.phone}`, 15, y);

  y += 14;
  // Table header
  doc.setFillColor(244, 244, 248);
  doc.rect(15, y, pageW - 30, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Device", 18, y + 6);
  doc.text("Repair Description", 70, y + 6);
  doc.text("Amount (INR)", pageW - 18, y + 6, { align: "right" });

  y += 14;
  doc.setFont("helvetica", "normal");
  doc.text(job.device, 18, y);
  const splitProblem = doc.splitTextToSize(job.problem || "-", 100);
  doc.text(splitProblem, 70, y);
  doc.text(job.cost.toFixed(2), pageW - 18, y, { align: "right" });

  y += Math.max(10, splitProblem.length * 5) + 10;
  doc.setDrawColor(220);
  doc.line(15, y, pageW - 15, y);

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Total:", pageW - 60, y);
  doc.text(`Rs. ${job.cost.toFixed(2)}`, pageW - 18, y, { align: "right" });

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(`Status: ${job.paid ? "PAID" : "UNPAID"}`, 15, y);

  y = 280;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("Dhanyavaad! Aapki visit ke liye shukriya 🙏", pageW / 2, y, { align: "center" });

  const dataUrl = doc.output("datauristring");
  return { dataUrl, filename: `Invoice-${job.id}.pdf` };
}

export function downloadInvoice(job: Job, shop: ShopInfo) {
  const { dataUrl, filename } = generateInvoice(job, shop);
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
