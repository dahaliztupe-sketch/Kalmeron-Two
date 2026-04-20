// @ts-nocheck
'use client';

export default function DigitalTwinPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Startup Digital Twin</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <h2 className="font-semibold">Company Profile</h2>
          {/* Placeholder for Profile Data */}
          <p>Loading startup profile...</p>
        </div>
        <div className="border p-4 rounded">
          <h2 className="font-semibold">Knowledge Graph</h2>
          {/* Placeholder for Force Graph */}
          <div className="h-64 bg-gray-100 flex items-center justify-center">Graph Visualization Placeholder</div>
        </div>
      </div>
      <div className="mt-4 border p-4 rounded">
        <h2 className="font-semibold">Contextual Insight</h2>
        <p>Active challenges and milestones...</p>
      </div>
    </div>
  );
}
