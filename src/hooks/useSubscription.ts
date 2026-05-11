import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSubscription = (userId: string | null | undefined) => {
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const checkSubscription = useCallback(async () => {
    if (!userId) {
      setHasActiveSubscription(false);
      setExpiresAt(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "completed")
        .gte("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error checking subscription:", error);
        setHasActiveSubscription(false);
        setExpiresAt(null);
      } else if (data) {
        setHasActiveSubscription(true);
        setExpiresAt(new Date(data.expires_at));
      } else {
        setHasActiveSubscription(false);
        setExpiresAt(null);
      }
    } catch (err) {
      console.error("Subscription check failed:", err);
      setHasActiveSubscription(false);
      setExpiresAt(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setHasActiveSubscription(false);
      setExpiresAt(null);
      setLoading(false);
      return;
    }

    // Initial fetch
    checkSubscription();

    // Realtime: refetch whenever this user's transactions change
    const channel = supabase
      .channel(`subscription-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          checkSubscription();
        }
      )
      .subscribe();

    // Fallback polling for ~30s after mount in case Realtime is delayed
    // (e.g. immediately after PayPal redirect, before webhook commits).
    let attempts = 0;
    const MAX_ATTEMPTS = 10;
    const interval = setInterval(() => {
      attempts++;
      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(interval);
        return;
      }
      checkSubscription();
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [userId, checkSubscription]);

  return {
    hasActiveSubscription,
    expiresAt,
    loading,
    refresh: checkSubscription,
  };
};
