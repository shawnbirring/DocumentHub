'use client';

import { useRouter } from 'next/navigation';

interface PageNavProps {
    nextLabel: string;
    nextHref: string;
}

export default function NavButtons({ nextLabel, nextHref }: PageNavProps) {
    const router = useRouter();

    return (
        <div className="flex gap-4 mt-6">
            <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition"
            >
                🏠 Home
            </button>
            <button
                onClick={() => router.push(nextHref)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
            >
                {nextLabel}
            </button>
        </div>
    );
}
