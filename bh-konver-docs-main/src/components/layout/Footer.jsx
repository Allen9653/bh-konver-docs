import { Link } from "react-router-dom";
import { ArrowUpRight, Facebook, Instagram, Mail, Music2, Youtube } from "lucide-react";
import logo from "@/assets/bh-konver-logo.png";

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/SpajamoKultureStvaramoSanse", icon: Facebook },
  { label: "Instagram", href: "https://www.instagram.com/bh.assist/", icon: Instagram },
  { label: "TikTok", href: "https://www.tiktok.com/@bhassst", icon: Music2 },
  { label: "YouTube", href: "https://www.youtube.com/@Assistant-d1y", icon: Youtube },
];

const footerColumns = [
  {
    title: "Navigacija",
    links: [
      { label: "Home", to: "/", category: "Home" },
      { label: "Generators", to: "/category/generatori", category: "GENERATORI" },
      { label: "Converters", to: "/category/konvertori", category: "KONVERTORI" },
    ],
  },
  {
    title: "Alati",
    links: [
      { label: "Calculators", to: "/category/kalkulatori", category: "KALKULATORI" },
      { label: "Testers", to: "/category/testovi", category: "TESTOVI" },
      { label: "Checkers", to: "/category/testovi", category: "TESTOVI" },
    ],
  },
  {
    title: "Pravno i bezbjednost",
    links: [
      { label: "Legal", to: "/terms#legal-notice", category: "Legal", newTab: true },
      { label: "Security", to: "/privacy#security", category: "Security", newTab: true },
      { label: "Privacy Policy", to: "/privacy", category: "Privacy Policy", newTab: true },
    ],
  },
  {
    title: "Uslovi i kontakt",
    links: [
      { label: "Terms and conditions", to: "/terms", category: "Terms", newTab: true },
      { label: "Cookies", to: "/privacy#cookies", category: "Cookies", newTab: true },
      { label: "Contact Us", to: "/support", category: "Contact", newTab: true },
    ],
  },
];

const footerLinkClass =
  "w-fit text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const SocialLinks = ({ className = "mt-5 flex items-center gap-2" }) => (
  <nav className={className} aria-label="BH KONVER na društvenim mrežama">
    {socialLinks.map(({ label, href, icon: Icon }) => (
      <a
        key={label}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`BH KONVER na mreži ${label}`}
        title={label}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-current/25 text-current/70 transition-colors hover:bg-current/10 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </a>
    ))}
  </nav>
);

export const Footer = ({ activeCategory, onNavigate }) => (
  <footer className="bg-foreground text-primary-foreground">
    <div className="mx-auto max-w-[90rem] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))] lg:gap-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="BH KONVER, početna stranica">
            <img src={logo} alt="" className="h-10 w-10 object-contain" />
            <span className="font-display text-lg font-bold">
              BH <span className="text-emerald-400">KONVER</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-primary-foreground/65">
            BH KONVER donosi praktične online alate za svakodnevne konverzije, proračune i provjere. Posjetite www.bh-konver.ba.
          </p>
          <a href="mailto:info@bh-assistant.ba" className={`mt-4 inline-flex items-center gap-2 ${footerLinkClass}`}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            info@bh-assistant.ba
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <SocialLinks />
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h2 className="text-xs font-semibold uppercase text-primary-foreground/50">{column.title}</h2>
            <div className="mt-4 flex flex-col items-start gap-3">
              {column.links.map((item) => (
                <Link
                  key={`${item.label}-${item.to}`}
                  to={item.to}
                  target={item.newTab ? "_blank" : undefined}
                  rel={item.newTab ? "noopener noreferrer" : undefined}
                  className={`${footerLinkClass} ${activeCategory === item.category ? "text-primary-foreground" : ""}`}
                  onClick={() => { if (!item.newTab) onNavigate?.(item.category); }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-2 border-t border-primary-foreground/15 pt-5 text-xs text-primary-foreground/50 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} BH KONVER. Sva prava zadržana.</p>
        <a href="https://www.bh-konver.ba" target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1 transition-colors hover:text-primary-foreground">
          www.bh-konver.ba <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
