import Link from "next/link";
import {
    BookOpen,
    PlayCircle,
    Zap,
    Globe,
    Video,
    Calendar,
    Settings,
    ChevronRight,
    Clock,
    Star,
    Search,
    ArrowRight,
    FileText,
    Lightbulb,
    Rocket,
    CheckCircle,
} from "lucide-react";

/* ─── Data with navigation hrefs ─── */
const categories = [
    {
        icon: Rocket,
        label: "Getting Started",
        color: "text-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-100",
        count: 5,
        href: "/dashboard/create",
    },
    {
        icon: Video,
        label: "Video Creation",
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100",
        count: 8,
        href: "/dashboard/video",
    },
    {
        icon: Globe,
        label: "Publishing",
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-100",
        count: 6,
        href: "/dashboard/setting",
    },
    {
        icon: Calendar,
        label: "Scheduling",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        count: 4,
        href: "/dashboard/setting",
    },
    {
        icon: Settings,
        label: "Settings & Config",
        color: "text-gray-600",
        bg: "bg-gray-50",
        border: "border-gray-200",
        count: 7,
        href: "/dashboard/setting",
    },
    {
        icon: Zap,
        label: "AI & Automation",
        color: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-100",
        count: 9,
        href: "/dashboard/create",
    },
];

const featured = [
    {
        badge: "Quick Start",
        badgeColor: "bg-purple-100 text-purple-700",
        icon: Rocket,
        iconColor: "text-purple-600",
        iconBg: "bg-purple-50",
        title: "Create Your First AI Video Series",
        desc: "Learn how to set up a niche, configure AI settings, and generate your first video series in under 10 minutes.",
        duration: "8 min read",
        difficulty: "Beginner",
        steps: 6,
        popular: true,
        href: "/dashboard/create",
    },
    {
        badge: "Publishing",
        badgeColor: "bg-green-100 text-green-700",
        icon: Globe,
        iconColor: "text-green-600",
        iconBg: "bg-green-50",
        title: "Connect & Auto-Publish to YouTube",
        desc: "Step-by-step guide to connecting your YouTube channel and enabling fully automated video publishing.",
        duration: "5 min read",
        difficulty: "Beginner",
        steps: 4,
        popular: true,
        href: "/dashboard/setting",
    },
    {
        badge: "Scheduling",
        badgeColor: "bg-amber-100 text-amber-700",
        icon: Calendar,
        iconColor: "text-amber-600",
        iconBg: "bg-amber-50",
        title: "Setting Up Daily Auto-Scheduling",
        desc: "Configure your series to automatically generate and publish videos every day on a custom schedule.",
        duration: "6 min read",
        difficulty: "Intermediate",
        steps: 5,
        popular: false,
        href: "/dashboard/setting",
    },
    {
        badge: "AI & Automation",
        badgeColor: "bg-rose-100 text-rose-700",
        icon: Zap,
        iconColor: "text-rose-600",
        iconBg: "bg-rose-50",
        title: "Customizing AI Voices & Styles",
        desc: "Choose from 50+ AI voices, adjust speaking styles, and match your brand tone for every video series.",
        duration: "7 min read",
        difficulty: "Intermediate",
        steps: 7,
        popular: false,
        href: "/dashboard/create",
    },
    {
        badge: "Video Creation",
        badgeColor: "bg-blue-100 text-blue-700",
        icon: Video,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-50",
        title: "Advanced Video Customization",
        desc: "Control b-roll footage, transitions, captions, and background music to create truly unique videos.",
        duration: "10 min read",
        difficulty: "Advanced",
        steps: 9,
        popular: false,
        href: "/dashboard/video",
    },
    {
        badge: "Settings",
        badgeColor: "bg-gray-100 text-gray-700",
        icon: Settings,
        iconColor: "text-gray-600",
        iconBg: "bg-gray-100",
        title: "Connecting Social Accounts",
        desc: "Link Instagram, TikTok, Facebook and Email to publish content everywhere with a single click.",
        duration: "4 min read",
        difficulty: "Beginner",
        steps: 3,
        popular: false,
        href: "/dashboard/setting",
    },
];

