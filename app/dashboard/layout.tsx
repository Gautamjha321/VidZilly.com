import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUser } from "@/actions/user";
import Sidebar from "./_components/Sidebar";
import DashboardHeader from "./_components/DashboardHeader";
import { ClerkCheckoutCenterer } from "./_components/ClerkCheckoutCenterer";
import { SidebarProvider } from "./_components/SidebarContext";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    // Sync user to Supabase
    await syncUser();

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-gray-50">
                {/* Clerk checkout centering — runs a MutationObserver to center the checkout overlay */}
                <ClerkCheckoutCenterer />

                {/* Sidebar */}
                <Sidebar />

                {/* Main content area */}
                <div className="flex flex-1 flex-col transition-all duration-300 md:ml-64 min-w-0">
                    {/* Header */}
                    <DashboardHeader />

                    {/* Page content */}
                    <main className="flex-1 p-4 md:p-6 w-full max-w-full overflow-x-hidden min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
