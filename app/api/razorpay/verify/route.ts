import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
        }
        const user_id = user.id;

        const key_secret = process.env.RAZORPAY_KEY_SECRET!;

        // Verify signature
        const generated_signature = crypto
            .createHmac("sha256", key_secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
        }

        // Payment is valid, let's update supabase
        // we bypass RLS with service role key
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Calculate new expiration date
        const now = new Date();
        const expiresAt = new Date();

        if (plan === "basic_1m") {
            expiresAt.setMonth(now.getMonth() + 1);
        } else if (plan === "basic_6m") {
            expiresAt.setMonth(now.getMonth() + 6);
        } else if (plan === "basic_1y") {
            expiresAt.setFullYear(now.getFullYear() + 1);
        } else {
            return NextResponse.json({ error: "Invalid subscription plan requested" }, { status: 400 });
        }

        const { error: dbError } = await supabase
            .from("users")
            .update({
                plan: plan,
                plan_expires_at: expiresAt.toISOString(),
            })
            .eq("clerk_id", user_id);

        if (dbError) {
            console.error("Error updating user subscription details:", dbError);
            return NextResponse.json({ error: "Subscription purchased but database failed to update." }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Payment validated and subscription active" }, { status: 200 });

    } catch (error) {
        console.error("Error validating payment:", error);
        return NextResponse.json({ error: "Failed to validate payment" }, { status: 500 });
    }
}
