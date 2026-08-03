import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Server-side admin verification via Edge Function
  const verifyAdminServerSide = useCallback(async (accessToken: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-admin', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (error) {
        console.error("Server-side admin verification failed:", error);
        return false;
      }

      return data?.isAdmin === true;
    } catch (err) {
      console.error("Error calling verify-admin function:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Server-side admin verification
        if (session?.access_token) {
          const adminStatus = await verifyAdminServerSide(session.access_token);
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.access_token) {
        const adminStatus = await verifyAdminServerSide(session.access_token);
        setIsAdmin(adminStatus);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [verifyAdminServerSide]);

  const signOut = async () => {
    // Always clear local app state first so the UI never keeps showing a
    // signed-in interface, even if the network call fails.
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch (error) {
      console.error("Global sign out failed, falling back to local:", error);
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch (localError) {
        console.error("Local sign out failed:", localError);
      }
    } finally {
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      // Remove any lingering Supabase auth tokens from browser storage.
      try {
        Object.keys(localStorage)
          .filter((key) => key.startsWith("sb-") && key.includes("auth-token"))
          .forEach((key) => localStorage.removeItem(key));
      } catch (storageError) {
        console.error("Failed to clear auth storage:", storageError);
      }
    }
  };


  return {
    user,
    session,
    isAdmin,
    loading,
    signOut,
  };
};
