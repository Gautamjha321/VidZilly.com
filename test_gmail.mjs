import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

console.log("\n====== GMAIL SMTP TEST ======");
console.log("GMAIL_USER:", process.env.GMAIL_USER);
console.log("GMAIL_APP_PASSWORD:", process.env.GMAIL_APP_PASSWORD ? "✅ Set (" + process.env.GMAIL_APP_PASSWORD.length + " chars)" : "❌ Missing");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

try {
    const info = await transporter.sendMail({
        from: `"VidZily" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER, // send to self for test
        subject: "🎬 VidZily — Email Test Successful!",
        html: `
            <div style="font-family:Arial,sans-serif;padding:30px;background:#1a1a2e;color:#e5e5e5;border-radius:12px;">
                <h2 style="color:#6c63ff;">🎬 VidZily Email Working!</h2>
                <p>Gmail SMTP is correctly configured.</p>
                <p>Users will now receive email notifications when their videos are ready!</p>
            </div>
        `,
    });
    console.log("✅ Email sent successfully!");
    console.log("   Message ID:", info.messageId);
    console.log("\n📬 Check inbox of:", process.env.GMAIL_USER);
} catch (err) {
    console.error("❌ Gmail SMTP FAILED:", err.message);
}
console.log("============================\n");
