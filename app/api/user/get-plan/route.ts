import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ success: true, plan: null, plan_expires_at: null }, { status: 200 });
        }

        const clerk_id = user.id;

        // Connect to Supabase using the service role to bypass RLS for now 
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: userData, error: dbError } = await supabase
            .from("users")
            .select("plan, plan_expires_at")
            .eq("clerk_id", clerk_id)
            .single();

        if (dbError) {
            console.error("Error fetching user data:", dbError);
            return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            plan: userData?.plan || null,
            plan_expires_at: userData?.plan_expires_at || null
        }, { status: 200 });

    } catch (error) {
        console.error("Error in get-plan API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
