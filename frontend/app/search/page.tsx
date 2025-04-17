'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Fuse from 'fuse.js';
import NavButtons from '@/app/components/NavButtons'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [allDocs, setAllDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fuse = new Fuse(allDocs, {
        keys: ['title'],
        threshold: 0.3,
    });

    const handleSearch = async () => {
        setLoading(true);

        const { data: docMatches } = await supabase
            .from('documents')
            .select('*')
            .textSearch('search_vector', query);

        const { data: keywordMatches } = await supabase
            .from('keywords')
            .select('document_id')
            .ilike('keyword', `%${query}%`);

        const keywordDocIds = keywordMatches?.map((k) => k.document_id) || [];

        const allIds = new Set([
            ...(docMatches?.map((doc) => doc.id) || []),
            ...keywordDocIds,
        ]);

        const { data: combinedDocs } = await supabase
            .from('documents')
            .select('*')
            .in('id', Array.from(allIds));

        const fuseFallback = fuse.search(query).map((r) => r.item);

        const merged = [
            ...combinedDocs!,
            ...fuseFallback.filter((d) => !allIds.has(d.id)),
        ];

        setResults(merged);
        setLoading(false);
    };

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase.from('documents').select('*');
            setAllDocs(data || []);
        };
        load();
    }, []);

    return (
        <div className="max-w-3xl mx-auto p-6 mt-10 bg-white rounded-2xl shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Search Documents</h1>

            <div className="flex gap-2 flex-col sm:flex-row">
                <input
                    className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                    placeholder="Search by title or keyword..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button
                    className={`px-6 py-2 text-white rounded-md font-semibold ${loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    onClick={handleSearch}
                    disabled={loading}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            <ul className="mt-8 space-y-4">
                {results.length === 0 && !loading && (
                    <p className="text-center text-gray-500 italic">No results found</p>
                )}
                {results.map((doc) => (
                    <li
                        key={doc.id}
                        className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm transition hover:shadow-md"
                    >
                        <h2 className="text-lg font-semibold text-gray-800">{doc.title}</h2>
                        <p className="text-sm text-gray-500">
                            Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                        <a
                            href={`https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
                                'https://',
                                ''
                            )}/storage/v1/object/public/documents/${doc.file_url}`}
                            className="inline-block mt-2 text-blue-600 font-medium hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View Document
                        </a>
                    </li>
                ))}
            </ul>
            <NavButtons nextLabel="Upload Document" nextHref="/upload" />
        </div>
    );
}
