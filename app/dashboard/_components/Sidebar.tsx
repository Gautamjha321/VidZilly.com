"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutGrid,
    Video,
    BookOpen,
    CreditCard,
    Settings,
    Sparkles,
    Plus,
    User,
    X,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

const navItems = [
    { label: "Series", href: "/dashboard", icon: LayoutGrid },
    { label: "Video", href: "/dashboard/video", icon: Video },
    { label: "Guides", href: "/dashboard/guides", icon: BookOpen },
    { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { label: "Setting", href: "/dashboard/setting", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { isOpen, close } = useSidebar();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden"
                    onClick={close}
                />
            )}

            <aside className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                {/* ── Sidebar Header ── */}
                <div className="flex flex-col gap-4 px-5 pb-4 pt-6">
                    <div className="flex items-center justify-between">
                        {/* Logo + App Name */}
                        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={close}>
                            <Image
                                src="/logo.png"
                                alt="VidZilly Logo"
                                width={36}
                                height={36}
                                className="rounded-lg"
                            />
                            <span className="text-xl font-bold tracking-tight text-gray-900">
                                VidZilly
                            </span>
                        </Link>

                        {/* Mobile Close Button */}
                        <button
                            onClick={close}
                            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden"
                            aria-label="Close sidebar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Create New Series Button */}
                    <Link href="/dashboard/create" onClick={close} className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-purple-200 transition-all hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-300 active:scale-[0.98]">
                        <Plus className="h-4 w-4" />
                        Create New Series
                    </Link>
                </div>

                {/* ── Navigation ── */}
                <nav className="flex-1 overflow-y-auto px-3 py-2">
                    <ul className="flex flex-col gap-1">
                        {navItems.map((item) => {
                            const isActive =
                                item.href === "/dashboard"
                                    ? pathname === "/dashboard"
                                    : pathname.startsWith(item.href);

                            return (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        onClick={close}
                                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-all ${isActive
                                            ? "bg-purple-50 text-purple-700"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                    >
                                        <item.icon
                                            className={`h-5 w-5 ${isActive ? "text-purple-600" : "text-gray-400"
                                                }`}
                                        />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* ── Sidebar Footer ── */}
                <div className="border-t border-gray-200 px-3 py-3">
                    <ul className="flex flex-col gap-1">
                        {/* Upgrade */}
                        <li>
                            <Link
                                href="/dashboard/billing"
                                onClick={close}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-amber-600 transition-all hover:bg-amber-50"
                            >
                                <Sparkles className="h-5 w-5 text-amber-500" />
                                Upgrade
                            </Link>
                        </li>
                        {/* Profile Setting */}
                        <li>
                            <Link
                                href="/dashboard/profile"
                                onClick={close}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-all ${pathname.startsWith("/dashboard/profile")
                                    ? "bg-purple-50 text-purple-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <User className={`h-5 w-5 ${pathname.startsWith("/dashboard/profile") ? "text-purple-600" : "text-gray-400"}`} />
                                Profile Setting
                            </Link>
                        </li>
                    </ul>
                </div>
            </aside>
        </>
    );
}
