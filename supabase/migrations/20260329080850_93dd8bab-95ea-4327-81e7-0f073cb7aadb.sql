
CREATE OR REPLACE FUNCTION public.fn_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text;
  v_old_data jsonb;
  v_new_data jsonb;
  v_record_id text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_old_data := NULL;
    v_new_data := to_jsonb(NEW);
    v_record_id := NEW.id::text;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'edit';
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    v_record_id := NEW.id::text;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_old_data := to_jsonb(OLD);
    v_new_data := NULL;
    v_record_id := OLD.id::text;
  END IF;

  INSERT INTO public.audit_logs (admin_id, admin_name, action, table_name, record_id, old_data, new_data)
  VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'System', v_action, TG_TABLE_NAME, v_record_id, v_old_data, v_new_data);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  tbl text;
  trigger_name text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'customers', 'bills', 'payments', 'packages', 'mikrotik_routers',
      'profiles', 'custom_roles', 'user_roles', 'role_permissions', 'permissions',
      'admin_sessions', 'customer_sessions', 'customer_ledger',
      'merchant_payments', 'support_tickets', 'ticket_replies',
      'general_settings', 'payment_gateways', 'sms_settings', 'sms_templates',
      'accounts', 'transactions', 'expenses', 'expense_heads', 'income_heads', 'other_heads',
      'products', 'purchases', 'purchase_items', 'sales', 'sale_items',
      'employees', 'designations', 'attendance', 'salary_sheets', 'loans',
      'employee_salary_structure', 'employee_education', 'employee_experience',
      'employee_emergency_contacts', 'employee_provident_fund', 'employee_savings_fund',
      'zones', 'olts', 'onus', 'daily_reports', 'backup_logs'
    ])
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      trigger_name := 'trg_audit_' || tbl;
      EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', trigger_name, tbl);
      EXECUTE format(
        'CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log()',
        trigger_name, tbl
      );
    END IF;
  END LOOP;
END;
$$;
