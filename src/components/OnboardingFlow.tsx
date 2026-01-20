import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  ArrowRight, 
  Check,
  Shield,
  Zap,
  Globe
} from "lucide-react";

interface OnboardingFlowProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    id: 1,
    title: "Dobrodošli u BH Konver",
    description: "Vaš digitalni alat za brzu i sigurnu konverziju dokumenata.",
    icon: <FileText className="w-16 h-16 text-primary" />,
    features: [
      { icon: <Zap className="w-5 h-5" />, text: "Brza konverzija" },
      { icon: <Shield className="w-5 h-5" />, text: "Sigurna obrada" },
      { icon: <Globe className="w-5 h-5" />, text: "Lokalizovano za BiH" },
    ],
  },
  {
    id: 2,
    title: "Konvertujte sve formate",
    description: "Podržavamo video, audio, slike, PDF i dokumente.",
    icon: null,
    formats: [
      { icon: <Video className="w-8 h-8" />, label: "Video", color: "bg-red-100 text-red-600" },
      { icon: <Music className="w-8 h-8" />, label: "Audio", color: "bg-purple-100 text-purple-600" },
      { icon: <Image className="w-8 h-8" />, label: "Slike", color: "bg-green-100 text-green-600" },
      { icon: <FileText className="w-8 h-8" />, label: "PDF", color: "bg-blue-100 text-blue-600" },
    ],
  },
  {
    id: 3,
    title: "Besplatni alati",
    description: "Konverter jedinica i valuta dostupni bez prijave!",
    icon: null,
    benefits: [
      "Konverter valuta (BAM ↔ EUR, USD...)",
      "Konverter jedinica (km, kg, °C...)",
      "Bez registracije potrebne",
      "Potpuno besplatno",
    ],
  },
];

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as complete
      localStorage.setItem("bh-konver-onboarding-complete", "true");
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem("bh-konver-onboarding-complete", "true");
    onComplete();
  };

  const step = onboardingSteps[currentStep];

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-background">
      {/* Skip button */}
      <div className="absolute top-4 right-4 z-10">
        <Button variant="ghost" size="sm" onClick={handleSkip}>
          Preskoči
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="max-w-md w-full text-center"
          >
            {/* Step 1: Welcome */}
            {step.id === 1 && (
              <>
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6 flex justify-center"
                >
                  {step.icon}
                </motion.div>
                <h1 className="text-2xl font-bold mb-3">{step.title}</h1>
                <p className="text-muted-foreground mb-8">{step.description}</p>
                <div className="flex flex-col gap-3">
                  {step.features?.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3"
                    >
                      <div className="text-primary">{feature.icon}</div>
                      <span className="font-medium">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {/* Step 2: Formats */}
            {step.id === 2 && (
              <>
                <h1 className="text-2xl font-bold mb-3">{step.title}</h1>
                <p className="text-muted-foreground mb-8">{step.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  {step.formats?.map((format, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className={`${format.color} rounded-xl p-6 flex flex-col items-center gap-2`}
                    >
                      {format.icon}
                      <span className="font-medium">{format.label}</span>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {/* Step 3: Free tools */}
            {step.id === 3 && (
              <>
                <h1 className="text-2xl font-bold mb-3">{step.title}</h1>
                <p className="text-muted-foreground mb-8">{step.description}</p>
                <div className="flex flex-col gap-3 text-left">
                  {step.benefits?.map((benefit, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex items-center gap-3 bg-green-50 text-green-700 rounded-lg p-3"
                    >
                      <Check className="w-5 h-5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-6 pb-8">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {onboardingSteps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentStep 
                  ? "bg-primary w-6" 
                  : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Next button */}
        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleNext}
        >
          {currentStep === onboardingSteps.length - 1 ? (
            "Započnite"
          ) : (
            <>
              Dalje
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingFlow;
