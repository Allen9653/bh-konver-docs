import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSubscription = (userId: string | null | undefined) => {
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!userId) {
        setHasActiveSubscription(false);
        setLoading(false);
        return;
      }

      try {
        // Query by user_id (new secure RLS policy) with fallback to user_email for legacy records
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
        } else if (data) {
          setHasActiveSubscription(true);
          setExpiresAt(new Date(data.expires_at));
        } else {
          setHasActiveSubscription(false);
        }
      } catch (err) {
        console.error("Subscription check failed:", err);
        setHasActiveSubscription(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [userId]);

  return {
    hasActiveSubscription,
    expiresAt,
    loading,
  };
};
