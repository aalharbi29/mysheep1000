import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();
    if (!phone) {
      return new Response(JSON.stringify({ error: "رقم الجوال مطلوب" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize: remove spaces, dashes, plus sign
    const normalizedPhone = phone.trim().replace(/[\s\-\+]/g, "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try exact match first, then try with/without country code
    let { data, error } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("phone", normalizedPhone)
      .single();

    // If not found and starts with 0, try with 966 prefix
    if (!data && normalizedPhone.startsWith("0")) {
      const withCountryCode = "966" + normalizedPhone.substring(1);
      ({ data, error } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("phone", withCountryCode)
        .single());
    }

    // If not found and starts with 966, try with 0 prefix
    if (!data && normalizedPhone.startsWith("966")) {
      const withZero = "0" + normalizedPhone.substring(3);
      ({ data, error } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("phone", withZero)
        .single());
    }

    if (!data) {
      return new Response(JSON.stringify({ error: "لم يتم العثور على حساب بهذا الرقم" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user email from auth
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(data.user_id);

    if (userError || !userData?.user?.email) {
      return new Response(JSON.stringify({ error: "خطأ في استرجاع بيانات الحساب" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ email: userData.user.email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
