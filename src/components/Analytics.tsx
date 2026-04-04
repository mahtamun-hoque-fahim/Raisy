/**
 * Plausible Analytics — privacy-first, no cookies, GDPR compliant.
 * Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN in your env to activate.
 * Example: NEXT_PUBLIC_PLAUSIBLE_DOMAIN=raisy.app
 *
 * Docs: https://plausible.io/docs/nextjs-integration
 */

export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  return (
    <script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
    />
  );
}
