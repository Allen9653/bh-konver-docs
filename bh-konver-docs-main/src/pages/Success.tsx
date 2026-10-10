import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import logo from "@/assets/bh-konver-logo.png";

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Opciono: automatski redirect nakon 5 sekundi
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <img src={logo} alt="BH Konver" width={320} height={320} className="mx-auto max-w-xs w-full h-auto" />
        
        <div className="bg-card p-8 rounded-lg shadow-lg space-y-4">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
          
          <h1 className="text-2xl font-bold text-foreground">
            Plaćanje uspješno!
          </h1>
          
          <p className="text-muted-foreground">
            Hvala vam na plaćanju. Sada možete koristiti sve funkcije BH Konver aplikacije bez ograničenja.
          </p>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-semibold mb-2">Vaši privilegije:</p>
            <ul className="text-sm space-y-1">
              <li>✓ Neograničene konverzije</li>
              <li>✓ Svi formati dostupni</li>
              <li>✓ Prioritetna obrada</li>
            </ul>
          </div>

          <Button
            onClick={() => navigate("/")}
            className="w-full"
            size="lg"
          >
            Počni sa konverzijom
          </Button>

          <p className="text-xs text-muted-foreground">
            Bićete automatski preusmjereni za 5 sekundi...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Success;
