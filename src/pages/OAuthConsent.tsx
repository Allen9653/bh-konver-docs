import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import logo from "@/assets/bh-konver-logo.png";

// Local typed wrapper for the beta supabase.auth.oauth namespace
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Nedostaje authorization_id.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      try {
        const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (error) {
          setError(error.message);
          return;
        }
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data);
      } catch (e: any) {
        if (active) setError(e?.message ?? "Greška pri učitavanju.");
      }
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    try {
      const { data, error } = approve
        ? await oauth.approveAuthorization(authorizationId)
        : await oauth.denyAuthorization(authorizationId);
      if (error) {
        setBusy(false);
        setError(error.message);
        return;
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setBusy(false);
        setError("Server nije vratio redirect URL.");
        return;
      }
      window.location.href = target;
    } catch (e: any) {
      setBusy(false);
      setError(e?.message ?? "Greška.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <img src={logo} alt="BH Konver" width={120} height={120} className="h-16 w-auto" />
          </div>
          <CardTitle>Poveži aplikaciju sa BH KONVER</CardTitle>
          <CardDescription>
            {details?.client?.name
              ? `${details.client.name} traži pristup vašem BH KONVER računu.`
              : "Vanjska aplikacija traži pristup vašem računu."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-destructive border border-destructive/40 rounded p-3">
              {error}
            </div>
          )}
          {!error && !details && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {details && (
            <>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  Dozvoljavate da <strong>{details?.client?.name ?? "aplikacija"}</strong> koristi BH KONVER alate u vaše ime.
                </p>
                <p className="text-xs">
                  Ovo ne zaobilazi dozvole BH KONVER-a niti sigurnosna pravila baze podataka.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => decide(true)} disabled={busy} className="flex-1">
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Odobri
                </Button>
                <Button onClick={() => decide(false)} disabled={busy} variant="outline" className="flex-1">
                  Odbij
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
