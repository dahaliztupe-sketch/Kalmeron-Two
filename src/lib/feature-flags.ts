/**
 * Feature Flags — نظام إدارة الميزات بنمط Vercel Flags / LaunchDarkly.
 *
 * يستخدم `@vercel/flags` كواجهة موحدة، مع دعم:
 * - Edge / Node runtime
 * - تقييم على أساس المستخدم (userId, plan, country)
 * - Override عبر cookie لاختبار QA
 * - Fallback ثابت في التطوير
 *
 * مثال الاستخدام:
 *   import { showAdvancedAgents } from "@/src/lib/feature-flags";
 *   if (await showAdvancedAgents()) { ... }
 */

import { flag } from "@vercel/flags/next";

export interface FeatureFlagContext {
  userId?: string;
  plan?: "free" | "pro" | "enterprise";
  country?: string;
  email?: string;
}

/**
 * featureFlag — تعريف feature flag جديد. يحفظ التعريف في مكان واحد
 * ويتيح تقييمه من أي مكون (server / client / edge).
 */
function featureFlag<T = boolean>(opts: {
  key: string;
  defaultValue: T;
  description?: string;
  decide?: (ctx: FeatureFlagContext) => T | Promise<T>;
}) {
  return flag<T>({
    key: opts.key,
    description: opts.description,
    defaultValue: opts.defaultValue,
    decide: async ({ headers, cookies }) => {
      const override = cookies.get(`flag_${opts.key}`)?.value;
      if (override === "on") return true as unknown as T;
      if (override === "off") return false as unknown as T;

      const ctx: FeatureFlagContext = {
        userId: headers.get("x-kalmeron-user-id") || undefined,
        plan: (headers.get("x-kalmeron-plan") as FeatureFlagContext["plan"]) || "free",
        country: headers.get("x-kalmeron-country") || undefined,
      };
      if (opts.decide) {
        try {
          return await opts.decide(ctx);
        } catch {
          return opts.defaultValue;
        }
      }
      return opts.defaultValue;
    },
  });
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
