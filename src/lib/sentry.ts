import * as Sentry from "@sentry/react";

export const initSentry = () => {
  if (import.meta.env.DEV) {
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: `aleatory@${import.meta.env.VITE_APP_VERSION || "1.0.0"}`,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    tracePropagationTargets: ["localhost", /^https:\/\/.*\.aleatory\.fr/, /^https:\/\/.*\.supabase\.co/],

    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
    ],
  });
};
