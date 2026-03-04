import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface ConversionProgressProps {
  stage: string;
  percent: number;
}

export const ConversionProgress = ({ stage, percent }: ConversionProgressProps) => {
  return (
    <div className="space-y-2 py-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span>{stage}</span>
      </div>
      <Progress value={percent} className="h-2" />
      <p className="text-xs text-muted-foreground text-right">{percent}%</p>
    </div>
  );
};
