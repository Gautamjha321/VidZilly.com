import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, plan } = body;

        if (!amount || !plan) {
            return NextResponse.json({ error: "Missing amount or plan details" }, { status: 400 });
        }

        const options = {
            amount: amount * 100, // Amount is in currency subunits. Default currency is INR. Hence, 100 Rs = 10000 paise.
            currency: "INR",
            receipt: `receipt_${crypto.randomBytes(10).toString("hex")}`,
            notes: {
                plan: plan,
            },
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({ orderId: order.id, currency: order.currency, amount: order.amount }, { status: 200 });
    } catch (error) {
        console.error("Razorpay basic order creation error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
