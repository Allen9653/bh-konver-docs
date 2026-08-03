import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PremiumHeader } from "@/components/PremiumHeader";
import { PremiumFooter } from "@/components/PremiumFooter";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Lock, Crown, ScrollText, ArrowRight, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { LEGAL_CATEGORIES, findDoc, type LegalDoc } from "@/lib/legalDocs";
import { LegalDocWizard } from "@/components/legal/LegalDocWizard";
import { useToast } from "@/hooks/use-toast";

const PravniDokumenti = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isAdmin, signOut, loading: authLoading } = useAdminAuth();
  const { hasActiveSubscription, expiresAt } = useSubscription(user?.id);
  const isPremium = isAdmin || hasActiveSubscription;

  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const activeDoc = activeDocId ? findDoc(activeDocId) : null;

  const handleOpen = (doc: LegalDoc) => {
    if (!doc.implemented) {
      toast({
        title: t("pravni.toastSoonTitle"),
        description: t("pravni.toastSoonDesc", { doc: doc.shortTitle }),
      });
      return;
    }
    if (doc.premium && !isPremium) {
      toast({
        title: t("pravni.toastPremiumTitle"),
        description: t("pravni.toastPremiumDesc"),
      });
      navigate("/#pricing");
      return;
    }
    setActiveDocId(doc.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("pravni.seoTitle")}
        description={t("pravni.seoDescription")}
        path="/pravni-dokumenti"
      />
      <PremiumHeader user={user} isAdmin={isAdmin} isPremium={isPremium} expiresAt={expiresAt} onSignOut={signOut} loading={authLoading} />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/5 border-b border-border">
          <div className="container mx-auto px-4 max-w-5xl py-12">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <ScrollText className="w-4 h-4" />
              <span>{t("pravni.jurisdiction")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight mb-3">
              {t("pravni.titlePrefix")} <span className="text-primary">{t("pravni.titleAccent")}</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl">
              {t("pravni.subtitle")}
            </p>
            <div className="flex flex-wrap gap-2 mt-4 text-xs">
              <Badge variant="secondary" className="gap-1"><ShieldCheck className="w-3 h-3" /> {t("pravni.badgePrivate")}</Badge>
              <Badge variant="secondary">{t("pravni.badgeCompliant")}</Badge>
              <Badge variant="secondary">{t("pravni.badgeReady")}</Badge>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-5xl py-10">
          {activeDoc ? (
            <LegalDocWizard doc={activeDoc} onBack={() => setActiveDocId(null)} />
          ) : (
            <div className="space-y-10">
              {LEGAL_CATEGORIES.map((cat) => (
                <section key={cat.id}>
                  <div className="mb-4">
                    <h2 className="text-xl font-bold font-display">{cat.title}</h2>
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cat.docs.map((doc) => {
                      const locked = doc.premium && !isPremium;
                      return (
                        <Card
                          key={doc.id}
                          className="p-5 group hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer relative flex flex-col"
                          onClick={() => handleOpen(doc)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            {doc.premium ? (
                              <Badge className="bg-accent text-accent-foreground gap-1 text-[10px]">
                                <Crown className="w-3 h-3" /> {t("pravni.premiumBadge")}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">{t("pravni.freeBadge")}</Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-base mb-1">{doc.shortTitle}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">{doc.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            {doc.implemented ? (
                              <span className="text-primary font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                                {locked ? <><Lock className="w-3 h-3" /> {t("pravni.unlock")}</> : <>{t("pravni.openForm")} <ArrowRight className="w-3 h-3" /></>}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic">{t("pravni.soon")}</span>
                            )}
                          </div>
                          {locked && (
                            <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] rounded-lg pointer-events-none" />
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </section>
              ))}

              {/* Legal compliance note */}
              <Card className="p-5 bg-muted/40 border-dashed">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" /> {t("pravni.noteTitle")}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("pravni.noteText")}
                </p>
              </Card>
            </div>
          )}
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
};

export default PravniDokumenti;
