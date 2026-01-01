import { motion } from "framer-motion";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({
  currentStep,
  totalSteps,
}: StepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center flex-shrink-0">
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all ${
                  step < currentStep
                    ? "bg-primary-500 border-primary-400 text-white"
                    : step === currentStep
                    ? "bg-gradient-to-br from-primary-500 to-secondary-500 border-primary-400 text-white shadow-glow-md"
                    : "bg-white/5 border-white/20 text-white/40"
                }`}
                animate={
                  step === currentStep
                    ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(97, 97, 216, 0)",
                          "0 0 20px 0 rgba(97, 97, 216, 0.6)",
                          "0 0 0 0 rgba(97, 97, 216, 0)",
                        ],
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: step === currentStep ? Infinity : 0,
                  ease: "easeInOut",
                }}
              >
                {step < currentStep ? "✓" : step}
              </motion.div>
              <p className="text-xs text-white/60 mt-2 hidden sm:block">
                {step === 1 && "Configuration"}
                {step === 2 && "Participants"}
                {step === 3 && "Groupes"}
              </p>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 bg-white/10 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500"
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX: step < currentStep ? 1 : 0,
                  }}
                  transition={{ duration: 0.5 }}
                  style={{ transformOrigin: "left" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
