import { useTranslation } from "react-i18next";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TOOL_CATALOG, type ToolAccess, type ToolCatalogItem } from "@/lib/toolCatalog";

type Props = {
  isPremium: boolean;
  quotaExhausted: boolean;
  onOpen: (tool: ToolCatalogItem) => void;
};

const toneClasses = {
  primary: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
  accent: "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground",
  gold: "bg-gold/15 text-gold-foreground group-hover:bg-gold",
  muted: "bg-muted text-muted-foreground group-hover:bg-secondary",
};

const badgeKeyFor = (access: ToolAccess) => {
  if (access === "free") return "homeTools.badges.free";
  if (access === "quota") return "homeTools.badges.quota";
  if (access === "mixed") return "homeTools.badges.mixed";
  return "homeTools.badges.pro";
};

export const HomeModuleGrid = ({ isPremium, quotaExhausted, onOpen }: Props) => {
  const { t } = useTranslation();

  return (
    <section className="py-14 sm:py-20" aria-labelledby="tools-heading">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <Badge variant="outline" className="mb-3 border-primary/25 bg-primary/5 text-primary">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> {t("homeTools.eyebrow")}
          </Badge>
          <h2 id="tools-heading" className="font-display text-3xl font-bold text-foreground sm:text-4xl">ŠTA VAM BH KONVER NUDI</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">BH KONVER JE PRVI BH DIGITALNI ALAT ZA KONVERZIJU AUDIO/VIDEO/MS OFFICE DOKUMENATA KOJI VAM UZ SAMU KONVERZIJU NUDI I DODATNE MOGUĆNOSTI</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TOOL_CATALOG.map((tool) => {
            const Icon = tool.icon;
            const locked = !isPremium && (tool.access === "pro" || (tool.access === "quota" && quotaExhausted));
            return (
              <article key={tool.slug} className="group flex min-h-48 flex-col rounded-lg border border-border bg-card p-5 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-primary/35 hover:shadow-md">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${toneClasses[tool.tone]}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {tool.beta && <Badge variant="secondary" className="text-[10px]">BETA</Badge>}
                    <Badge variant={tool.access === "pro" ? "default" : "outline"} className="text-[10px]">
                      {locked && <Lock className="mr-1 h-3 w-3" />}{t(badgeKeyFor(tool.access))}
                    </Badge>
                  </div>
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">{t(tool.titleKey)}</h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">{t(tool.descriptionKey)}</p>
                <Button variant="ghost" className="mt-4 h-8 justify-start px-0 text-xs text-primary hover:bg-transparent" onClick={() => onOpen(tool)}>
                  {locked ? t("homeTools.unlock") : t("homeTools.open")} <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};