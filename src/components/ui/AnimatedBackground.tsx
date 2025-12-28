import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  variant?: "mesh" | "gradient" | "minimal";
}

export default function AnimatedBackground({
  variant = "mesh",
}: AnimatedBackgroundProps) {
  if (variant === "mesh") {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-900 via-primary-900 to-accent-950" />

        {/* Animated mesh gradients */}
        <motion.div
          className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute top-1/4 -right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute -bottom-1/4 right-1/4 w-96 h-96 bg-accent-600/25 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -60, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-accent-950/50 via-transparent to-transparent" />
      </div>
    );
  }

  if (variant === "gradient") {
    return (
      <div className="fixed inset-0 -z-10">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary-600 via-accent-900 to-secondary-700"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundSize: "200% 200%",
          }}
        />
      </div>
    );
  }

  // Minimal variant
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-950 via-accent-900 to-primary-950" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
    </div>
  );
}
