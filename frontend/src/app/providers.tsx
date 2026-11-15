"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useEffect } from "react";
import { supabase } from '@/lib/supabase';
import { currentUserKey } from '@/features/auth/api';

function AuthQuerySync({ queryClient }: { queryClient: QueryClient }) {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void queryClient.invalidateQueries({ queryKey: currentUserKey });
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: true, retry: 1 } },
  }));
  return <QueryClientProvider client={queryClient}><AuthQuerySync queryClient={queryClient} />{children}</QueryClientProvider>;
}