/* Quick-start steps with navigable links */
const quickSteps = [
    {
        step: 1,
        title: "Pick your niche",
        desc: "Choose from 20+ content niches or create a custom one.",
        href: "/dashboard/create",
    },
    {
        step: 2,
        title: "Configure AI settings",
        desc: "Select voice, style, language, and video length.",
        href: "/dashboard/create",
    },
    {
        step: 3,
        title: "Connect your channels",
        desc: "Link YouTube, Instagram, TikTok, or use email.",
        href: "/dashboard/setting",
    },
    {
        step: 4,
        title: "Generate & publish",
        desc: "Hit generate — your video is created and published automatically.",
        href: "/dashboard",
    },
];

/* Checklist with navigation hrefs */
const checklistItems = [
    { done: true, text: "Create your account", link: null, href: null },
    { done: false, text: "Connect your YouTube channel", link: "Connect →", href: "/dashboard/setting" },
    { done: false, text: "Create your first video series", link: "Start →", href: "/dashboard/create" },
    { done: false, text: "Set up daily auto-scheduling", link: "Configure →", href: "/dashboard/setting" },
    { done: false, text: "Upgrade to Basic for unlimited videos", link: "Upgrade →", href: "/dashboard/billing" },
];

const difficultyColor: Record<string, string> = {
    Beginner: "bg-green-50 text-green-700 border-green-100",
    Intermediate: "bg-amber-50 text-amber-700 border-amber-100",
    Advanced: "bg-red-50 text-red-700 border-red-100",
};

