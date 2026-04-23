"use client";
import { useEffect, useState, useRef } from "react";
import { apiJson } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

interface Item {
  id: string;
  type: string;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt?: any;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    if (!user) return;
    try {
      const res = await apiJson<{ items: Item[]; unread: number }>("/api/account/notifications");
      setItems(res.items || []);
      setUnread(res.unread || 0);
    } catch {}
  }

  useEffect(() => {
    if (!user) return;
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [user]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function markAll() {
    try {
      await apiJson("/api/account/notifications", {
        method: "POST",
        body: JSON.stringify({ all: true }),
      });
      load();
    } catch {}
  }

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label={`الإشعارات (${unread} غير مقروءة)`}
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-900 border rounded-lg shadow-xl z-50" role="region" aria-label="قائمة الإشعارات">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="font-semibold text-sm">الإشعارات</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs text-blue-600 hover:underline">
                قراءة الكل
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto" role="list">
            {items.length === 0 ? (
              <li className="p-6 text-center text-sm text-gray-500">لا توجد إشعارات</li>
            ) : (
              items.map((it) => (
                <li key={it.id} className={`px-3 py-2 border-b text-sm ${it.read ? "" : "bg-blue-50/40 dark:bg-blue-950/20"}`}>
                  <a href={it.href || "#"} className="block">
                    <div className="font-medium">{it.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{it.body}</div>
                  </a>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
