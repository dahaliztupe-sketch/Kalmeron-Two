"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  loadRunwaySnapshot,
  saveRunwaySnapshot,
  dismissRunwayAlarm,
} from "@/src/lib/runway/storage";
import {
  buildRecommendations,
  computeRunway,
  DEFAULT_THRESHOLD_MONTHS,
} from "@/src/lib/runway/calc";
import type {
  RunwayInputs,
  RunwayRecommendation,
  RunwayResult,
  RunwaySnapshot,
} from "@/src/lib/runway/types";

const LOCAL_KEY = "kalmeron:runway:v1";

function readLocal(): Partial<RunwayInputs> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Partial<RunwayInputs>) : null;
  } catch {
    return null;
  }
}

function writeLocal(inputs: RunwayInputs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(inputs));
  } catch {
    /* quota / private mode — non-fatal */
  }
}

export interface UseRunwaySnapshotResult {
  inputs: RunwayInputs;
  result: RunwayResult;
  recommendations: RunwayRecommendation[];
  loading: boolean;
  saving: boolean;
  hasSnapshot: boolean;
  /** Banner is suppressed until this date (ISO). */
  dismissedUntil?: string;
  shouldAlarm: boolean;
  setInputs: (patch: Partial<RunwayInputs>) => void;
  save: () => Promise<void>;
  dismiss: (days?: number) => Promise<void>;
}

const ZERO_INPUTS: RunwayInputs = {
  cashEgp: 0,
  monthlyIncomeEgp: 0,
  monthlyBurnEgp: 0,
  thresholdMonths: DEFAULT_THRESHOLD_MONTHS,
};

function readInitialInputs(): RunwayInputs {
  const local = readLocal();
  if (!local) return ZERO_INPUTS;
  return { ...ZERO_INPUTS, ...local };
}

export function useRunwaySnapshot(): UseRunwaySnapshotResult {
  const { user } = useAuth();
  // Lazy initializer so localStorage is read once on first render — avoids
  // setState-in-effect cascades (react-hooks/set-state-in-effect).
  const [inputs, setInputsState] = useState<RunwayInputs>(readInitialInputs);
  const [snapshot, setSnapshot] = useState<RunwaySnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [now, setNow] = useState<number>(() => Date.now());

  // Pull the persisted snapshot once we know the user.
  useEffect(() => {
    let cancelled = false;
    async function pull() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      const remote = await loadRunwaySnapshot(user.uid);
      if (cancelled) return;
      if (remote) {
        setSnapshot(remote);
        setInputsState({
          cashEgp: remote.cashEgp,
          monthlyIncomeEgp: remote.monthlyIncomeEgp,
          monthlyBurnEgp: remote.monthlyBurnEgp,
          thresholdMonths: remote.thresholdMonths,
        });
      }
      setLoading(false);
    }
    void pull();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const setInputs = useCallback((patch: Partial<RunwayInputs>) => {
    setInputsState((prev) => {
      const next = { ...prev, ...patch };
      writeLocal(next);
      return next;
    });
  }, []);

  const save = useCallback(async () => {
    if (!user) {
      writeLocal(inputs);
      return;
    }
    setSaving(true);
    try {
      const saved = await saveRunwaySnapshot(user.uid, inputs);
      if (saved) setSnapshot(saved);
      writeLocal(inputs);
    } finally {
      setSaving(false);
    }
  }, [user, inputs]);

  const dismiss = useCallback(
    async (days: number = 7) => {
      if (!user) return;
      await dismissRunwayAlarm(user.uid, days);
      const until = new Date(Date.now() + days * 86_400_000).toISOString();
      setSnapshot((prev) => (prev ? { ...prev, dismissedUntil: until } : prev));
    },
    [user],
  );

  const result = useMemo(() => computeRunway(inputs), [inputs]);
  const recommendations = useMemo(
    () => buildRecommendations(inputs, result),
    [inputs, result],
  );

  // Refresh `now` once per minute so dismissals expire without manual reload.
  // Using state (instead of calling Date.now() during render) keeps the hook
  // pure for React Compiler.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const dismissedUntil = snapshot?.dismissedUntil;
  const stillDismissed = dismissedUntil
    ? new Date(dismissedUntil).getTime() > now
    : false;
  const shouldAlarm = result.belowThreshold && !stillDismissed;

  return {
    inputs,
    result,
    recommendations,
    loading,
    saving,
    hasSnapshot: !!snapshot,
    dismissedUntil,
    shouldAlarm,
    setInputs,
    save,
    dismiss,
  };
}
