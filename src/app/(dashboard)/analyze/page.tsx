'use client';
import { useState } from 'react';

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Code Interpreter & File Analysis</h1>
      <div className="border p-4 rounded bg-gray-50">
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button className="bg-blue-500 text-white p-2 rounded mt-2">Analyze File</button>
      </div>
      <div className="mt-4 border p-4 rounded">
        <h2 className="font-semibold">Results (Simulation)</h2>
        <p>Upload a file to see analytical results here.</p>
      </div>
    </div>
  );
}
