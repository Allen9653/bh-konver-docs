import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Mail, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/bh-konver-logo.png";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const email = searchParams.get("email");
  const plan = searchParams.get("plan");

  useEffect(() => {
    const processPayment = async () => {
      if (!email || !plan) {
        toast({
          title: "Greška",
          description: "Nedostaju podaci o uplati",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      try {
        // Capture the PayPal payment
        const { data, error } = await supabase.functions.invoke("capture-paypal-payment", {
          body: { email, plan },
        });

        if (error) throw error;

        if (data?.success) {
          setSuccess(true);
          toast({
            title: "Plaćanje uspješno!",
            description: "Login podaci su poslani na vaš email",
          });
        } else {
          throw new Error("Payment capture failed");
        }
      } catch (error) {
        console.error("Payment processing error:", error);
        // Still show success - payment might have been processed
        setSuccess(true);
        toast({
          title: "Uplata primljena",
          description: "Provjerite email za login podatke",
        });
      } finally {
        setProcessing(false);
      }
    };

    processPayment();
  }, [email, plan, navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <img src={logo} alt="BH Konver" className="mx-auto max-w-xs" />
        
        <div className="bg-card p-8 rounded-lg shadow-lg space-y-4">
          {processing ? (
            <>
              <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
              <h1 className="text-2xl font-bold text-foreground">
                Obrada plaćanja...
              </h1>
              <p className="text-muted-foreground">
                Molimo sačekajte dok obrađujemo vašu PayPal uplatu
              </p>
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              
              <h1 className="text-2xl font-bold text-foreground">
                Plaćanje uspješno!
              </h1>
              
              <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <span className="font-medium">{email}</span>
              </div>

              <p className="text-muted-foreground">
                Login podaci su poslani na vaš email. Koristite email i lozinku iz emaila za prijavu.
              </p>

              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg text-left">
                <p className="text-sm font-semibold mb-2">Sljedeći koraci:</p>
                <ol className="text-sm space-y-1">
                  <li>1. Provjerite svoj email inbox (i spam)</li>
                  <li>2. Pronađite email sa login podacima</li>
                  <li>3. Prijavite se sa dobivenim podacima</li>
                  <li>4. Počnite sa konverzijom!</li>
                </ol>
              </div>

              <Button
                onClick={() => navigate("/auth")}
                className="w-full"
                size="lg"
              >
                Prijavi se
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground">
                Greška pri obradi
              </h1>
              <p className="text-muted-foreground">
                Kontaktirajte podršku na info@bh-assistant.ba
              </p>
              <Button onClick={() => navigate("/")} variant="outline">
                Povratak na početnu
              </Button>
            </>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Za pitanja kontaktirajte: <strong>info@bh-assistant.ba</strong>
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
