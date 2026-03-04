import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
    console.log("Testing Resend email...");
    console.log("API Key:", process.env.RESEND_API_KEY ? "✅ Found" : "❌ Missing");

    const { data, error } = await resend.emails.send({
        from: "VidMaxx <onboarding@resend.dev>",
        to: ["delivered@resend.dev"], // Resend's official test address — always succeeds
        subject: "🎬 VidMaxx – Test Email",
        html: `
            <h1>Test Email Working! ✅</h1>
            <p>Resend integration is working correctly.</p>
            <p>Your video notification emails will be sent to your registered email.</p>
        `,
    });

    if (error) {
        console.error("❌ Resend email FAILED:", error);
    } else {
        console.log("✅ Resend email SENT successfully! ID:", data?.id);
        console.log("\n⚠️  NOTE: With onboarding@resend.dev (shared domain),");
        console.log("    emails only deliver to YOUR Resend account email.");
        console.log("    Add vidzily.com domain in Resend to send to any user.\n");
    }
}

testEmail().catch(console.error);
