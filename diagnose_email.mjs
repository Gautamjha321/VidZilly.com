import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

async function diagnose() {
    console.log("\n====== EMAIL DIAGNOSTIC ======\n");

    // 1. Check API Keys
    console.log("1. ENV KEYS:");
    console.log("   RESEND_API_KEY:", process.env.RESEND_API_KEY ? `✅ ${process.env.RESEND_API_KEY.substring(0, 12)}...` : "❌ MISSING");
    console.log("   SUPABASE URL  :", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ MISSING");

    // 2. Check users table
    console.log("\n2. SUPABASE users TABLE:");
    const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, email, name, clerk_id, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

    if (usersError) {
        console.log("   ❌ Error fetching users:", usersError.message);
    } else if (!users || users.length === 0) {
        console.log("   ❌ NO USERS FOUND IN DATABASE! syncUser() might not be running.");
    } else {
        console.log(`   ✅ Found ${users.length} user(s):`);
        users.forEach(u => {
            console.log(`      - ${u.email} | name: ${u.name} | clerk_id: ${u.clerk_id ? u.clerk_id.substring(0, 15) + "..." : "NULL"} | id: ${u.id}`);
        });
    }

    // 3. Check video_series for user_id
    console.log("\n3. RECENT video_series (user_id check):");
    const { data: series, error: seriesError } = await supabase
        .from("video_series")
        .select("id, series_name, user_id, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

    if (seriesError) {
        console.log("   ❌ Error:", seriesError.message);
    } else {
        series?.forEach(s => {
            const hasUserId = s.user_id ? "✅" : "❌ NULL";
            console.log(`   ${hasUserId} "${s.series_name}" | user_id: ${s.user_id || "NULL"}`);
        });
        const nullCount = series?.filter(s => !s.user_id).length || 0;
        if (nullCount > 0) {
            console.log(`\n   ⚠️  ${nullCount} series have no user_id — email fallback will be used for these`);
        }
    }

    // 4. Try sending actual email to the user
    console.log("\n4. RESEND EMAIL TEST:");
    const targetEmail = users?.[0]?.email;
    if (!targetEmail) {
        console.log("   ❌ No email to send to — fix users table first");
        return;
    }

    console.log(`   Sending test email to: ${targetEmail}`);
    const { data: emailData, error: emailError } = await resend.emails.send({
        from: "VidMaxx <onboarding@resend.dev>",
        to: [targetEmail],
        subject: "🎬 VidMaxx — Email Test (Diagnostic)",
        html: `
            <div style="font-family:Arial,sans-serif;padding:30px;background:#f5f5f5;">
                <h2 style="color:#6c63ff;">🎬 VidMaxx Email Test</h2>
                <p>If you're seeing this, email is working!</p>
                <p><strong>Note:</strong> With Resend's shared domain, this email only delivers if 
                <strong>${targetEmail}</strong> is the same email you used to sign up on Resend.</p>
                <p>To send to any email, add your custom domain in Resend dashboard.</p>
            </div>
        `,
    });

    if (emailError) {
        console.log("   ❌ Resend FAILED:", JSON.stringify(emailError, null, 2));

        if (JSON.stringify(emailError).includes("not authorized") || JSON.stringify(emailError).includes("domain")) {
            console.log("\n   🔑 DIAGNOSIS: Resend blocks sending to this email because");
            console.log("      onboarding@resend.dev can ONLY send to your Resend account email.");
            console.log("      SOLUTION: Add vidzily.com as a verified domain in Resend dashboard.");
        }
    } else {
        console.log("   ✅ Email sent! ID:", emailData?.id);
        console.log("   📬 Check inbox of:", targetEmail);
    }

    console.log("\n============================\n");
}

diagnose().catch(console.error);
