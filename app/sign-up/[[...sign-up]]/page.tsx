import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="relative flex min-h-screen items-center justify-center bg-[#09090b] px-4">
            {/* Background effects */}
            <div className="pointer-events-none absolute top-20 right-1/4 h-72 w-72 rounded-full bg-purple-600/15 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-20 left-1/4 h-72 w-72 rounded-full bg-cyan-500/15 blur-[120px]" />

            <div className="relative z-10">
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            cardBox: "shadow-2xl shadow-purple-500/10",
                        },
                    }}
                />
            </div>
        </div>
    );
}
