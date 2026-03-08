import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { Loader2 } from "lucide-react";

export default function CustomerProtectedRoute({ children }: { children: ReactNode }) {
  const { customer, loading } = useCustomerAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) return <Navigate to="/portal/login" replace />;

  return <>{children}</>;
}
