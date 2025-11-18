import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import logo from "@/assets/bh-konver-logo.png";

const PaymentCanceled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <img src={logo} alt="BH Konver" className="mx-auto max-w-xs" />
        
        <div className="bg-card p-8 rounded-lg shadow-lg space-y-4">
          <XCircle className="w-16 h-16 text-destructive mx-auto" />
          
          <h1 className="text-2xl font-bold text-foreground">
            Plaćanje otkazano
          </h1>
          
          <p className="text-muted-foreground">
            Vaše plaćanje je otkazano. Možete pokušati ponovo kada budete spremni.
          </p>

          <div className="space-y-2">
            <Button
              onClick={() => navigate("/")}
              className="w-full"
              size="lg"
            >
              Nazad na početnu
            </Button>
            
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Pokušaj ponovo
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Za pomoć kontaktirajte: <strong>info@bh-assistant.ba</strong>
        </p>
      </div>
    </div>
  );
};

export default PaymentCanceled;