/* ─── Page ─── */
export default function GuidesPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-14 pb-16">

            {/* ══ 1. HERO ══ */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6 py-10 sm:px-10 sm:py-12 text-white">
                <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-600 opacity-20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-10 left-1/3 h-48 w-48 rounded-full bg-blue-600 opacity-15 blur-3xl" />

                <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur-sm mb-4">
                        <BookOpen className="h-3.5 w-3.5" /> Documentation &amp; Guides
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                        Everything you need to master VidZilly
                    </h1>
                    <p className="mt-3 text-white/60 text-sm sm:text-base leading-relaxed">
                        From your first video creation to full automation — find step-by-step
                        guides, tips, and best practices all in one place.
                    </p>
                    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 sm:px-5 py-3 backdrop-blur-sm max-w-md">
                        <Search className="h-4 w-4 text-white/50 flex-shrink-0" />
                        <span className="text-sm text-white/40">Search guides...</span>
                        <kbd className="ml-auto rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] text-white/40">⌘K</kbd>
                    </div>
                </div>

                <div className="relative z-10 mt-8 grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6">
                    {[
                        { value: "39+", label: "Guides" },
                        { value: "6", label: "Categories" },
                        { value: "10min", label: "Avg read" },
                        { value: "Free", label: "Always free" },
                    ].map((s) => (
                        <div key={s.label} className="text-left sm:text-center">
                            <p className="text-xl font-extrabold text-white leading-none">{s.value}</p>
                            <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══ 2. CATEGORIES ══ */}
            <div>
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Browse by Category</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Jump to what you need most.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {categories.map((cat) => (
                        <Link
                            key={cat.label}
                            href={cat.href}
                            className={`group flex items-center gap-4 rounded-2xl border ${cat.border} bg-white px-5 py-4 shadow-sm text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
                        >
                            <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${cat.bg}`}>
                                <cat.icon className={`h-5 w-5 ${cat.color}`} />
                            </span>
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">{cat.label}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{cat.count} guides</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0 ml-auto group-hover:text-gray-500 transition-colors" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* ══ 3. QUICK-START STEPS ══ */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
                        <Lightbulb className="h-5 w-5 text-white" />
                    </span>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">New here? Start in 4 steps</h2>
                        <p className="text-xs text-gray-500">You&apos;ll be publishing AI videos in under 15 minutes.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4">
                    {quickSteps.map((s, i) => (
                        <Link key={s.step} href={s.href} className="group relative flex flex-col gap-2 hover:opacity-90 transition-opacity">
                            {i < quickSteps.length - 1 && (
                                <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-gray-100 z-0" />
                            )}
                            <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white text-sm font-bold group-hover:bg-purple-700 transition-colors">
                                {s.step}
                            </span>
                            <p className="font-semibold text-gray-900 text-sm group-hover:text-purple-700 transition-colors">{s.title}</p>
                            <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                            <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400 group-hover:text-purple-600 transition-colors mt-auto pt-1">
                                Go <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ══ 4. FEATURED GUIDES ══ */}
            <div>
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Featured Guides</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Most read by creators like you.</p>
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                        View all <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {featured.map((guide) => (
                        <Link
                            key={guide.title}
                            href={guide.href}
                            className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                        >
                            {guide.popular && (
                                <span className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                                    <Star className="h-3 w-3" /> Popular
                                </span>
                            )}
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${guide.iconBg}`}>
                                    <guide.icon className={`h-5 w-5 ${guide.iconColor}`} />
                                </span>
                                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${guide.badgeColor}`}>
                                    {guide.badge}
                                </span>
                            </div>

                            <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1.5 group-hover:text-purple-700 transition-colors">
                                {guide.title}
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed flex-1">{guide.desc}</p>

                            <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-3">
                                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                    <Clock className="h-3 w-3" /> {guide.duration}
                                </span>
                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${difficultyColor[guide.difficulty]}`}>
                                    {guide.difficulty}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] text-gray-400 ml-auto">
                                    <FileText className="h-3 w-3" /> {guide.steps} steps
                                </span>
                            </div>

                            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-purple-600 transition-colors">
                                Go to page <ArrowRight className="h-3.5 w-3.5 translate-x-0 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ══ 5. VIDEO TUTORIALS BANNER ══ */}
            <div className="flex flex-col sm:flex-row items-center gap-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gray-900">
                    <PlayCircle className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-lg font-bold text-gray-900">Prefer video tutorials?</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Watch our step-by-step video walkthroughs on our YouTube channel —
                        covering everything from setup to advanced automation.
                    </p>
                </div>
                <Link
                    href="/dashboard/video"
                    className="flex-shrink-0 flex items-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors shadow-sm"
                >
                    Watch tutorials <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {/* ══ 6. CHECKLIST ══ */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Setup Checklist</h2>
                <p className="text-sm text-gray-500 mb-5">Complete these to unlock the full power of VidZilly.</p>
                <div className="space-y-3">
                    {checklistItems.map((item) =>
                        item.href ? (
                            <Link
                                key={item.text}
                                href={item.href}
                                className={`flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-200 ${item.done
                                    ? "border-green-100 bg-green-50"
                                    : "border-gray-100 bg-white hover:border-purple-200 hover:shadow-sm shadow-sm"
                                    }`}
                            >
                                <CheckCircle className={`h-5 w-5 flex-shrink-0 ${item.done ? "text-green-500" : "text-gray-200"}`} />
                                <span className={`flex-1 text-sm font-medium ${item.done ? "text-green-700 line-through decoration-green-300" : "text-gray-700"}`}>
                                    {item.text}
                                </span>
                                {item.link && (
                                    <span className="text-xs font-semibold text-purple-600 flex items-center gap-1">
                                        {item.link} <ArrowRight className="h-3 w-3" />
                                    </span>
                                )}
                            </Link>
                        ) : (
                            <div
                                key={item.text}
                                className="flex items-center gap-4 rounded-2xl border border-green-100 bg-green-50 px-5 py-4"
                            >
                                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                                <span className="flex-1 text-sm font-medium text-green-700 line-through decoration-green-300">
                                    {item.text}
                                </span>
                            </div>
                        )
                    )}
                </div>
            </div>

        </div>
    );
}
