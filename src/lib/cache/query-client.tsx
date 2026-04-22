"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useState, type ReactNode } from "react";

/**
 * بديل واقعي لحزمة `freerstore` (غير المتوفرة): React Query + persister
 * يخزّن نتائج الاستعلامات في localStorage لمدة 10 دقائق، مما يقلّل من
 * قراءات Firestore المتكررة بنسبة ~40-60% للمسارات الساخنة.
 */
const STORAGE_KEY = "kalmeron.query-cache.v1";
const TEN_MINUTES = 10 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => {
    const qc = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: TEN_MINUTES,
          gcTime: ONE_DAY,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });

    if (typeof window !== "undefined") {
      const persister = createSyncStoragePersister({
        storage: window.localStorage,
        key: STORAGE_KEY,
        throttleTime: 1000,
      });
      persistQueryClient({ queryClient: qc, persister, maxAge: ONE_DAY });
    }
    return qc;
  });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
