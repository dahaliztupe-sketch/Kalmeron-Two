"use client";
import { useEffect, useState } from "react";

export default function VirtualOfficePage() {
  const [vms, setVms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentId, setAgentId] = useState("");
  const [departmentId, setDepartmentId] = useState("general");

  async function load() {
    setLoading(true);
    const r = await fetch("/api/virtual-office");
    const j = await r.json();
    setVms(j.vms || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function provision() {
    if (!agentId) return;
    await fetch("/api/virtual-office", {
      method: "POST",
      body: JSON.stringify({ action: "provision", agentId, departmentId }),
    });
    setAgentId("");
    await load();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">المكتب الرقمي</h1>
      <p className="text-sm text-gray-500 mb-6">أجهزة افتراضية آمنة للوكلاء</p>

      <div className="border rounded-lg p-4 mb-6 bg-white dark:bg-gray-900">
        <div className="font-semibold mb-2">إنشاء جهاز جديد</div>
        <div className="flex gap-2">
          <input
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            placeholder="معرف الوكيل"
            className="flex-1 border rounded px-3 py-2"
          />
          <input
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            placeholder="القسم"
            className="w-48 border rounded px-3 py-2"
          />
          <button onClick={provision} className="px-4 py-2 rounded bg-black text-white">
            إنشاء VM
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">جارٍ التحميل...</div>
      ) : vms.length === 0 ? (
        <div className="p-8 text-center text-gray-500">لا توجد أجهزة بعد.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vms.map((v) => (
            <div key={v.id} className="border rounded-lg p-4 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{v.agentId}</div>
                <span className={`text-xs px-2 py-1 rounded ${
                  v.status === "running" ? "bg-green-100 text-green-700" :
                  v.status === "error" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-600"
                }`}>{v.status}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">قسم: {v.departmentId} · مزود: {v.provider}</div>
              {v.providerSandboxId && (
                <div className="text-xs font-mono mt-2 text-gray-600 truncate">{v.providerSandboxId}</div>
              )}
              {v.lastError && <div className="text-xs text-red-600 mt-2">{v.lastError}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
