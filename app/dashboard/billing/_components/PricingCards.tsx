/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import confetti from "canvas-confetti";

const plans = [
    {
        id: "basic_1m",
        name: "Basic",
        price: "₹100",
        duration: "1 Month",
        amount: 100,
        features: ["Unlimited AI script writing", "Custom voice selection", "Background music library", "Auto captions"],
        popular: false,
    },
    {
        id: "basic_6m",
        name: "Pro",
        price: "₹300",
        duration: "6 Months",
        amount: 300,
        features: ["Everything in Basic", "YouTube auto-scheduler", "Analytics dashboard", "Priority Email Support"],
        popular: true,
    },
    {
        id: "basic_1y",
        name: "Annual",
        price: "₹1000",
        duration: "1 Year",
        amount: 1000,
        features: ["Everything in Pro", "4K Video Quality", "Dedicated Support Manager", "Custom Branding"],
        popular: false,
    }
];

export function PricingCards({ theme = "light" }: { theme?: "light" | "dark" }) {
    const { user } = useUser();
    const { openSignIn } = useClerk();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [activePlan, setActivePlan] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isFetchingPlan, setIsFetchingPlan] = useState(true);

    const isDark = theme === "dark";

    useEffect(() => {
        // Fetch user's current plan
        const fetchPlan = async () => {
            if (!user) {
                // Instantly resolve loading state for unauthenticated users instead of fetching
                setIsFetchingPlan(false);
                return;
            }
            try {
                const res = await fetch("/api/user/get-plan");
                const data = await res.json();
                if (data.success && data.plan) {
                    setActivePlan(data.plan);
                }
            } catch (err) {
                console.error("Failed to fetch plan:", err);
            } finally {
                setIsFetchingPlan(false);
            }
        };
        fetchPlan();
    }, [user]);

    useEffect(() => {
        // Load the Razorpay SDK script asynchronously
        const loadRazorpay = () => {
            if (document.getElementById("razorpay-js")) return;
            const script = document.createElement("script");
            script.id = "razorpay-js";
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            document.body.appendChild(script);
        };
        loadRazorpay();
    }, []);

    const handleSubscribe = async (plan: typeof plans[0]) => {
        if (!user) {
            openSignIn({ forceRedirectUrl: window.location.href });
            return;
        }

        if (typeof window === "undefined" || !(window as any).Razorpay) {
            alert("Razorpay SDK is still loading. Please try again in a few seconds.");
            return;
        }

        try {
            setLoadingPlan(plan.id);

            // 1. Create order on the backend
            const response = await fetch("/api/razorpay/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: plan.amount, plan: plan.id }),
            });
            const orderData = await response.json();

            if (!response.ok) {
                throw new Error(orderData.error || "Failed to create order");
            }

            // 2. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SLc6mSJmDgAfsf",
                amount: orderData.amount,
                currency: orderData.currency,
                name: "VidZilly",
                description: `${plan.name} Subscription`,
                order_id: orderData.orderId,
                prefill: {
                    name: user.fullName || "User",
                    email: user.primaryEmailAddress?.emailAddress || "",
                },
                theme: {
                    color: isDark ? "#A855F7" : "#111827",
                },
                handler: async (res: any) => {
                    // 3. Verify Payment
                    const verifyRes = await fetch("/api/razorpay/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: res.razorpay_order_id,
                            razorpay_payment_id: res.razorpay_payment_id,
                            razorpay_signature: res.razorpay_signature,
                            plan: plan.id,
                        }),
                    });

                    const verifyData = await verifyRes.json();

                    if (verifyRes.ok) {
                        setShowSuccessModal(true);
                        setActivePlan(plan.id);
                        confetti({
                            particleCount: 150,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#A855F7', '#22D3EE', '#10B981', '#F59E0B']
                        });
                    } else {
                        alert("Payment verification failed: " + verifyData.error);
                    }
                },
            };

            const rzp = new (window as any).Razorpay(options);

            rzp.on("payment.failed", function (response: any) {
                alert("Payment Failed - " + response.error.description);
            });

            rzp.open();

        } catch (error: any) {
            console.error("Subscription Error:", error);
            alert(error.message || "An error occurred while initiating the payment.");
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <>
            {/* ══ PRICING CARDS ══ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {isFetchingPlan && (
                    <div className={`absolute inset-0 z-50 flex items-center justify-center rounded-2xl ${isDark ? "bg-zinc-950/50 backdrop-blur-sm" : "bg-white/50 backdrop-blur-sm"
                        }`}>
                        <Loader2 className={`h-8 w-8 animate-spin ${isDark ? "text-white" : "text-gray-900"}`} />
                    </div>
                )}

                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative flex flex-col rounded-3xl border p-8 lg:p-10 shadow-sm transition-all duration-300 hover:shadow-md ${isDark
                            ? plan.popular
                                ? "bg-zinc-900/80 border-purple-500 shadow-purple-500/10 shadow-2xl scale-100 md:scale-105 lg:scale-110 z-10"
                                : "bg-zinc-900/40 border-zinc-800"
                            : plan.popular
                                ? "bg-white border-gray-900 shadow-xl scale-100 md:scale-105 z-10"
                                : "bg-white border-gray-200"
                            }`}
                    >
                        {plan.popular && (
                            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${isDark ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white" : "bg-gray-900 text-white"
                                }`}>
                                Most Popular
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                            <p className={`text-sm mt-2 ${isDark ? "text-zinc-400" : "text-gray-500"}`}>Billed per {plan.duration}</p>
                        </div>

                        <div className={`mb-6 flex items-baseline ${isDark ? "text-white" : "text-gray-900"}`}>
                            <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                            <span className={`ml-1 text-xl font-semibold ${isDark ? "text-zinc-500" : "text-gray-500"}`}>/{plan.duration === "1 Month" ? "mo" : plan.duration === "1 Year" ? "yr" : "6mo"}</span>
                        </div>

                        <ul className="mb-8 flex-1 space-y-4">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-3">
                                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isDark ? "bg-purple-500/20 text-purple-400" : "bg-gray-100 text-gray-900"
                                        }`}>
                                        <Check className="h-3 w-3" />
                                    </span>
                                    <span className={`text-sm ${isDark ? "text-zinc-300" : "text-gray-600"}`}>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleSubscribe(plan)}
                            disabled={loadingPlan === plan.id || activePlan === plan.id}
                            className={`w-full rounded-xl py-3 px-4 text-center text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activePlan === plan.id
                                ? isDark
                                    ? "bg-green-500/10 text-green-400 border border-green-500/20 cursor-default"
                                    : "bg-green-50 text-green-700 border border-green-200 cursor-default"
                                : plan.popular
                                    ? isDark
                                        ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:opacity-90 shadow-lg shadow-purple-500/25"
                                        : "bg-gray-900 text-white hover:bg-gray-800"
                                    : isDark
                                        ? "bg-zinc-800 text-white hover:bg-zinc-700"
                                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                                }`}
                        >
                            {loadingPlan === plan.id ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : activePlan === plan.id ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    Current Plan
                                </>
                            ) : (
                                "Subscribe Now"
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* ══ SUCCESS MODAL ══ */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowSuccessModal(false)}
                    />

                    <div className={`relative w-full max-w-sm overflow-hidden rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 fade-in-0 duration-300 ${isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white"
                        }`}>
                        {/* Close button */}
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className={`absolute right-4 top-4 rounded-full p-2 transition-colors ${isDark ? "text-zinc-400 hover:bg-zinc-800 hover:text-white" : "text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-6 ${isDark ? "bg-green-500/20" : "bg-green-100"
                            }`}>
                            <Sparkles className={`h-8 w-8 ${isDark ? "text-green-400" : "text-green-600"}`} />
                        </div>

                        <div className="text-center">
                            <h3 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Payment Successful!</h3>
                            <p className={`text-sm mb-8 leading-relaxed ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
                                Welcome aboard! Your VidZilly subscription has been upgraded successfully. You now have full access to your new features.
                            </p>

                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className={`w-full rounded-xl py-3.5 px-4 text-sm font-semibold text-white shadow-sm transition-colors ${isDark ? "bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90" : "bg-gray-900 hover:bg-gray-800"
                                    }`}
                            >
                                Let's get creating
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
