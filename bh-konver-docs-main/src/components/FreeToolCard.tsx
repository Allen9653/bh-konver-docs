import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  badge?: string;
  disabled?: boolean;
};

export const FreeToolCard = ({ icon: Icon, title, description, onClick, badge, disabled }: Props) => {
  return (
    <Card
      onClick={disabled ? undefined : onClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative p-5 cursor-pointer transition-all border hover:border-primary hover:shadow-lg hover:-translate-y-0.5 ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {badge && (
        <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground text-[10px]">
          {badge}
        </Badge>
      )}
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-base leading-tight mb-1">{title}</h3>
          <p className="text-xs text-muted-foreground leading-snug">{description}</p>
        </div>
      </div>
    </Card>
  );
};
