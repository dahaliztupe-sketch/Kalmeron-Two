/**
 * Feature Flags — نظام إدارة الميزات.
 *
 * Standalone implementation (no external flag SDK required).
 * Supports:
 * - Edge / Node runtime
 * - User-level evaluation (userId, plan, country)
 * - Cookie-based override for QA testing (`flag_<key>=on|off`)
 * - Static fallback in development
 */

export interface FeatureFlagContext {
  userId?: string;
  plan?: "free" | "pro" | "enterprise";
  country?: string;
  email?: string;
}

interface FlagOptions<T> {
  key: string;
  defaultValue: T;
  description?: string;
  decide?: (ctx: FeatureFlagContext) => T | Promise<T>;
}

interface RequestLike {
  headers: { get(name: string): string | null };
  cookies: { get(name: string): { value: string } | undefined };
}

/**
 * featureFlag — defines a feature flag. Returns an async function that
 * evaluates the flag given the current request context.
 */
function featureFlag<T = boolean>(opts: FlagOptions<T>) {
  return async (req?: RequestLike): Promise<T> => {
    if (req) {
      const override = req.cookies.get(`flag_${opts.key}`)?.value;
      if (override === "on") return true as unknown as T;
      if (override === "off") return false as unknown as T;

      const ctx: FeatureFlagContext = {
        userId: req.headers.get("x-kalmeron-user-id") || undefined,
        plan: (req.headers.get("x-kalmeron-plan") as FeatureFlagContext["plan"]) || "free",
        country: req.headers.get("x-kalmeron-country") || undefined,
      };
      if (opts.decide) {
        try { return await opts.decide(ctx); } catch { /* fall through */ }
      }
    }
    return opts.defaultValue;
  };
}

// === Flags المعرّفة ===

export const showAdvancedAgents = featureFlag({
  key: "advanced_agents",
  description: "إظهار وكلاء متقدمين (CFO، Legal، Real Estate) للمستخدم",
  defaultValue: false,
  decide: (ctx) => ctx.plan === "pro" || ctx.plan === "enterprise",
});

export const enableVoiceInput = featureFlag({
  key: "voice_input",
  description: "تفعيل إدخال صوتي عربي عبر Web Speech API",
  defaultValue: true,
});

export const enableInfiniteHistory = featureFlag({
  key: "infinite_history",
  description: "تحميل تاريخ المحادثات بنمط infinite scroll",
  defaultValue: true,
});

export const enableMfaEnforcement = featureFlag({
  key: "mfa_enforcement",
  description: "إلزام MFA على حسابات Enterprise",
  defaultValue: false,
  decide: (ctx) => ctx.plan === "enterprise",
});

export const enableNewLandingFlow = featureFlag({
  key: "new_landing_flow",
  description: "تجربة الانتقال الجديدة من landing إلى chat (مثل Claude/ChatGPT)",
  defaultValue: true,
});

export const enableUsageDashboard = featureFlag({
  key: "usage_dashboard",
  description: "إظهار لوحة الاستخدام التفصيلية (مثل OpenAI)",
  defaultValue: true,
});

export const FLAGS = {
  showAdvancedAgents,
  enableVoiceInput,
  enableInfiniteHistory,
  enableMfaEnforcement,
  enableNewLandingFlow,
  enableUsageDashboard,
};

export default FLAGS;
