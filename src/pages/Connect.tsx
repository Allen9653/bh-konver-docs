import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "";
const MCP_URL = `https://${projectRef}.supabase.co/functions/v1/mcp`;

export default function Connect() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(MCP_URL);
    setCopied(true);
    toast.success("URL kopiran");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Poveži AI asistenta — BH Konver"
        description="Uputstvo za povezivanje ChatGPT-a ili Claude-a sa BH Konver MCP serverom."
        path="/connect"
      />
      <div className="container mx-auto px-4 py-8 max-w-3xl flex-1">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nazad
        </Button>

        <h1 className="text-4xl font-bold text-foreground mb-3">
          Poveži AI asistenta sa BH Konver
        </h1>
        <p className="text-muted-foreground mb-8">
          Dodajte BH Konver kao konektor u ChatGPT ili Claude i pitajte asistenta
          o formatima konverzije, cijenama i pravnim dokumentima.
        </p>

        <Card className="p-6 mb-10 border-primary/30">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            MCP server URL
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-muted px-4 py-3 rounded-md text-sm break-all font-mono">
              {MCP_URL}
            </code>
            <Button onClick={copyUrl} size="lg" variant="secondary">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </Card>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-foreground mb-4">ChatGPT</h2>
          <ol className="space-y-3 text-foreground list-decimal list-inside">
            <li>
              Otvorite{" "}
              <a
                href="https://chatgpt.com/#settings/Connectors/Advanced"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                ChatGPT Connectors → Advanced <ExternalLink className="w-3 h-3" />
              </a>{" "}
              i uključite Developer mode (pročitajte upozorenje o riziku).
            </li>
            <li>U polju za poruku kliknite "+" i uključite Developer mode.</li>
            <li>Kliknite "Add sources", zatim "Connect more".</li>
            <li>Imenujte konektor (npr. "BH Konver") i zalijepite MCP URL iznad.</li>
            <li>Zatražite od ChatGPT-a da koristi aplikaciju.</li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Claude</h2>
          <ol className="space-y-3 text-foreground list-decimal list-inside">
            <li>
              Otvorite{" "}
              <a
                href="https://claude.ai/customize/connectors?modal=add-custom-connector"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Claude Custom Connectors <ExternalLink className="w-3 h-3" />
              </a>
              .
            </li>
            <li>Imenujte konektor (npr. "BH Konver") i zalijepite MCP URL iznad.</li>
            <li>
              Uključite konektor u polju za poruku, zatim zatražite od Claude-a
              da koristi aplikaciju.
            </li>
          </ol>
        </section>

        <p className="text-sm text-muted-foreground">
          Nakon povezivanja asistent može pitati BH Konver koji formati se
          konvertuju, koji su premium planovi i koji pravni dokumenti su
          dostupni.
        </p>
      </div>
      <Footer />
    </div>
  );
}
