// @ts-nocheck

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import crypto from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  console.log("VERIFY FUNCTION HIT");

  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // 1️⃣ Safe JSON parsing
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_id, // Clerk user ID
    } = body;

    console.log("VERIFY PAYLOAD:", {
      razorpay_order_id,
      razorpay_payment_id,
      user_id,
    });

    // 2️⃣ Validate payload
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !user_id
    ) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing payment fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 3️⃣ Verify Razorpay signature
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpaySecret) {
      return new Response(
        JSON.stringify({ success: false, error: "Razorpay secret not set" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid signature" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // 4️⃣ Create Supabase client (SERVICE ROLE)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    // 5️⃣ Calculate expiry (30 days)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    // 6️⃣ UPSERT premium status
    const { error } = await supabase
      .from("user_profiles")
      .upsert({
        id: user_id,
        is_premium: true,
        subscription_end_date: expiryDate.toISOString(),
      });

    if (error) {
      console.error("DB error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Database update failed" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // 7️⃣ Success
    return new Response(
      JSON.stringify({
        success: true,
        message: "Premium activated for 30 days",
        subscription_end_date: expiryDate.toISOString(),
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Verify payment error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
