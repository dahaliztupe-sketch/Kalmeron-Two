"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export function WelcomeToast() {
  useEffect(() => {
    try {
      // Clear completing guard — we've arrived at a protected page.
      sessionStorage.removeItem("kalmeron_onboarding_completing");

      const flag = sessionStorage.getItem("kalmeron_just_onboarded");
      if (flag === "1") {
        sessionStorage.removeItem("kalmeron_just_onboarded");
        setTimeout(() => {
          toast.success("أهلاً بك في كلميرون! 🎉", {
            description: "فريقك الذكي جاهز — ابدأ بأول محادثة الآن",
            duration: 5000,
            icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
          });
        }, 600);
      }
    } catch {}
  }, []);

  return null;
}
