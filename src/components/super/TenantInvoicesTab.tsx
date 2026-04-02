import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import jsPDF from "jspdf";
import {
  PDF_COLORS, PDF_FONT, PDF_SPACING,
  drawCompanyHeader, drawFooter, getCompanySettings,
} from "@/lib/pdfTheme";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import {
  Receipt, Loader2, Printer, CheckCircle2, Edit, Trash2,
} from "lucide-react";

interface Props {
  tenantId: string;
  tenantName?: string;
}

export default function TenantInvoicesTab({ tenantId, tenantName }: Props) {
  const qc = useQueryClient();
  const queryKey = ["tenant-invoices", tenantId];

  const { data: invoices = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await (supabase.from as any)("subscription_invoices")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["saas-plans-lookup"],
    queryFn: async () => {
      const { data } = await (supabase.from as any)("saas_plans").select("id, name, price_monthly, price_yearly, billing_cycle");
      return data || [];
    },
  });

  const getPlanName = (planId: string) => plans.find((p: any) => p.id === planId)?.name || "N/A";

  // ── Mark as Paid ──
  const markPaid = useMutation({
    mutationFn: async (invoiceId: string) => {
      const invoice = invoices.find((i: any) => i.id === invoiceId);
      if (!invoice) throw new Error("Invoice not found");

      await (supabase.from as any)("subscription_invoices").update({
        status: "paid",
        paid_date: new Date().toISOString(),
        payment_method: "manual",
      }).eq("id", invoiceId);

      const newExpiry = new Date();
      if (invoice.billing_cycle === "yearly") {
        newExpiry.setFullYear(newExpiry.getFullYear() + 1);
      } else {
        newExpiry.setMonth(newExpiry.getMonth() + 1);
      }

      await (supabase.from as any)("tenants").update({
        plan_expire_date: newExpiry.toISOString().split("T")[0],
        plan_id: invoice.plan_id,
        status: "active",
      }).eq("id", invoice.tenant_id);

      await (supabase.from as any)("subscriptions").update({ status: "active" })
        .eq("tenant_id", invoice.tenant_id).eq("status", "expired");
    },
    onSuccess: () => {
      toast.success("Invoice marked as paid, plan extended!");
      qc.invalidateQueries({ queryKey });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // ── Edit ──
  const [editOpen, setEditOpen] = useState(false);
  const [editInv, setEditInv] = useState<any>(null);

  const editInvoice = useMutation({
    mutationFn: async (form: any) => {
      const { error } = await (supabase.from as any)("subscription_invoices").update({
        amount: Number(form.amount),
        tax_amount: Number(form.tax_amount || 0),
        total_amount: Number(form.total_amount),
        billing_cycle: form.billing_cycle,
        due_date: form.due_date,
        notes: form.notes || null,
        status: form.status,
      }).eq("id", form.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invoice updated");
      setEditOpen(false);
      setEditInv(null);
      qc.invalidateQueries({ queryKey });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // ── Delete ──
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from as any)("subscription_invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invoice deleted");
      setDeleteId(null);
      qc.invalidateQueries({ queryKey });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // ── Print PDF ──
  const generatePDF = async (invoice: any) => {
    try {
      const settings = await getCompanySettings();
      const companyName = settings?.site_name || "Smart ISP";
      const companyAddress = settings?.address || "";
      const companyEmail = settings?.email || "";
      const companyPhone = settings?.mobile || "";

      const doc = new jsPDF("p", "mm", "a4");
      const pw = doc.internal.pageSize.getWidth();
      const m = PDF_SPACING.margin;

      let y = drawCompanyHeader(doc, {
        companyName,
        subtitle: [companyAddress, companyEmail, companyPhone].filter(Boolean).join(" | "),
        docTitle: "SUBSCRIPTION INVOICE",
        docMeta: [
          `Invoice Date: ${invoice.created_at ? format(new Date(invoice.created_at), "dd MMM yyyy") : "N/A"}`,
          `Due Date: ${invoice.due_date ? format(new Date(invoice.due_date), "dd MMM yyyy") : "N/A"}`,
          `Tenant: ${tenantName || "N/A"}`,
        ],
        style: "banner",
      });

      y += 4;

      const statusText = (invoice.status || "pending").toUpperCase();
      doc.setFontSize(PDF_FONT.heading);
      doc.setFont("helvetica", "bold");
      if (invoice.status === "paid") {
        doc.setTextColor(...PDF_COLORS.success);
      } else if (invoice.status === "overdue") {
        doc.setTextColor(...PDF_COLORS.danger);
      } else {
        doc.setTextColor(...PDF_COLORS.text);
      }
      doc.text(`Status: ${statusText}`, pw - m, y, { align: "right" });

      doc.setTextColor(...PDF_COLORS.text);
      doc.setFontSize(PDF_FONT.body);
      doc.setFont("helvetica", "normal");
      doc.text(`Plan: ${getPlanName(invoice.plan_id)}`, m, y);
      y += 6;
      doc.text(`Billing Cycle: ${(invoice.billing_cycle || "monthly").toUpperCase()}`, m, y);
      y += 10;

      const colWidths = [pw - 2 * m - 50, 50];
      const tableX = m;

      doc.setFillColor(...PDF_COLORS.navy);
      doc.rect(tableX, y, pw - 2 * m, 8, "F");
      doc.setTextColor(...PDF_COLORS.white);
      doc.setFontSize(PDF_FONT.small);
      doc.setFont("helvetica", "bold");
      doc.text("Description", tableX + 3, y + 5.5);
      doc.text("Amount", tableX + colWidths[0] + colWidths[1] - 3, y + 5.5, { align: "right" });
      y += 8;

      const rows = [
        ["Subscription Fee", `Tk ${Number(invoice.amount || 0).toFixed(2)}`],
        ["Tax", `Tk ${Number(invoice.tax_amount || 0).toFixed(2)}`],
      ];
      if (Number(invoice.proration_credit || 0) > 0) {
        rows.push(["Proration Credit", `- Tk ${Number(invoice.proration_credit).toFixed(2)}`]);
      }

      doc.setTextColor(...PDF_COLORS.text);
      doc.setFont("helvetica", "normal");
      rows.forEach((row, i) => {
        if (i % 2 === 0) {
          doc.setFillColor(...PDF_COLORS.bgRow);
          doc.rect(tableX, y, pw - 2 * m, 7, "F");
        }
        doc.setFontSize(PDF_FONT.body);
        doc.text(row[0], tableX + 3, y + 5);
        doc.text(row[1], tableX + colWidths[0] + colWidths[1] - 3, y + 5, { align: "right" });
        y += 7;
      });

      doc.setFillColor(...PDF_COLORS.navy);
      doc.rect(tableX, y, pw - 2 * m, 9, "F");
      doc.setTextColor(...PDF_COLORS.white);
      doc.setFontSize(PDF_FONT.heading);
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL", tableX + 3, y + 6.5);
      doc.text(`Tk ${Number(invoice.total_amount || 0).toFixed(2)}`, tableX + colWidths[0] + colWidths[1] - 3, y + 6.5, { align: "right" });
      y += 14;

      if (invoice.status === "paid") {
        doc.setTextColor(...PDF_COLORS.success);
        doc.setFontSize(PDF_FONT.body);
        doc.setFont("helvetica", "bold");
        doc.text("PAID", m, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...PDF_COLORS.text);
        if (invoice.paid_date) {
          doc.text(`  on ${format(new Date(invoice.paid_date), "dd MMM yyyy")}`, m + 12, y);
        }
      }

      if (invoice.notes) {
        y += 10;
        doc.setFontSize(PDF_FONT.small);
        doc.setTextColor(...PDF_COLORS.textMuted);
        doc.text(`Notes: ${invoice.notes}`, m, y);
      }

      drawFooter(doc, companyName);
      doc.save(`subscription-invoice-${format(new Date(invoice.created_at), "yyyyMMdd")}.pdf`);
      toast.success("Invoice downloaded");
    } catch (err: any) {
      toast.error("Failed to generate PDF: " + (err.message || "Unknown error"));
    }
  };

  // ── Status badge ──
  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      cancelled: "bg-muted text-muted-foreground",
    };
    return <Badge className={variants[status] || "bg-muted text-muted-foreground"}>{status?.toUpperCase()}</Badge>;
  };

  if (isLoading) return <Card><CardContent className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></CardContent></Card>;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5" /> Subscription Invoices ({invoices.length})
          </CardTitle>
          <CardDescription>All subscription invoices for this tenant</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground font-medium">No invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Cycle</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv: any) => (
                    <TableRow key={inv.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {inv.created_at ? format(new Date(inv.created_at), "dd MMM yyyy") : "-"}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{getPlanName(inv.plan_id)}</TableCell>
                      <TableCell className="capitalize text-sm">{inv.billing_cycle || "monthly"}</TableCell>
                      <TableCell className="text-right text-sm">Tk {Number(inv.amount || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right text-sm">Tk {Number(inv.tax_amount || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold text-sm">Tk {Number(inv.total_amount || 0).toFixed(2)}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {inv.due_date ? format(new Date(inv.due_date), "dd MMM yyyy") : "-"}
                      </TableCell>
                      <TableCell>{statusBadge(inv.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {inv.status !== "paid" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-primary hover:bg-primary/10 h-8 px-2"
                              onClick={() => markPaid.mutate(inv.id)}
                              disabled={markPaid.isPending}
                              title="Mark as Paid"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={() => { setEditInv({ ...inv }); setEditOpen(true); }}
                            title="Edit"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={() => generatePDF(inv)}
                            title="Print"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10 h-8 px-2"
                            onClick={() => setDeleteId(inv.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditInv(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Invoice</DialogTitle></DialogHeader>
          {editInv && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" value={editInv.amount} onChange={(e) => setEditInv({ ...editInv, amount: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Tax Amount</Label>
                  <Input type="number" value={editInv.tax_amount || 0} onChange={(e) => setEditInv({ ...editInv, tax_amount: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Amount</Label>
                  <Input type="number" value={editInv.total_amount} onChange={(e) => setEditInv({ ...editInv, total_amount: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Billing Cycle</Label>
                  <Select value={editInv.billing_cycle || "monthly"} onValueChange={(v) => setEditInv({ ...editInv, billing_cycle: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={editInv.due_date || ""} onChange={(e) => setEditInv({ ...editInv, due_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editInv.status} onValueChange={(v) => setEditInv({ ...editInv, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={editInv.notes || ""} onChange={(e) => setEditInv({ ...editInv, notes: e.target.value })} placeholder="Optional notes" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => editInvoice.mutate(editInv)} disabled={editInvoice.isPending}>
              {editInvoice.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        onConfirm={() => deleteId && deleteInvoice.mutate(deleteId)}
        loading={deleteInvoice.isPending}
        title="Delete this invoice?"
        description="This action cannot be undone. The invoice will be permanently removed."
      />
    </>
  );
}
