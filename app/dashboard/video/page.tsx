import { getVideos } from "@/actions/video";
import VideoGrid from "./_components/VideoGrid";

export const dynamic = "force-dynamic";

export default async function VideoPage() {
    const { success, data } = await getVideos();
    const videoList = success && data ? data : [];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Your Videos</h1>
                <p className="mt-1 text-gray-500">
                    Manage and view all your generated video assets.
                </p>
            </div>

            {videoList.length > 0 ? (
                <VideoGrid videos={videoList} />
            ) : (
                <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                        <svg
                            className="h-7 w-7 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        No videos generated yet
                    </h3>
                    <p className="mb-6 max-w-sm text-sm text-gray-500">
                        Go to your series and generate a new video to see it here.
                    </p>
                </div>
            )}
        </div>
    );
}
