import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
    return (
        <div className="mx-auto max-w-4xl py-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="mt-1 text-gray-500">Manage your account, security, and connected devices.</p>
            </div>

            {/* Clerk's full-featured profile UI */}
            <UserProfile
                appearance={{
                    variables: {
                        colorPrimary: "#7c3aed",
                        borderRadius: "0.875rem",
                        fontFamily: "inherit",
                    },
                    elements: {
                        rootBox: "w-full",
                        card: "shadow-sm border border-gray-100 rounded-2xl",
                        navbar: "border-r border-gray-100",
                        navbarButton: "text-gray-600 hover:text-purple-700",
                        navbarButtonIcon: "text-gray-400",
                    },
                }}
            />
        </div>
    );
}
