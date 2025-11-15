// Injected content via Sentry wizard below
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  // Dein normales Next.js-Config-Objekt
  // Der 'sentry: {}' Block wurde von hier entfernt.
};

const sentryWebpackPluginOptions = {
  // Sentry-spezifische Optionen (hierher verschoben)
  disableServerWebpackPlugin: true,
  disableClientWebpackPlugin: true,
  telemetry: false,

  // Deine bestehenden Webpack-Plugin-Optionen
  org: "artisancms",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
};

// Sentry-Konfiguration anwenden
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
// --- ENDE DATEI ---//
