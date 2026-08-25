"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Master prompt rule: "Stock truth: never let a cached stock number override what the API returned"
            // E nisa stock data update wenna loku staleTime ekak denne naha.
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: true, // Tab eka maaru karala eddi aluthma stock/price eka ganna on true karanawa
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}