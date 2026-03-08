import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import PortalLayout from "@/components/layout/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function CustomerBills() {
  const { customer } = useCustomerAuth();

  const { data: bills, isLoading } = useQuery({
    queryKey: ["customer-bills-list", customer?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .eq("customer_id", customer!.id)
        .order("month", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!customer,
  });

  const statusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-success/10 text-success border-success/20";
      case "unpaid": return "bg-destructive/10 text-destructive border-destructive/20";
      case "partial": return "bg-warning/10 text-warning border-warning/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handlePayNow = (bill: any) => {
    // Placeholder — in production this would integrate with a payment gateway
    toast.info("Payment gateway integration coming soon. Please contact your ISP to make a payment.");
  };

  return (
    <PortalLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Bills</h1>
        <p className="text-muted-foreground mt-1">View and pay your monthly bills</p>
      </div>

      <div className="glass-card rounded-xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                      No bills found
                    </TableCell>
                  </TableRow>
                ) : (
                  bills?.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.month}</TableCell>
                      <TableCell>৳{Number(bill.amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColor(bill.status)}>
                          {bill.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {bill.status !== "paid" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePayNow(bill)}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay Now
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
