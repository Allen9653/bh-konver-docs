import { useEffect, useState } from "react";

const logo = "/bh-konver-logo-320.webp";

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

const SplashScreen = ({ onComplete, duration = 2000 }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete, duration]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
      onTransitionEnd={() => {
        if (isExiting) setIsVisible(false);
      }}
    >
      <div className="flex flex-col items-center gap-6 animate-splash-enter">
        <img
          src={logo}
          alt="BH Konver"
          width={320}
          height={320}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="w-64 h-64 object-contain animate-splash-float"
        />

        <div className="flex flex-col items-center gap-2 animate-splash-caption">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full bg-primary animate-splash-dot"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Učitavanje...</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
