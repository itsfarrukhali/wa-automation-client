import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled:
    Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) &&
    process.env.NODE_ENV === "production",
  environment:
    process.env.SENTRY_ENVIRONMENT ||
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
    process.env.NODE_ENV,
  tracesSampleRate: 0.05,
  beforeSend(event) {
    event.user = undefined;
    if (event.request) {
      event.request.data = undefined;
      event.request.cookies = undefined;
      event.request.query_string = undefined;
      event.request.headers = undefined;
      if (event.request.url) event.request.url = event.request.url.split("?", 1)[0];
    }
    return event;
  },
});
