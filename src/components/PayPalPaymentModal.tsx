import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PayPalPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPlanId?: string;
}

const PRICING_PLANS = [
  { id: "24h", label: "24 sata", price: "2.00", duration: "1 dan" },
  { id: "48h", label: "48 sati", price: "10.00", duration: "2 dana" },
  { id: "monthly", label: "Mjesečna pretplata", price: "20.00", duration: "30 dana" },
];

export function PayPalPaymentModal({ open, onOpenChange, initialPlanId }: PayPalPaymentModalProps) {
  const [email, setEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(initialPlanId || "24h");
  const [loading, setLoading] = useState(false);
  
  // Update selected plan when initialPlanId changes
  useEffect(() => {
    if (initialPlanId) {
      setSelectedPlan(initialPlanId);
    }
  }, [initialPlanId]);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Nevažeća email adresa",
        description: "Molimo unesite važeću email adresu",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const plan = PRICING_PLANS.find(p => p.id === selectedPlan);
      
      // Call PayPal payment edge function
      const { data, error } = await supabase.functions.invoke("process-paypal-payment", {
        body: { 
          email,
          plan: selectedPlan,
          amount: plan?.price,
          duration: plan?.duration
        },
      });

      if (error) throw error;

      if (data?.approvalUrl) {
        // Redirect to PayPal
        window.location.href = data.approvalUrl;
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške pri kreiranju plaćanja",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = PRICING_PLANS.find(p => p.id === selectedPlan);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Odaberite paket</DialogTitle>
          <DialogDescription>
            Izaberite period korištenja BH KONVER-a
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email adresa</Label>
            <Input
              id="email"
              type="email"
              placeholder="vas@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Izaberite paket</Label>
            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
              {PRICING_PLANS.map((plan) => (
                <div key={plan.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={plan.id} id={plan.id} />
                  <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{plan.label}</span>
                      <span className="font-bold text-primary">{plan.price} BAM</span>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-semibold mb-2">Šta dobijate:</p>
            <ul className="text-sm space-y-1">
              <li>✓ Neograničene konverzije</li>
              <li>✓ Svi formati (Word, Excel, PowerPoint, PDF, Audio, Video)</li>
              <li>✓ Brza obrada</li>
              <li>✓ Slanje konvertiranih fajlova na email</li>
              <li>✓ Sigurna transakcija preko PayPal-a</li>
            </ul>
          </div>

          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Učitavanje...
              </>
            ) : (
              `Plati ${selectedPlanData?.price} BAM`
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            PayPal plaćanje na: alenjusufovic@yahoo.com
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
