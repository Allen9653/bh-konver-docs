import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/bh-konver-logo.png";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const processPayment = async () => {
      const email = searchParams.get("email");
      const plan = searchParams.get("plan");
      const token = searchParams.get("token");

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
        // Send login credentials to user
        const { error } = await supabase.functions.invoke("send-login-credentials", {
          body: { email, plan, orderId: token },
        });

        if (error) throw error;

        toast({
          title: "Plaćanje uspješno!",
          description: "Login podaci su poslani na vaš email",
        });

        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      } catch (error) {
        console.error("Payment processing error:", error);
        toast({
          title: "Greška",
          description: "Došlo je do greške pri obradi uplate",
          variant: "destructive",
        });
      } finally {
        setProcessing(false);
      }
    };

    processPayment();
  }, [searchParams, navigate, toast]);

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
                Molimo sačekajte dok obrađujemo vašu uplatu
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              
              <h1 className="text-2xl font-bold text-foreground">
                Plaćanje uspješno!
              </h1>
              
              <p className="text-muted-foreground">
                Login podaci su poslani na vaš email. Koristite email i lozinku iz emaila za prijavu.
              </p>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">Sljedeći koraci:</p>
                <ol className="text-sm space-y-1 text-left">
                  <li>1. Provjerite svoj email inbox</li>
                  <li>2. Kopirajte login podatke</li>
                  <li>3. Prijavite se u aplikaciju</li>
                  <li>4. Počnite sa konverzijom!</li>
                </ol>
              </div>

              <Button
                onClick={() => navigate("/auth")}
                className="w-full"
                size="lg"
              >
                Idi na prijavu
              </Button>

              <p className="text-xs text-muted-foreground">
                Automatski preusmjeravanje za 3 sekunde...
              </p>
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
