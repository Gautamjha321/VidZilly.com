import {
  Play,
  Sparkles,
  Calendar,
  Share2,
  ArrowRight,
  Zap,
  Video,
  Clock,
  Globe,
  CheckCircle,
  Youtube,
  Instagram,
  Facebook,
  Mail,
  Twitter,
  ChevronRight,
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/actions/user";
/* eslint-disable @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
import Link from "next/link";
import { PricingCards } from "./dashboard/billing/_components/PricingCards";
import LandingNavbar from "./_components/LandingNavbar";

export default async function Home() {
  const user = await currentUser();
  if (user) {
    await syncUser();
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className="nav-blur fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400">
              <Play className="h-4 w-4 fill-white text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Vid<span className="gradient-text">Zilly</span>
            </span>
          </Link>

          {/* Nav links — hidden on mobile */}
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-zinc-400 transition hover:text-white">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-zinc-400 transition hover:text-white">
              How It Works
            </a>
            <a href="#platforms" className="text-sm text-zinc-400 transition hover:text-white">
              Platforms
            </a>
            <a href="#pricing" className="text-sm text-zinc-400 transition hover:text-white">
              Pricing
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-zinc-300 transition hover:text-white">
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-gradient rounded-full px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="hidden text-sm font-medium text-zinc-300 transition hover:text-white md:block"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/50 pl-1 pr-4 py-1">
                <UserButton afterSignOutUrl="/" />
                <span className="text-xs font-medium text-zinc-400">Account</span>
              </div>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="hero-bg relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 pt-20 sm:pt-24 md:pt-32 pb-16 text-center">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute top-20 left-1/4 h-64 w-64 md:h-72 md:w-72 rounded-full bg-purple-600/20 blur-[100px] md:blur-[120px]" />
        <div className="pointer-events-none absolute bottom-20 right-1/4 h-64 w-64 md:h-72 md:w-72 rounded-full bg-cyan-500/20 blur-[100px] md:blur-[120px]" />

        <div className="animate-fade-in-up relative z-10 mx-auto max-w-4xl">
          {/* Badge */}
          <div className="mb-6 md:mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 md:px-4 text-xs md:text-sm text-purple-300">
            <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span>AI-Powered Video Generation</span>
          </div>

          <h1 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl md:text-7xl md:leading-[1.1]">
            Create, Schedule &amp;{" "}
            <span className="gradient-text animate-gradient-shift">Publish AI Videos</span>{" "}
            Everywhere
          </h1>

          <p className="mx-auto mb-8 md:mb-10 max-w-2xl px-2 text-base md:text-lg leading-relaxed text-zinc-400 lg:text-xl">
            Generate stunning short-form videos with AI and auto-schedule them to{" "}
            <span className="text-white font-medium">YouTube</span>,{" "}
            <span className="text-white font-medium">Instagram</span>,{" "}
            <span className="text-white font-medium">Facebook</span> &amp;{" "}
            <span className="text-white font-medium">Email</span> — all from one powerful dashboard.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 w-full px-4 sm:px-0">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="btn-gradient w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white">
                  Start Creating for Free
                  <ArrowRight className="h-4 w-4" />
                </button>
              </SignUpButton>
              <a
                href="#how-it-works"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-zinc-700 px-8 py-3.5 text-base font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                <Play className="h-4 w-4" />
                Watch Demo
              </a>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="btn-gradient w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-8 py-3.5 text-base font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                <Zap className="h-4 w-4" />
                Start Creating
              </Link>
            </SignedIn>
          </div>
        </div>

        {/* Hero visual mockup */}
        <div className="animate-fade-in-up delay-300 relative z-10 mt-12 md:mt-16 w-full max-w-4xl opacity-0 px-2 sm:px-0" style={{ animationFillMode: "forwards", animationDelay: "0.4s" }}>
          <div className="glow-purple rounded-2xl border border-zinc-800 bg-zinc-900/60 p-1.5 sm:p-2">
            <div className="rounded-xl bg-zinc-900 p-4 sm:p-6 md:p-8">
              {/* Fake dashboard top bar */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-500" />
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-yellow-500" />
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500" />
                </div>
                <div className="rounded-full bg-zinc-800 px-3 py-1 text-[10px] sm:text-xs text-zinc-500 truncate max-w-[150px] sm:max-w-none">
                  app.vidzilly.com/dashboard
                </div>
                <div />
              </div>
              {/* Fake content grid */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: "Videos Created", value: "1,284", icon: Video, color: "text-purple-400" },
                  { label: "Scheduled", value: "856", icon: Calendar, color: "text-cyan-400" },
                  { label: "Published", value: "2,041", icon: Share2, color: "text-pink-400" },
                  { label: "Views", value: "4.2M", icon: Zap, color: "text-amber-400" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-zinc-800 bg-zinc-800/40 p-4 text-center"
                  >
                    <stat.icon className={`mx-auto mb-2 h-5 w-5 ${stat.color}`} />
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-zinc-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-12 animate-bounce">
          <ChevronRight className="h-6 w-6 rotate-90 text-zinc-600" />
        </div>
      </section>

      {/* ═══════════ PLATFORMS ═══════════ */}
      <section id="platforms" className="relative py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <p className="mb-6 md:mb-8 text-xs sm:text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Publish everywhere at once
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6">
            {[
              { Icon: Youtube, label: "YouTube", color: "hover:border-red-500/40 hover:bg-red-500/5" },
              { Icon: Instagram, label: "Instagram", color: "hover:border-pink-500/40 hover:bg-pink-500/5" },
              { Icon: Facebook, label: "Facebook", color: "hover:border-blue-500/40 hover:bg-blue-500/5" },
              { Icon: Mail, label: "Email", color: "hover:border-amber-500/40 hover:bg-amber-500/5" },
            ].map((p) => (
              <div
                key={p.label}
                className={`platform-badge flex items-center gap-2 sm:gap-3 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 ${p.color}`}
              >
                <p.Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base font-medium">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="relative py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 md:mb-16 text-center">
            <p className="mb-2 md:mb-3 text-xs sm:text-sm font-semibold uppercase tracking-widest text-purple-400">
              Features
            </p>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
              Everything you need to{" "}
              <span className="gradient-text">dominate video</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-zinc-400">
              From idea to published video in minutes. Our AI handles the heavy lifting so you can
              focus on growing your audience.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="glass-card group rounded-2xl p-6 md:p-8">
              <div className="mb-5 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 md:mb-3 text-lg md:text-xl font-bold">AI Video Generation</h3>
              <p className="leading-relaxed text-sm md:text-base text-zinc-400">
                Describe your idea in plain text and our AI creates professional short-form videos
                complete with visuals, captions, voiceovers, and music.
              </p>
              <ul className="mt-4 md:mt-5 space-y-2">
                {["Text-to-video in seconds", "Auto captions & subtitles", "AI voiceover support"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-zinc-400">
                      <CheckCircle className="h-4 w-4 text-purple-400 shrink-0" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="glass-card group rounded-2xl p-6 md:p-8">
              <div className="mb-5 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5">
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-cyan-400" />
              </div>
              <h3 className="mb-2 md:mb-3 text-lg md:text-xl font-bold">Smart Auto-Scheduling</h3>
              <p className="leading-relaxed text-sm md:text-base text-zinc-400">
                Set it and forget it. Our intelligent scheduler picks optimal posting times for
                maximum engagement based on your audience data.
              </p>
              <ul className="mt-4 md:mt-5 space-y-2">
                {["AI-optimized post times", "Bulk scheduling queue", "Calendar drag-and-drop"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-zinc-400">
                      <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="glass-card group rounded-2xl p-6 md:p-8 sm:col-span-2 lg:col-span-1">
              <div className="mb-5 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-500/5">
                <Globe className="h-5 w-5 md:h-6 md:w-6 text-pink-400" />
              </div>
              <h3 className="mb-2 md:mb-3 text-lg md:text-xl font-bold">Multi-Platform Publishing</h3>
              <p className="leading-relaxed text-sm md:text-base text-zinc-400">
                One click, four platforms. Automatically adapt and publish your videos to YouTube
                Shorts, Instagram Reels, Facebook, and email campaigns.
              </p>
              <ul className="mt-4 md:mt-5 space-y-2">
                {["Auto-format per platform", "Direct API publishing", "Performance analytics"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-zinc-400">
                      <CheckCircle className="h-4 w-4 text-pink-400 shrink-0" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="relative py-16 md:py-24">
        {/* Background accent */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] md:h-[600px] md:w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/5 blur-[100px] md:blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 md:mb-16 text-center">
            <p className="mb-2 md:mb-3 text-xs sm:text-sm font-semibold uppercase tracking-widest text-cyan-400">
              How It Works
            </p>
            <h2 className="mb-3 md:mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
              Three steps to{" "}
              <span className="gradient-text">viral content</span>
            </h2>
            <p className="mx-auto max-w-xl text-base md:text-lg text-zinc-400">
              No editing skills required. Go from idea to multi-platform published video in minutes.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Describe Your Vision",
                desc: "Type a brief description of the video you want. Include topic, tone, style, and target audience.",
                icon: Sparkles,
                color: "from-purple-500 to-purple-600",
              },
              {
                step: "02",
                title: "AI Generates Video",
                desc: "Our AI engine produces a polished short-form video with matching visuals, voiceover, captions, and music.",
                icon: Video,
                color: "from-cyan-500 to-cyan-600",
              },
              {
                step: "03",
                title: "Schedule & Publish",
                desc: "Choose your platforms, set the schedule, and VidZilly handles the rest — auto-posting across all channels.",
                icon: Calendar,
                color: "from-pink-500 to-pink-600",
              },
            ].map((s) => (
              <div key={s.step} className="relative text-center sm:text-left md:text-center">
                <div
                  className={`mx-auto sm:mx-0 md:mx-auto mb-5 md:mb-6 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} shadow-lg`}
                >
                  <s.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <span className="mb-2 block text-xs md:text-sm font-bold text-zinc-600">STEP {s.step}</span>
                <h3 className="mb-2 md:mb-3 text-lg md:text-xl font-bold">{s.title}</h3>
                <p className="leading-relaxed text-sm md:text-base text-zinc-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA SECTION ═══════════ */}
      <section id="pricing" className="relative py-16 md:py-24 overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute top-20 right-0 h-64 w-64 md:top-40 md:right-10 md:h-96 md:w-96 rounded-full bg-purple-500/10 blur-[100px] md:blur-[120px]" />
        <div className="pointer-events-none absolute bottom-10 left-0 h-64 w-64 md:bottom-10 md:left-10 md:h-96 md:w-96 rounded-full bg-cyan-500/10 blur-[100px] md:blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <div className="mb-4 md:mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm text-cyan-300">
            <Zap className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Limited Time Offer
          </div>
          <h2 className="mb-3 md:mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
            Choose your{" "}
            <span className="gradient-text">perfect plan</span>
          </h2>
          <p className="mx-auto mb-10 md:mb-16 max-w-xl text-base md:text-lg text-zinc-400">
            Whether you're just starting out or scaling a media empire, we have a plan that fits your creator journey. No credit card required to start.
          </p>

          {/* Embed Live Pricing Component */}
          <div className="text-left w-full mx-auto">
            <PricingCards theme="dark" />
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="relative border-t border-zinc-800 bg-zinc-950 pt-16 md:pt-20 pb-10 overflow-hidden">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[300px] w-[500px] md:h-[500px] md:w-[800px] rounded-full bg-purple-900/10 blur-[100px] md:blur-[150px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8 pb-12 md:pb-16">

            {/* Brand & Newsletter Column */}
            <div className="lg:col-span-5">
              <a href="#" className="mb-6 inline-flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 shadow-lg shadow-purple-500/20">
                  <Play className="h-4 w-4 fill-white text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight">
                  Vid<span className="gradient-text">Zilly</span>
                </span>
              </a>
              <p className="mb-6 md:mb-8 max-w-sm text-sm md:text-base leading-relaxed text-zinc-400">
                The all-in-one AI platform for creating, scheduling, and publishing magnificent short-form videos across every major social network.
              </p>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold tracking-wide text-zinc-300">Subscribe for Creator Tips</h4>
                <div className="flex max-w-md items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 p-1.5 focus-within:border-purple-500/50 focus-within:bg-zinc-900 transition-all">
                  <div className="pl-3 py-2 text-zinc-500"><Mail className="h-4 w-4" /></div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none min-w-0"
                  />
                  <button className="flex h-9 md:h-10 items-center justify-center rounded-full bg-white px-4 md:px-5 text-sm font-semibold text-zinc-900 transition-transform hover:scale-105 active:scale-95 shrink-0">
                    Join
                  </button>
                </div>
              </div>
            </div>

            {/* Links Columns */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7 font-sans w-full lg:w-full pt-2">
              {/* Product */}
              <div>
                <h4 className="mb-5 md:mb-6 text-xs md:text-sm font-bold uppercase tracking-wider text-zinc-200">
                  Product
                </h4>
                <ul className="space-y-3 md:space-y-4">
                  {["Features", "Integration", "Pricing", "Changelog", "Roadmap"].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white hover:underline underline-offset-4 decoration-purple-500/50">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="mb-5 md:mb-6 text-xs md:text-sm font-bold uppercase tracking-wider text-zinc-200">
                  Company
                </h4>
                <ul className="space-y-3 md:space-y-4">
                  {["About Us", "Careers", "Blog", "Contact", "Partners"].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white hover:underline underline-offset-4 decoration-purple-500/50">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div className="col-span-2 sm:col-span-1 border-t border-zinc-900/50 sm:border-0 pt-6 sm:pt-0">
                <h4 className="mb-5 md:mb-6 text-xs md:text-sm font-bold uppercase tracking-wider text-zinc-200">
                  Legal
                </h4>
                <ul className="space-y-3 md:space-y-4">
                  {["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white hover:underline underline-offset-4 decoration-purple-500/50">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 border-t border-zinc-800/80 bg-zinc-950/50 pt-6 md:pt-8 mt-4">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:gap-6 px-4 sm:px-6 md:flex-row text-center md:text-left">

            <div className="flex items-center gap-3 md:gap-4 order-3 md:order-1 mt-2 md:mt-0">
              {[
                { Icon: Youtube, href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: Facebook, href: "#" },
                { Icon: Twitter, href: "#" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="group flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-zinc-900 transition-all hover:bg-zinc-800"
                >
                  <social.Icon className="h-4 w-4 md:h-4 md:w-4 text-zinc-400 transition-colors group-hover:text-purple-400" />
                </a>
              ))}
            </div>

            <p className="text-xs sm:text-sm text-zinc-500 font-medium order-1 md:order-2">
              &copy; {new Date().getFullYear()} VidZilly. All rights reserved.
            </p>

            <p className="text-xs sm:text-sm font-medium text-zinc-500 flex flex-wrap justify-center items-center gap-1.5 order-2 md:order-3">
              Made By <span className="text-zinc-300 mx-0.5">Gautam Jha</span> with <span className="text-red-500 animate-pulse">❤️</span> <span className="hidden sm:inline">for creators everywhere</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
