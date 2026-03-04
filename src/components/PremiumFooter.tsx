import { Link } from "react-router-dom";

export const PremiumFooter = () => {
  return (
    <footer className="border-t border-border mt-24 py-8 bg-card/50">
      <div className="container mx-auto px-4 max-w-5xl text-center space-y-3">
        <p className="text-xs text-muted-foreground tracking-wide uppercase">
          Secure & Private File Conversion © {new Date().getFullYear()}
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <span className="text-border">·</span>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <span className="text-border">·</span>
          <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
          <span className="text-border">·</span>
          <a href="mailto:info@bh-assistant.ba" className="hover:text-foreground transition-colors">Contact</a>
        </div>
        <p className="text-[11px] text-muted-foreground/60">
          BH KONVER · Developed in Bosnia and Herzegovina · www.bh-assistant.ba
        </p>
      </div>
    </footer>
  );
};
