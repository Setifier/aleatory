import * as Sentry from "@sentry/react";

export const initSentry = () => {
  if (import.meta.env.DEV) {
    console.log("Sentry désactivé en dev");
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,

    // Environnement (dev, staging, prod)
    environment: import.meta.env.MODE,

    // Version de ton app (pour tracker les bugs par version)
    release: `aleatory@${import.meta.env.VITE_APP_VERSION || "1.0.0"}`,

    // % d'événements à envoyer (1.0 = 100%, 0.1 = 10%)
    tracesSampleRate: 1.0,

    // Replay des sessions (pour voir ce que l'utilisateur faisait avant le bug)
    replaysSessionSampleRate: 0.1, // 10% des sessions
    replaysOnErrorSampleRate: 1.0, // 100% quand il y a une erreur

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true, // Cache les textes sensibles
        blockAllMedia: true, // Bloque les images/vidéos
      }),
    ],

    tracePropagationTargets: ["localhost", /^https:\/\/.*\.supabase\.co/],

    // Ignore les erreurs communes non critiques
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
    ],
  });
};
