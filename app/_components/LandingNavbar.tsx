"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Menu, X, ArrowRight, Zap } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function LandingNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800" : "bg-transparent"
                }`}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400">
                        <Play className="h-4 w-4 fill-white text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">
                        Vid<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Zilly</span>
                    </span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden items-center gap-8 md:flex">
                    <a href="#features" className="text-sm font-medium text-zinc-400 transition hover:text-white">
                        Features
                    </a>
                    <a href="#how-it-works" className="text-sm font-medium text-zinc-400 transition hover:text-white">
                        How It Works
                    </a>
                    <a href="#platforms" className="text-sm font-medium text-zinc-400 transition hover:text-white">
                        Platforms
                    </a>
                    <a href="#pricing" className="text-sm font-medium text-zinc-400 transition hover:text-white">
                        Pricing
                    </a>
                </div>

                {/* Desktop Auth Buttons */}
                <div className="hidden items-center gap-4 md:flex">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="text-sm font-medium text-zinc-300 transition hover:text-white">
                                Sign In
                            </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <button className="rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 transition-all px-5 py-2 text-sm font-bold text-white shadow-lg shadow-purple-500/25">
                                Get Started Free
                            </button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-zinc-300 transition hover:text-white"
                        >
                            Dashboard
                        </Link>
                        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 pl-1 pr-4 py-1">
                            <UserButton afterSignOutUrl="/" />
                            <span className="text-xs font-medium text-zinc-400">Account</span>
                        </div>
                    </SignedIn>
                </div>

                {/* Mobile Menu Toggle Button */}
                <button
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-400 md:hidden"
                    onClick={toggleMenu}
                    aria-label="Toggle mobile menu"
                >
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-[100%] left-0 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-xl md:hidden">
                    <div className="flex flex-col px-6 py-6 pb-8 space-y-6">
                        <nav className="flex flex-col space-y-4">
                            <a href="#features" onClick={closeMenu} className="text-lg font-semibold text-zinc-300 hover:text-white">
                                Features
                            </a>
                            <a href="#how-it-works" onClick={closeMenu} className="text-lg font-semibold text-zinc-300 hover:text-white">
                                How It Works
                            </a>
                            <a href="#platforms" onClick={closeMenu} className="text-lg font-semibold text-zinc-300 hover:text-white">
                                Platforms
                            </a>
                            <a href="#pricing" onClick={closeMenu} className="text-lg font-semibold text-zinc-300 hover:text-white">
                                Pricing
                            </a>
                        </nav>

                        <div className="h-px w-full bg-zinc-800" />

                        <div className="flex flex-col space-y-4">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button onClick={closeMenu} className="w-full rounded-xl border border-zinc-800 py-3.5 text-center text-sm font-semibold text-zinc-300 hover:bg-zinc-900">
                                        Sign In
                                    </button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <button onClick={closeMenu} className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-purple-500/25">
                                        Get Started Free
                                    </button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <Link
                                    href="/dashboard"
                                    onClick={closeMenu}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-purple-500/25"
                                >
                                    <Zap className="h-4 w-4" /> Go to Dashboard
                                </Link>
                                <div className="mt-2 flex items-center justify-center gap-3">
                                    <UserButton afterSignOutUrl="/" />
                                    <span className="text-sm font-medium text-zinc-400">Manage Account</span>
                                </div>
                            </SignedIn>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
