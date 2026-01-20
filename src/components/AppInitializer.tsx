import { useState, useEffect } from "react";
import SplashScreen from "./SplashScreen";
import OnboardingFlow from "./OnboardingFlow";

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer = ({ children }: AppInitializerProps) => {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if onboarding has been completed
    const onboardingComplete = localStorage.getItem("bh-konver-onboarding-complete");
    
    if (!onboardingComplete) {
      // First time user - show onboarding after splash
      setShowOnboarding(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    
    if (!showOnboarding) {
      // Returning user - go straight to app
      setIsReady(true);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setIsReady(true);
  };

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} duration={1500} />;
  }

  // Show onboarding for first-time users
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Show main app
  if (isReady) {
    return <>{children}</>;
  }

  return null;
};

export default AppInitializer;
