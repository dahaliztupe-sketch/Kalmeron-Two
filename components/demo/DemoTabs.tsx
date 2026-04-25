"use client";

import { useState } from "react";
import { ScenarioPlayer } from "./ScenarioPlayer";
import type { DemoScenario } from "@/app/demo/scenarios";
import { cn } from "@/src/lib/utils";

interface Props {
  scenarios: DemoScenario[];
}

export function DemoTabs({ scenarios }: Props) {
  const [activeId, setActiveId] = useState<string>(scenarios[0]?.id ?? "");
  const active = scenarios.find((s) => s.id === activeId) ?? scenarios[0];

  return (
    <div>
      {/* Tab strip */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center" dir="rtl">
        {scenarios.map((s) => {
          const isActive = s.id === activeId;
          return (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={cn(
                "px-4 py-2.5 rounded-2xl text-sm font-bold transition border",
                isActive
                  ? "bg-white text-black border-white shadow-lg shadow-white/10"
                  : "bg-white/[0.03] text-white/80 border-white/10 hover:border-white/20 hover:text-white",
              )}
            >
              <span className="mr-1">{s.emoji}</span>
              {s.titleAr}
            </button>
          );
        })}
      </div>

      {active && <ScenarioPlayer key={active.id} scenario={active} />}
    </div>
  );
}
