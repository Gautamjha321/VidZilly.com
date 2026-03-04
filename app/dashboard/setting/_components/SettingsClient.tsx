"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Youtube, Instagram, Video as TikTok, AlertTriangle, Link as LinkIcon, Unlink, LogOut } from "lucide-react";
import { savePlatformConnection, deletePlatformConnection, deleteUserAccount } from "@/actions/connections";

interface ConnectionRecord {
    id: string;
    platform: string;
    channel_name: string;
    connected_at: string;
}

interface SettingsClientProps {
    initialConnections: ConnectionRecord[];
    userEmail: string;
}

const PLATFORMS = [
    {
        id: "youtube",
        name: "YouTube",
        icon: Youtube,
        color: "text-red-500",
        bg: "bg-red-50",
        borderColor: "border-red-100",
        docUrl: "/api/auth/youtube",
    },
    {
        id: "instagram",
        name: "Instagram",
        icon: Instagram,
        color: "text-pink-600",
        bg: "bg-pink-50",
        borderColor: "border-pink-100",
        docUrl: "/api/auth/instagram",
    },
    {
        id: "tiktok",
        name: "TikTok",
        icon: TikTok,
        color: "text-black",
        bg: "bg-gray-100",
        borderColor: "border-gray-200",
        docUrl: "/api/auth/tiktok",
    },
];

