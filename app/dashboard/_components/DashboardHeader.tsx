"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";

export default function DashboardHeader() {
    const { toggle } = useSidebar();

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 px-4 md:px-6 backdrop-blur-md">
            {/* Left — Mobile Toggle & Page title */}
            <div className="flex items-center gap-3">
                <button
                    onClick={toggle}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 md:hidden"
                    aria-label="Toggle Menu"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <h2 className="hidden text-lg font-semibold text-gray-900 sm:block">Dashboard</h2>
            </div>

            {/* Right — User profile */}
            <div className="flex items-center gap-4">
                <UserButton
                    showName
                    afterSignOutUrl="/"
                    appearance={{
                        elements: {
                            avatarBox: "h-9 w-9",
                            userButtonOuterIdentifier: "text-black font-semibold text-sm block !text-black",
                            userButtonBox: "flex flex-row-reverse gap-3",
                        },
                    }}
                />
            </div>
        </header>
    );
}
