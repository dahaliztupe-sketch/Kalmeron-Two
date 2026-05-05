"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, FileText, Trash2, Loader2 } from "lucide-react";

interface DocItem {
  documentId: string;
  documentName: string;
  chunks: number;
  source: string;
}

export function DocumentUploader({ title = "مكتبة المستندات" }: { title?: string }) {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const r = await fetch("/api/rag/documents", { headers: { Authorization: `Bearer ${token}` } });
      const j = await r.json();
      if (r.ok) setDocs(j.documents || []);
    } catch (e: unknown) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    async function run() {
      try {
        const token = await user!.getIdToken();
        const r = await fetch("/api/rag/documents", { headers: { Authorization: `Bearer ${token}` } });
        const j = await r.json();
        if (mounted && r.ok) setDocs(j.documents || []);
      } catch { /* silent */ } finally {
        if (mounted) setLoading(false);
      }
    }
    void run();
    return () => { mounted = false; };
  }, [user]);

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const token = await user.getIdToken();
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/rag/ingest", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "فشل الرفع");
      toast.success(`تم رفع "${file.name}" (${j.chunks} مقطع).`);
      await refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!user) return;
    if (!confirm("حذف هذا المستند نهائياً؟")) return;
    try {
      const token = await user.getIdToken();
      const r = await fetch(`/api/rag/documents?documentId=${encodeURIComponent(documentId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error((await r.json()).error || "فشل الحذف");
      setDocs(d => d.filter(x => x.documentId !== documentId));
      toast.success("تم الحذف.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الحذف");
    }
  };

  return (
    <Card className="bg-dark-surface/60 border-white/10">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-blue" />
          {title}
        </CardTitle>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || !user}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <Upload className="w-4 h-4 ml-1" />}
          رفع PDF / CSV / Excel
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.csv,.xlsx,.xls,.txt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
          }}
        />
      </CardHeader>
      <CardContent>
        {!user ? (
          <p className="text-sm text-text-secondary">سجّل دخولك لرفع المستندات.</p>
        ) : loading ? (
          <p className="text-sm text-text-secondary">جاري التحميل...</p>
        ) : docs.length === 0 ? (
          <p className="text-sm text-text-secondary">
            لم ترفع أي مستند بعد. ارفع كشف حسابك أو ميزانيتك ليقرأها الذكاء الاصطناعي ويستشهد بها.
          </p>
        ) : (
          <ul className="space-y-2">
            {docs.map((d) => (
              <li
                key={d.documentId}
                className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{d.documentName}</p>
                  <p className="text-xs text-text-secondary">
                    {d.source.toUpperCase()} · {d.chunks} مقطع
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-rose-300 hover:text-rose-400"
                  onClick={() => handleDelete(d.documentId)}
                  aria-label="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