export default function SettingsClient({ initialConnections, userEmail }: SettingsClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signOut } = useAuth();

    // Track connections state locally for immediate UI updates
    const [connections, setConnections] = useState<ConnectionRecord[]>(initialConnections);
    const [isSimulating, setIsSimulating] = useState<string | null>(null);

    // Modal state
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<typeof PLATFORMS[0] | null>(null);

    // Disconnect Modal state
    const [disconnectPlatform, setDisconnectPlatform] = useState<string | null>(null);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    // Delete Account Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    useEffect(() => {
        const success = searchParams.get("success");
        const error = searchParams.get("error");

        if (success === "youtube_connected") {
            // Give Next.js a moment to revalidate Server Component data, or just show alert
            alert("✅ YouTube Channel connected successfully!");
            router.replace("/dashboard/setting");
        } else if (success === "instagram_connected") {
            alert("✅ Instagram Account connected successfully!");
            router.replace("/dashboard/setting");
        } else if (error) {
            alert(`❌ Failed to connect: ${error}`);
            router.replace("/dashboard/setting");
        }
    }, [searchParams, router]);

    const handleConnectClick = (platform: typeof PLATFORMS[0]) => {
        if (platform.id === "youtube" || platform.id === "instagram") {
            // Direct to real OAuth flow
            window.location.assign(platform.docUrl);
            return;
        }
        setSelectedPlatform(platform);
        setInfoModalOpen(true);
    };

    const handleSimulateConnection = async () => {
        if (!selectedPlatform) return;

        setIsSimulating(selectedPlatform.id);
        const res = await savePlatformConnection(selectedPlatform.id, `${selectedPlatform.name} Test Channel`);

        if (res.success) {
            // Optimistic update
            setConnections(prev => {
                const filtered = prev.filter(c => c.platform !== selectedPlatform.id);
                return [...filtered, {
                    id: "temp_" + Date.now(),
                    platform: selectedPlatform.id,
                    channel_name: `${selectedPlatform.name} Test Channel`,
                    connected_at: new Date().toISOString()
                }];
            });
            setInfoModalOpen(false);
        } else {
            alert("Failed to connect: " + res.error);
        }
        setIsSimulating(null);
    };

    const handleDisconnect = async (platformId: string) => {
        setIsDisconnecting(true);
        const res = await deletePlatformConnection(platformId);
        if (res.success) {
            setConnections(prev => prev.filter(c => c.platform !== platformId));
        } else {
            alert("Failed to disconnect: " + res.error);
        }
        setIsDisconnecting(false);
        setDisconnectPlatform(null);
    };

    const handleDeleteAccount = async () => {
        setIsDeletingAccount(true);
        const res = await deleteUserAccount();

        if (res.success) {
            signOut(() => router.push("/"));
        } else {
            alert("Failed to delete account: " + res.error);
            setIsDeletingAccount(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">

            {/* Connected Accounts Section */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-5">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-gray-500" />
                        Connected Accounts
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Connect your social media accounts to enable powerful automated publishing directly from VidZilly.
                    </p>
                </div>

                <div className="divide-y divide-gray-100">
                    {PLATFORMS.map((platform) => {
                        const Icon = platform.icon;
                        const connection = connections.find(c => c.platform === platform.id);
                        const isConnected = !!connection;

                        return (
                            <div key={platform.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5">
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${platform.borderColor} ${platform.bg}`}>
                                        <Icon className={`h-6 w-6 ${platform.color}`} />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-semibold text-gray-900">{platform.name}</h4>
                                        {isConnected ? (
                                            <div className="mt-0.5 flex items-center gap-2">
                                                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                                <span className="text-sm font-medium text-emerald-700">Connected as {connection.channel_name}</span>
                                            </div>
                                        ) : (
                                            <p className="mt-0.5 text-sm text-gray-500">Not connected</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex shrink-0">
                                    {isConnected ? (
                                        <button
                                            onClick={() => setDisconnectPlatform(platform.id)}
                                            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                        >
                                            <Unlink className="h-4 w-4" />
                                            Disconnect
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleConnectClick(platform)}
                                            className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
                                        >
                                            <LinkIcon className="h-4 w-4" />
                                            Connect
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Danger Zone Section */}
            <div className="rounded-2xl border-2 border-red-100 bg-white shadow-sm overflow-hidden mt-12 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div className="px-6 py-5 border-b border-red-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Danger Zone
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Permanently delete your account and all associated data, series, videos, and settings.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
                    >
                        <LogOut className="h-4 w-4" />
                        Delete Account
                    </button>
                </div>
            </div>

            {/* OAuth Info / Simulation Modal */}
            {infoModalOpen && selectedPlatform && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className={`h-2 w-full ${selectedPlatform.bg.replace('50', '500')}`}></div>
                        <div className="p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${selectedPlatform.borderColor} ${selectedPlatform.bg}`}>
                                    <selectedPlatform.icon className={`h-5 w-5 ${selectedPlatform.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Connect {selectedPlatform.name}</h3>
                            </div>

                            <div className="space-y-4 text-sm text-gray-600">
                                <div className="rounded-lg bg-blue-50 p-4 border border-blue-100 text-blue-800">
                                    <p className="font-semibold mb-1 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" /> Development Mode
                                    </p>
                                    <p>
                                        Real OAuth integration requires registering developer apps on {selectedPlatform.name} to get API credentials (Client ID/Secret).
                                    </p>
                                </div>

                                <p>
                                    In production, clicking connect would redirect the user to the official <strong>{selectedPlatform.name} Authorization Screen</strong> via <a href={selectedPlatform.docUrl} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">{selectedPlatform.docUrl}</a>.
                                </p>

                                <p>
                                    For now, you can simulate a successful OAuth connection to test the UI and database flow.
                                </p>
                            </div>

                            <div className="mt-8 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setInfoModalOpen(false)}
                                    className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSimulateConnection}
                                    disabled={isSimulating === selectedPlatform.id}
                                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition ${isSimulating === selectedPlatform.id ? 'opacity-70' : 'hover:opacity-90'}`}
                                    style={{ backgroundColor: selectedPlatform.id === 'instagram' ? '#e1306c' : selectedPlatform.id === 'youtube' ? '#ef4444' : '#000000' }}
                                >
                                    {isSimulating === selectedPlatform.id ? "Connecting..." : "Simulate Connect"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Disconnect Account Confirmation Modal */}
            {disconnectPlatform && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="border-b border-gray-100 flex items-center gap-3 bg-red-50/50 p-6">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 border border-red-200">
                                <Unlink className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 capitalize">Disconnect {disconnectPlatform}</h3>
                                <p className="text-sm text-gray-500">Revoke access and automation.</p>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-8">
                                Are you sure you want to disconnect your <strong>{disconnectPlatform}</strong> account? VidZilly will no longer be able to automatically publish videos to this channel.
                            </p>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setDisconnectPlatform(null)}
                                    disabled={isDisconnecting}
                                    className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition whitespace-nowrap"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDisconnect(disconnectPlatform)}
                                    disabled={isDisconnecting}
                                    className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"
                                >
                                    {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="border-b border-gray-100 flex items-center gap-3 bg-red-50/50 p-6">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 border border-red-200">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Delete Account</h3>
                                <p className="text-sm text-gray-500">This action is permanent and irreversible.</p>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4 text-sm text-gray-600 mb-6">
                                <p>You are about to permanently delete your VidZilly account.</p>
                                <ul className="list-disc pl-5 space-y-2 text-red-700 font-medium bg-red-50/50 p-4 rounded-xl border border-red-100">
                                    <li>All of your generated videos and downloaded assets will be destroyed.</li>
                                    <li>Your automated series scheduling will be immediately cancelled.</li>
                                    <li>Your active subscription and billing records will be wiped.</li>
                                </ul>
                                <p>
                                    To confirm deletion, please type <span className="font-semibold text-gray-900">{userEmail}</span> below:
                                </p>
                            </div>

                            <input
                                type="text"
                                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 transition-all font-mono"
                                placeholder={userEmail}
                                value={deleteConfirmationText}
                                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                disabled={isDeletingAccount}
                            />

                            <div className="mt-8 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setDeleteConfirmationText("");
                                    }}
                                    disabled={isDeletingAccount}
                                    className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition whitespace-nowrap"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmationText !== userEmail || isDeletingAccount}
                                    className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"
                                >
                                    {isDeletingAccount ? "Deleting..." : "Permanently Delete Account"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
