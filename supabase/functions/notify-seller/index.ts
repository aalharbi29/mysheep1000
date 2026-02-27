import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();
    const order = record;

    if (!order) {
      return new Response(JSON.stringify({ error: 'No order data' }), { status: 400, headers: corsHeaders });
    }

    // Get seller email from profiles
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, phone')
      .eq('user_id', order.seller_id)
      .single();

    // Get seller email from auth
    const { data: authUser } = await supabase.auth.admin.getUserById(order.seller_id);
    const sellerEmail = authUser?.user?.email;
    const sellerPhone = profile?.phone || '966530715233';

    const items = (order.items || []).map((i: any) => i.name).join('، ');
    const message = `🔔 طلب جديد!\n${order.shipping_name || 'عميل'} طلب: ${items}\nالمجموع: ${order.total} ر.س\nالمدينة: ${order.shipping_city || '-'}\nالهاتف: ${order.shipping_phone || '-'}`;

    const results: string[] = [];

    // 1. Send WhatsApp via Twilio
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (twilioSid && twilioToken && twilioPhone) {
      const whatsappTo = `whatsapp:+${sellerPhone.replace(/^\+/, '')}`;
      const whatsappFrom = `whatsapp:${twilioPhone}`;

      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const twilioAuth = btoa(`${twilioSid}:${twilioToken}`);

        // Send WhatsApp
        const waRes = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${twilioAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: whatsappTo,
            From: whatsappFrom,
            Body: message,
          }),
        });
        const waData = await waRes.json();
        results.push(`WhatsApp: ${waRes.ok ? 'sent' : waData.message}`);

        // Send SMS
        const smsRes = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${twilioAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: `+${sellerPhone.replace(/^\+/, '')}`,
            From: twilioPhone,
            Body: message,
          }),
        });
        const smsData = await smsRes.json();
        results.push(`SMS: ${smsRes.ok ? 'sent' : smsData.message}`);
      } catch (e) {
        results.push(`Twilio error: ${e.message}`);
      }
    } else {
      results.push('Twilio: not configured');
    }

    // 2. Send Email via Resend
    const resendKey = Deno.env.get('RESEND_API_KEY');

    if (resendKey && sellerEmail) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'الحظيرة النموذجية <onboarding@resend.dev>',
            to: [sellerEmail],
            subject: `🔔 طلب جديد - ${order.shipping_name || 'عميل'}`,
            html: `
              <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#6075af;">🔔 طلب جديد!</h2>
                <div style="background:#f9f9f9;border-radius:12px;padding:20px;margin:16px 0;">
                  <p><strong>العميل:</strong> ${order.shipping_name || '-'}</p>
                  <p><strong>الهاتف:</strong> ${order.shipping_phone || '-'}</p>
                  <p><strong>المدينة:</strong> ${order.shipping_city || '-'}</p>
                  <p><strong>العنوان:</strong> ${order.shipping_address || '-'}</p>
                  <hr style="border:none;border-top:1px solid #eee;margin:12px 0;">
                  <p><strong>المنتجات:</strong> ${items}</p>
                  <p style="font-size:18px;color:#6075af;"><strong>المجموع: ${order.total} ر.س</strong></p>
                </div>
                <p style="color:#888;font-size:12px;">الحظيرة النموذجية - إدارة ومتابعة القطيع</p>
              </div>
            `,
          }),
        });
        const emailData = await emailRes.json();
        results.push(`Email: ${emailRes.ok ? 'sent' : JSON.stringify(emailData)}`);
      } catch (e) {
        results.push(`Email error: ${e.message}`);
      }
    } else {
      results.push(`Email: ${!resendKey ? 'not configured' : 'no seller email'}`);
    }

    console.log('Notification results:', results);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
