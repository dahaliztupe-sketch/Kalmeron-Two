"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Workspace {
  id: string;
  name: string;
  ownerUid: string;
}

const STORAGE_KEY = "kalmeron.activeWorkspaceId";

export function WorkspaceSwitcher() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const r = await fetch("/api/workspaces", { headers: { Authorization: `Bearer ${token}` } });
        const j = await r.json();
        if (r.ok && Array.isArray(j.workspaces)) {
          setWorkspaces(j.workspaces);
          const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
          const valid = stored && j.workspaces.some((w: Workspace) => w.id === stored);
          setActiveId(valid ? stored : j.workspaces[0]?.id || null);
        }
      } catch {
        /* silent */
      }
    };
    run();
  }, [user]);

  const setActive = (id: string) => {
    setActiveId(id);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, id);
  };

  if (!user || workspaces.length === 0) return null;

  const active = workspaces.find((w) => w.id === activeId) || workspaces[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={(p: any) => (
        <button {...p} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white transition-colors">
          <Building2 className="w-4 h-4 text-brand-gold" />
          <span className="flex-1 text-right truncate">{active?.name || "—"}</span>
          <ChevronsUpDown className="w-3.5 h-3.5 text-neutral-400" />
        </button>
      )} />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>مساحات العمل</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((w) => (
          <DropdownMenuItem key={w.id} onClick={() => setActive(w.id)} className={w.id === activeId ? "font-semibold" : ""}>
            {w.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
