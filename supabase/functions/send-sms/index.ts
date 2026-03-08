import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SMSRequest {
  to: string;
  message: string;
  sms_type: string;
  customer_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get("GREENWEB_SMS_TOKEN");
    if (!token) {
      throw new Error("GREENWEB_SMS_TOKEN not configured");
    }

    const { to, message, sms_type, customer_id } = (await req.json()) as SMSRequest;

    if (!to || !message || !sms_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, message, sms_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean phone number - ensure it starts with 88 for BD
    const cleanPhone = to.replace(/[^0-9]/g, "");
    const phone = cleanPhone.startsWith("88") ? cleanPhone : `88${cleanPhone}`;

    // GreenWeb SMS API
    const smsUrl = `http://api.greenweb.com.bd/api.php?token=${token}&to=${phone}&message=${encodeURIComponent(message)}`;

    const smsResponse = await fetch(smsUrl);
    const responseText = await smsResponse.text();

    // Log to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("sms_logs").insert({
      phone: to,
      message,
      sms_type,
      status: responseText.includes("Ok") ? "sent" : "failed",
      response: responseText,
      customer_id: customer_id || null,
    });

    return new Response(
      JSON.stringify({ success: true, response: responseText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
