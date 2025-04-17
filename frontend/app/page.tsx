'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-xl w-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">📄 Document Hub</h1>
        <p className="text-gray-600 text-lg mb-8">
          Upload, search, and manage your documents with ease.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/upload')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-md transition"
          >
            Upload Document
          </button>
          <button
            onClick={() => router.push('/search')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-md transition"
          >
            Search Documents
          </button>
        </div>
      </div>
    </div>
  );
}
