export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            © 2025 BH Konver | Razvijeno u Bosni i Hercegovini, Zenica 72 000
          </p>
          <p className="text-sm text-muted-foreground">
            Vlasništvo B&H Assistant
          </p>
          <p className="text-base font-semibold text-foreground">
            Spajamo Kulture Stvaramo Šanse
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a 
              href="mailto:info@bh-assistant.ba" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              info@bh-assistant.ba
            </a>
            <span className="text-muted-foreground">|</span>
            <a 
              href="#" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Privatnost
            </a>
            <span className="text-muted-foreground">|</span>
            <a 
              href="#" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Uslovi korištenja
            </a>
            <span className="text-muted-foreground">|</span>
            <a 
              href="#" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Podrška
            </a>
          </div>
          <a 
            href="https://www.bh-assistant.ba" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block text-primary hover:text-primary/80 transition-colors font-medium"
          >
            www.bh-assistant.ba
          </a>
        </div>
      </div>
    </footer>
  );
};
