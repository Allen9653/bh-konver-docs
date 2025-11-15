import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Server, Eye, Database, RefreshCw, Globe, Cloud } from "lucide-react";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nazad
        </Button>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">PRIVATNOST</h1>
          
          <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">POSLOVNA POLITIKA: Naša posvećenost sigurnosti</h2>
            <p className="text-muted-foreground">
              U B&H Assistant d.o.o. sigurnost vaših podataka nam je jednako važna kao i besprijekorna konverzija 
              fajlova. Naš sveobuhvatni sigurnosni okvir zasnovan je na najmodernijoj tehnologiji i vodećim 
              industrijskim praksama kako bi vaši podaci ostali sigurni, povjerljivi i dostupni kad god su potrebni. 
              Istražite mjere sigurnosti koje smo implementirali da zaštitimo vaše povjerenje.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-6 mt-12">Tehnologija</h2>

          <section className="mb-8">
            <div className="flex items-start gap-3 mb-3">
              <Lock className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">SSL/TLS enkripcija</h3>
                <p className="text-muted-foreground">
                  Svi podaci koji se prenose između vašeg uređaja i naših servera osigurani su SSL/TLS enkripcijom. 
                  Time se štite vaše informacije od neovlaštenog pristupa i obezbjeđuje sigurno okruženje za konverziju fajlova.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="flex items-start gap-3 mb-3">
              <Server className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Sigurni data centri</h3>
                <p className="text-muted-foreground">
                  Naši data centri su zaštićeni višeslojnim fizičkim i digitalnim sigurnosnim mjerama. Od biometrijske 
                  kontrole pristupa do 24/7 nadzora, poduzimamo sve potrebne korake da zaštitimo infrastrukturu koja 
                  pokreće BH KONVER.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="flex items-start gap-3 mb-3">
              <Eye className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Praćenje korisničkih aktivnosti</h3>
                <p className="text-muted-foreground">
                  Aktivno pratimo korisničke aktivnosti radi otkrivanja sumnjivog ponašanja. Naši alati za praćenje u 
                  realnom vremenu omogućavaju brzu reakciju na potencijalne prijetnje, čuvajući vaše podatke sigurnim.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="flex items-start gap-3 mb-3">
              <Globe className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Sigurni API endpointi</h3>
                <p className="text-muted-foreground">
                  Naši API endpointi osigurani su industrijskim sigurnosnim protokolima, uključujući OAuth2 i API ključeve, 
                  čime se garantuje da samo ovlaštene aplikacije mogu sigurno komunicirati s našim servisima.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="flex items-start gap-3 mb-3">
              <Shield className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Sistemi za detekciju i prevenciju upada (IDPS)</h3>
                <p className="text-muted-foreground">
                  Naši sistemi se stalno nadziru naprednim IDPS tehnologijama koje otkrivaju i sprječavaju neovlašteni 
                  pristup i potencijalne prijetnje u realnom vremenu, osiguravajući integritet naših usluga.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="flex items-start gap-3 mb-3">
              <Database className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Backup podataka i plan oporavka od katastrofe</h3>
                <p className="text-muted-foreground">
                  Redovno pravimo sigurnosne kopije podataka i imamo sveobuhvatan plan oporavka od katastrofe. To 
                  osigurava da vaši podaci ostanu sigurni i dostupni čak i u slučaju nepredviđenih problema.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="flex items-start gap-3 mb-3">
              <Lock className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Siguran i enkriptovan pristup putem VPN-a</h3>
                <p className="text-muted-foreground">
                  Pristup našim serverima je ograničen i osiguran enkriptovanim VPN vezama, čime se garantuje da samo 
                  ovlašteno osoblje može upravljati sistemima.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="flex items-start gap-3 mb-3">
              <RefreshCw className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Pouzdan rad (uptime)</h3>
                <p className="text-muted-foreground">
                  Kontinuirano pratimo naše servise i servere, postižući 99,8% dostupnosti za besprijekornu konverziju 
                  fajlova. Na stranici sa statusom možete provjeriti ažuriranja o performansama sistema u realnom vremenu.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="flex items-start gap-3 mb-3">
              <Cloud className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Izolacija podataka</h3>
                <p className="text-muted-foreground">
                  Naš softver i infrastruktura izgrađeni su s izolacijom korisničkih podataka kao osnovnim principom. 
                  Svaka konverzija se odvija u vlastitom, izolovanom kontejneru koji je kratkog vijeka i potpuno nezavisan, 
                  bez pristupa drugim fajlovima u sistemu.
                </p>
              </div>
            </div>
          </section>

          <h2 className="text-3xl font-bold text-foreground mb-6 mt-12">Prakse</h2>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-2">Usklađenost s industrijskim standardima</h3>
            <p className="text-muted-foreground">
              Pridržavamo se široko priznatih sigurnosnih praksi kako bismo osigurali najviši nivo zaštite podataka. 
              Naša posvećenost održavanju snažnih sigurnosnih protokola odražava našu predanost ispunjavanju očekivanja 
              korisnika i praćenju sigurnosnih izazova.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-2">Kontrola pristupa i autentifikacija</h3>
            <p className="text-muted-foreground">
              Provodimo stroge politike kontrole pristupa i višefaktorsku autentifikaciju (MFA) kako bismo osigurali da 
              samo ovlašteni korisnici mogu pristupiti osjetljivim podacima i sistemima, smanjujući rizik od neovlaštenog pristupa.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-2">Politika privatnosti i zaštita podataka</h3>
            <p className="text-muted-foreground">
              Privatnost shvatamo ozbiljno. Naša sveobuhvatna politika privatnosti jasno definiše kako rukujemo vašim 
              podacima, osiguravajući da ostanu povjerljivi i sigurni.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-2">Obuka i svijest o sigurnosti</h3>
            <p className="text-muted-foreground">
              Naš tim se redovno obučava o najnovijim sigurnosnim prijetnjama i najboljim praksama. Njegujući kulturu 
              svijesti o sigurnosti, osiguravamo da je osoblje spremno da zaštiti vaše podatke.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-2">Siguran životni ciklus razvoja softvera (SDLC)</h3>
            <p className="text-muted-foreground">
              Sigurnost je ugrađena u svaku fazu našeg procesa razvoja softvera. Od dizajna do implementacije, pratimo 
              siguran SDLC kako bismo identifikovali i otklonili potencijalne ranjivosti prije nego što budu iskorištene.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-2">Plan odgovora na incidente</h3>
            <p className="text-muted-foreground">
              Imamo robustan plan odgovora na incidente. U malo vjerovatnom slučaju sigurnosnog incidenta, naš tim je 
              spreman da brzo i efikasno reaguje, smanji rizike i obnovi sigurnost.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
