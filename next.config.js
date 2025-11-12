// Injected content via Sentry wizard below
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  // Your normal Next.js config here
  sentry: {
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,
    telemetry: false,
  },
};

// Optional Sentry plugin settings (currently not used since disabled above)
const sentryWebpackPluginOptions = {
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

// Disable Sentry build-time upload (no CLI runs, avoids invalid token errors)
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);