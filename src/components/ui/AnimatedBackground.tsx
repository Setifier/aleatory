interface AnimatedBackgroundProps {
  variant?: "mesh" | "gradient" | "minimal";
}

/**
 * Animated background — CSS keyframe animations only (no framer-motion).
 * CSS animations run on the browser compositor thread, off the JS main thread,
 * which is dramatically more efficient on mobile and low-RAM devices.
 * will-change: transform promotes each blob to its own GPU layer so the
 * blur filter is composited without re-triggering layout or paint.
 * prefers-reduced-motion: handled in index.css — animations stop automatically.
 */
export default function AnimatedBackground({
  variant = "mesh",
}: AnimatedBackgroundProps) {
  if (variant === "mesh") {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-900 via-primary-900 to-accent-950" />

        {/* Animated blobs — CSS keyframes defined in index.css */}
        <div className="blob-1 absolute -top-1/2 -left-1/4 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl" />
        <div className="blob-2 absolute top-1/4 -right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />
        <div className="blob-3 absolute bottom-1/4 left-1/3 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="blob-4 absolute -bottom-1/4 right-1/4 w-96 h-96 bg-accent-600/25 rounded-full blur-3xl" />

        {/* Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-accent-950/50 via-transparent to-transparent" />
      </div>
    );
  }

  if (variant === "gradient") {
    return (
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary-600 via-accent-900 to-secondary-700"
          style={{ backgroundSize: "200% 200%", animation: "gradientShift 20s linear infinite" }}
        />
      </div>
    );
  }

  // Minimal variant — fully static, zero animation cost
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-950 via-accent-900 to-primary-950" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
    </div>
  );
}
