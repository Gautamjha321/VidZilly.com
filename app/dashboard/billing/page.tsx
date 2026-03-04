/* eslint-disable @typescript-eslint/no-unused-vars */
import { PricingCards } from "./_components/PricingCards";
import {
    Zap,
    Shield,
    Clock,
    Star,
    Check,
    Video,
    Globe,
    Headphones,
    TrendingUp,
    ChevronDown,
    Users,
} from "lucide-react";

/* ─── Clerk appearance — white cards + dark buttons (same as before) ── */
const clerkTheme = {
    variables: {
        colorBackground: "#ffffff",
        colorText: "#111827",
        colorTextSecondary: "#6b7280",
        colorPrimary: "#111827",
        colorNeutral: "#f3f4f6",
        borderRadius: "0.75rem",
        fontFamily: "inherit",
        fontSize: "14px",
    },
    elements: {
        pricingTableCard:
            "!bg-white !border !border-gray-200 !rounded-2xl !shadow-sm hover:!shadow-md !transition-shadow !duration-200",
        pricingTableCardHighlighted: "!border-gray-300 !shadow-md",
        pricingTableCardFooterButton:
            "!bg-gray-900 hover:!bg-gray-800 !text-white !font-medium !rounded-xl !transition-colors",
        pricingTableCardTitle: "!text-gray-900 !font-semibold !text-lg",
        pricingTableCardPrice: "!text-gray-900 !font-extrabold",
        pricingTableCardFeatureListItem: "!text-gray-600 !text-sm",
        pricingTableCardFeatureListItemCheckmark: "!text-gray-700",
        badge: "!bg-gray-900 !text-white",
    },
};

/* ─── Static data ── */
const trustStats = [
    { icon: Users, value: "10K+", label: "Creators", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: Video, value: "500K+", label: "Videos Generated", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Star, value: "99.9%", label: "Uptime SLA", color: "text-amber-500", bg: "bg-amber-50" },
    { icon: Zap, value: "4.9★", label: "Avg Rating", color: "text-green-500", bg: "bg-green-50" },
];

const included = [
    "Unlimited AI script writing",
    "Custom voice selection",
    "Background music library",
    "Auto captions & subtitles",
    "YouTube auto-scheduler",
    "Analytics dashboard",
];

const highlights = [
    {
        icon: Zap,
        title: "AI-Powered Generation",
        desc: "Studio-quality videos in seconds using the latest AI models.",
        color: "text-amber-500",
        bg: "bg-amber-50",
    },
    {
        icon: Globe,
        title: "Multi-Platform Publishing",
        desc: "Auto-publish to YouTube, Instagram, TikTok and more in one click.",
        color: "text-blue-500",
        bg: "bg-blue-50",
    },
    {
        icon: Video,
        title: "4K Video Quality",
        desc: "Export in up to 4K resolution with professional-grade rendering.",
        color: "text-purple-500",
        bg: "bg-purple-50",
    },
    {
        icon: Headphones,
        title: "Priority Support",
        desc: "Dedicated support with a response time under 2 hours.",
        color: "text-green-500",
        bg: "bg-green-50",
    },
];

const faqs = [
    {
        q: "Can I cancel anytime?",
        a: "Yes — cancel instantly from your billing page. No questions asked, no hidden fees.",
    },
    {
        q: "Is there a free trial?",
        a: "Every new account starts on the Free plan with no credit card required.",
    },
    {
        q: "What payment methods do you accept?",
        a: "We accept all major credit/debit cards via Stripe. Payments are 100% secure.",
    },
    {
        q: "Can I upgrade or downgrade later?",
        a: "Absolutely. You can switch plans at any time and we'll prorate the difference.",
    },
];

export default function BillingPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-14 pb-16">

            {/* ══ 1. HERO ══ */}
            <div className="text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-3.5 py-1 text-xs font-semibold text-gray-700 mb-4">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Plans &amp; Pricing
                </span>
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                    Upgrade Your Plan
                </h1>
                <p className="mt-2 text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
                    Select a plan that fits your content creation needs. All plans include
                    automated scheduling and high-quality AI generations.
                </p>
            </div>

            {/* ══ 2. TRUST STATS ══ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {trustStats.map((s) => (
                    <div
                        key={s.label}
                        className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm"
                    >
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                            <s.icon className={`h-5 w-5 ${s.color}`} />
                        </span>
                        <p className="text-2xl font-extrabold text-gray-900 leading-none">{s.value}</p>
                        <p className="text-xs text-gray-400 text-center">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ══ 3. CUSTOM PRICING CARDS ══ */}
            <PricingCards />

            {/* ══ 4. EVERYTHING INCLUDED ══ */}
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Everything included in every plan</h2>
                        <p className="text-sm text-gray-500 mt-0.5">No feature-gating on the essentials.</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                        <Check className="h-3.5 w-3.5" /> Always included
                    </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {included.map((item) => (
                        <div
                            key={item}
                            className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                        >
                            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-900">
                                <Check className="h-3 w-3 text-white" />
                            </span>
                            <span className="text-sm text-gray-700 font-medium">{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══ 5. WHY VIDZILY ══ */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Why creators choose VidZilly</h2>
                <p className="text-sm text-gray-500 mb-6">Built for speed, quality, and scale.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                    {highlights.map((h) => (
                        <div
                            key={h.title}
                            className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${h.bg}`}>
                                <h.icon className={`h-5 w-5 ${h.color}`} />
                            </span>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">{h.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{h.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══ 6. FAQ ══ */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Frequently asked questions</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Still have questions?{" "}
                    <span className="text-gray-900 font-medium cursor-pointer hover:underline">Chat with support →</span>
                </p>
                <div className="space-y-3">
                    {faqs.map((faq) => (
                        <details
                            key={faq.q}
                            className="group rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
                        >
                            <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-semibold text-gray-900 list-none select-none hover:bg-gray-50 transition-colors">
                                {faq.q}
                                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180 flex-shrink-0" />
                            </summary>
                            <div className="border-t border-gray-100 px-6 py-4 text-sm text-gray-500 leading-relaxed">
                                {faq.a}
                            </div>
                        </details>
                    ))}
                </div>
            </div>

            {/* ══ 7. TRUST FOOTER ══ */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 pt-4 border-t border-gray-100">
                <span className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-gray-500" /> Secured by RezorPay
                </span>
                <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gray-500" /> Instant activation
                </span>
                <span className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-gray-500" /> Cancel anytime
                </span>
                <span className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-gray-500" /> No hidden fees
                </span>
            </div>

        </div>
    );
}
