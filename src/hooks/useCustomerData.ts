import { IS_LOVABLE } from "@/lib/environment";
import { supabase } from "@/integrations/supabase/client";
import api from "@/lib/api";

interface FetchOptions {
  include_profile?: boolean;
  include_bills?: boolean;
  include_payments?: boolean;
  include_ledger?: boolean;
}

export async function fetchCustomerData(sessionToken: string, options: FetchOptions) {
  if (IS_LOVABLE) {
    // Supabase: verify session and fetch related data
    const { data: session } = await supabase
      .from('customer_sessions')
      .select('*, customers(*)')
      .eq('session_token', sessionToken)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (!session) throw new Error('Invalid session');

    const result: any = { valid: true, customer: session.customers };

    if (options.include_bills) {
      const { data: bills } = await supabase
        .from('bills')
        .select('*')
        .eq('customer_id', session.customer_id)
        .order('created_at', { ascending: false });
      result.bills = bills || [];
    }

    if (options.include_payments) {
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('customer_id', session.customer_id)
        .order('created_at', { ascending: false });
      result.payments = payments || [];
    }

    if (options.include_ledger) {
      const { data: ledger } = await supabase
        .from('customer_ledger')
        .select('*')
        .eq('customer_id', session.customer_id)
        .order('date', { ascending: false });
      result.ledger = ledger || [];
    }

    return result;
  }

  // Laravel
  const { data } = await api.post("/customer/verify", {
    session_token: sessionToken,
    ...options,
  });
  return data;
}
