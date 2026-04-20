'use client';
export default function AdminSandboxesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sandbox Monitoring Dashboard</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Sandbox ID</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">CPU/RAM</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">sb_123</td>
            <td className="border p-2 text-green-600">Active</td>
            <td className="border p-2">12% / 256MB</td>
            <td className="border p-2"><button className="text-red-500">Stop</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
