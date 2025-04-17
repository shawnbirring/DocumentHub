'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@supabase/supabase-js';
import NavButtons from '@/app/components/NavButtons';

import { extractKeywords } from '@/lib/keyword';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UploadPage() {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length) {
            setFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
    });

    const handleUpload = async () => {
        if (!file || !title) return alert('All fields required');
        setIsUploading(true);

        const fileExt = file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

        if (uploadErr) {
            alert(`Upload failed: ${uploadErr.message}`);
            setIsUploading(false);
            return;
        }

        const { data: docData, error: docErr } = await supabase
            .from('documents')
            .insert({ title, file_url: uploadData.path })
            .select()
            .single();

        if (docErr) {
            alert(`DB error: ${docErr.message}`);
            setIsUploading(false);
            return;
        }

        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/extract-pdf', {
            method: 'POST',
            body: formData,
        })
        if (!res.ok) {
            const err = await res.json()
            return alert('Upload failed: ' + err.error)
        }

        const { text } = await res.json()

        const keywords = extractKeywords(text)

        const keywordInserts = keywords.map(k => ({
            document_id: docData.id,
            keyword: k.keyword,
            frequency: k.frequency
        }));

        const { error: keywordErr } = await supabase
            .from('keywords')
            .insert(keywordInserts);

        if (keywordErr) {
            alert(`Keyword insert error: ${keywordErr.message}`);
        } else {
            alert('Upload successful!');
            setTitle('');
            setFile(null);
        }

        setIsUploading(false);
    };


    return (
        <div className="max-w-xl mx-auto p-6 mt-10 bg-white rounded-2xl shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Upload Document</h1>

            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
                    }`}
            >
                <input {...getInputProps()} />
                {file ? (
                    <p className="text-gray-700 font-medium">Selected: {file.name}</p>
                ) : isDragActive ? (
                    <p className="text-blue-500 font-medium">Drop the file here ...</p>
                ) : (
                    <p className="text-gray-500">Drag and drop a file here, or click to select a file</p>
                )}
            </div>

            <input
                type="text"
                placeholder="Document title"
                className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <button
                onClick={handleUpload}
                className={`mt-6 w-full py-2 px-4 rounded-md text-white font-semibold ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                disabled={isUploading}
            >
                {isUploading ? 'Uploading...' : 'Upload'}
            </button>
            <NavButtons nextLabel="Search Documents" nextHref="/search" />
        </div>
    );
}
