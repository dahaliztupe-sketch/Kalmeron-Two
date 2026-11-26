/**
 * Role knowledge base. The model does not know live news, so every item is a
 * claim distilled by a human or agent from a dated source, with a review date.
 * Stale or unverified items are flagged and never presented as current.
 */
export type KnowledgeStatus = "verified_primary" | "secondary" | "unverified";

export interface KnowledgeItem {
  id: string;
  /** The practice, one sentence, in Arabic. */
  ruleAr: string;
  sourceUrl: string;
  sourceTitle: string;
  /** Publication date of the source (YYYY-MM-DD) or null if the page shows none. */
  sourceDate: string | null;
  /** When someone last read the source and checked the claim. */
  reviewedOn: string;
  status: KnowledgeStatus;
}

export interface RoleKnowledge {
  roleId: string;
  /** Items older than this many days since reviewedOn count as stale. */
  maxAgeDays: number;
  items: KnowledgeItem[];
  /** Step-by-step workflow the role follows, in Arabic. */
  workflowAr: string[];
}

export function staleItems(k: RoleKnowledge, today: Date): KnowledgeItem[] {
  return k.items.filter((i) => {
    const age = (today.getTime() - new Date(i.reviewedOn).getTime()) / 86400000;
    return !(age <= k.maxAgeDays) || i.status === "unverified";
  });
}

/** Prompt block. Stale or unverified items are labelled, never hidden or promoted. */
export function knowledgePrompt(k: RoleKnowledge, today: Date): string {
  const stale = new Set(staleItems(k, today).map((i) => i.id));
  const rules = k.items
    .map((i) => `- ${i.ruleAr} [المصدر: ${i.sourceTitle}، ${i.sourceDate ?? "بلا تاريخ"}، روجع ${i.reviewedOn}${stale.has(i.id) ? "، قديم أو غير مؤكد" : ""}]`)
    .join("\n");
  const flow = k.workflowAr.map((s, n) => `${n + 1}. ${s}`).join("\n");
  return `معرفة الدور (مستخلصة من مصادر مؤرخة، وليست أخباراً حية. لا تدّعِ معرفة بما بعد تواريخها):\n${rules}\n\nخطوات العمل:\n${flow}`;
}
