import { useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordCheck {
  label: string;
  passed: boolean;
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const checks: PasswordCheck[] = useMemo(() => [
    { label: "Najmanje 6 karaktera", passed: password.length >= 6 },
    { label: "Sadrži veliko slovo", passed: /[A-Z]/.test(password) },
    { label: "Sadrži malo slovo", passed: /[a-z]/.test(password) },
    { label: "Sadrži broj", passed: /[0-9]/.test(password) },
  ], [password]);

  const passedCount = checks.filter(c => c.passed).length;
  
  const getStrengthColor = () => {
    if (passedCount === 0) return "bg-muted";
    if (passedCount === 1) return "bg-destructive";
    if (passedCount === 2) return "bg-orange-500";
    if (passedCount === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (passedCount === 0) return "";
    if (passedCount === 1) return "Slaba";
    if (passedCount === 2) return "Srednja";
    if (passedCount === 3) return "Dobra";
    return "Jaka";
  };

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors ${
              level <= passedCount ? getStrengthColor() : "bg-muted"
            }`}
          />
        ))}
      </div>
      
      {/* Strength label */}
      <p className="text-xs text-muted-foreground">
        Jačina lozinke: <span className="font-medium">{getStrengthLabel()}</span>
      </p>

      {/* Requirements checklist */}
      <div className="space-y-1">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {check.passed ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground" />
            )}
            <span className={check.passed ? "text-green-600" : "text-muted-foreground"}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
