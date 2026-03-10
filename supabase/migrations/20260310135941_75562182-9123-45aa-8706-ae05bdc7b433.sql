-- Drop all business logic triggers
DROP TRIGGER IF EXISTS set_customer_id ON public.customers;
DROP TRIGGER IF EXISTS set_ticket_id ON public.support_tickets;
DROP TRIGGER IF EXISTS trigger_payment_reactivation ON public.payments;
DROP TRIGGER IF EXISTS trg_ledger_on_bill_insert ON public.bills;
DROP TRIGGER IF EXISTS trg_ledger_on_payment_insert ON public.payments;
DROP TRIGGER IF EXISTS trg_auto_match_merchant_payment ON public.merchant_payments;

-- Drop business logic functions (now handled in Edge Functions)
DROP FUNCTION IF EXISTS public.generate_customer_id() CASCADE;
DROP FUNCTION IF EXISTS public.generate_ticket_id() CASCADE;
DROP FUNCTION IF EXISTS public.handle_payment_reactivation() CASCADE;
DROP FUNCTION IF EXISTS public.ledger_on_bill_insert() CASCADE;
DROP FUNCTION IF EXISTS public.ledger_on_payment_insert() CASCADE;
DROP FUNCTION IF EXISTS public.auto_match_merchant_payment() CASCADE;