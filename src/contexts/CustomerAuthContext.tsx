import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CustomerUser {
  id: string;
  customer_id: string;
  name: string;
  phone: string;
  area: string;
  road: string | null;
  house: string | null;
  city: string | null;
  email: string | null;
  package_id: string | null;
  monthly_bill: number;
  ip_address: string | null;
  pppoe_username: string | null;
  onu_mac: string | null;
  router_mac: string | null;
  installation_date: string | null;
  status: string;
  username: string | null;
}

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const STORAGE_KEY = "customer_portal_session";

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCustomer(JSON.parse(saved));
      } catch {}
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (error || !data) throw new Error("Invalid username or password");

    const customerUser: CustomerUser = {
      id: data.id,
      customer_id: data.customer_id,
      name: data.name,
      phone: data.phone,
      area: data.area,
      road: data.road,
      house: data.house,
      city: data.city,
      email: data.email,
      package_id: data.package_id,
      monthly_bill: Number(data.monthly_bill),
      ip_address: data.ip_address,
      pppoe_username: data.pppoe_username,
      onu_mac: data.onu_mac,
      router_mac: data.router_mac,
      installation_date: data.installation_date,
      status: data.status,
      username: data.username,
    };

    setCustomer(customerUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customerUser));
  };

  const signOut = () => {
    setCustomer(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, loading, signIn, signOut }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export const useCustomerAuth = () => {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return ctx;
};
