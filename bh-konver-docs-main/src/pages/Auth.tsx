import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";
import logo from "@/assets/bh-konver-logo.png";
import { SEO } from "@/components/SEO";

// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Preserve safe same-origin relative redirect target (e.g. OAuth consent URL)
  const rawNext = searchParams.get("next") ?? "";
  const nextPath = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
  const nextQuery = rawNext ? `?next=${encodeURIComponent(nextPath)}` : "";

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("");
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError("Unesite ispravnu email adresu");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) validateEmail(value);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Greška",
        description: "Unesite email adresu",
        variant: "destructive",
      });
      return;
    }
    
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Email poslan",
        description: "Provjerite inbox za link za reset lozinke",
      });
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Greška",
        description: error.message || "Nije moguće poslati email za reset",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${nextPath}`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Greška",
        description: error.message || "Google prijava nije uspjela",
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Uspješna prijava",
          description: "Dobrodošli nazad!",
        });
        window.location.href = nextPath;
        return;
      } else {
        const redirectUrl = `${window.location.origin}${nextPath}`;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) throw error;

        // Email verification required — user must confirm before logging in
        const needsVerification = !data.session;

        // Send welcome email with subscription info (non-blocking)
        try {
          await supabase.functions.invoke("send-email", {
            body: { type: "welcome", email },
          });
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
        }

        toast({
          title: "Registracija uspješna",
          description: needsVerification
            ? "Poslali smo vam verifikacioni email. Kliknite na link u emailu da potvrdite adresu prije prijave."
            : "Račun je kreiran. Možete se prijaviti.",
        });
        setPassword("");
        setIsLogin(true);
      }
    } catch (error: any) {
      // Capture exact Supabase details for debugging
      console.error("[Auth] Signup/Login error", {
        message: error?.message,
        name: error?.name,
        status: error?.status,
        code: error?.code,
        details: error,
      });

      const rawMsg: string = error?.message || "";
      const status: number | undefined = error?.status;
      const code: string | undefined = error?.code;

      // Map to a friendly Bosnian message
      let friendly = "Došlo je do neočekivane greške. Pokušajte ponovo za nekoliko trenutaka.";
      if (/already registered|already exists|user_already_exists/i.test(rawMsg) || code === "user_already_exists") {
        friendly = "Ova email adresa je već registrovana. Pokušajte se prijaviti ili resetujte lozinku.";
      } else if (/email not confirmed|email_not_confirmed/i.test(rawMsg) || code === "email_not_confirmed") {
        friendly = "Email adresa nije potvrđena. Provjerite inbox i kliknite na verifikacioni link.";
      } else if (/invalid login|invalid_credentials/i.test(rawMsg) || code === "invalid_credentials") {
        friendly = "Neispravan email ili lozinka.";
      } else if (/password/i.test(rawMsg) && /weak|short|pwned|leaked/i.test(rawMsg)) {
        friendly = "Lozinka je preslaba ili je pronađena u poznatim curjenjima podataka. Odaberite jaču lozinku.";
      } else if (/rate limit|too many/i.test(rawMsg) || status === 429) {
        friendly = "Previše pokušaja. Sačekajte nekoliko minuta pa pokušajte ponovo.";
      } else if (/database error|unexpected_failure/i.test(rawMsg) || status === 500) {
        friendly = "Trenutno imamo tehničku poteškoću sa registracijom. Naš tim je obaviješten — pokušajte ponovo za par minuta.";
      }

      toast({
        title: "Greška pri registraciji",
        description: friendly,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password View
  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="BH Konver Logo" width={320} height={320} className="max-w-xs w-full h-auto" />
            </div>
            <CardTitle>Zaboravljena lozinka</CardTitle>
            <CardDescription>
              Unesite email adresu za reset lozinke
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="vas@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pošalji link za reset
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-primary hover:underline"
              >
                ← Nazad na prijavu
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEO
        title="Prijava i registracija — BH Konver"
        description="Prijavite se ili kreirajte besplatan BH Konver račun za pristup svim alatima za konverziju."
        path="/auth"
      />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="BH Konver Logo" width={320} height={320} className="max-w-xs w-full h-auto" />
          </div>
          <CardTitle>{isLogin ? "Prijava" : "Registracija"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Prijavite se na vaš račun"
              : "Kreirajte novi račun"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Google Sign-In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4 flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {isLogin ? "Prijavi se s Googleom" : "Registruj se s Googleom"}
          </Button>

          <div className="relative my-4">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              ili
            </span>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vas@email.com"
                value={email}
                onChange={handleEmailChange}
                required
                className={emailError ? "border-destructive" : ""}
              />
              {emailError && (
                <p className="text-xs text-destructive">{emailError}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Lozinka</Label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    Zaboravili ste lozinku?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              {!isLogin && <PasswordStrengthIndicator password={password} />}
            </div>
            <Button type="submit" className="w-full" disabled={loading || !!emailError}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "Prijavi se" : "Registruj se"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
            >
              {isLogin
                ? "Nemate račun? Registrujte se"
                : "Imate račun? Prijavite se"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
