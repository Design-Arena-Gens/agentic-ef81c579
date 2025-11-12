export const BASE44_APP_ID =
  process.env.BASE44_APP_ID ?? process.env.NEXT_PUBLIC_BASE44_APP_ID ?? '690e7bf293df47111a4c12be';

export const BASE44_SERVER_URL =
  process.env.BASE44_SERVER_URL ??
  process.env.NEXT_PUBLIC_BASE44_SERVER_URL ??
  'https://app.base44.com';

export const BASE44_API_ROOT = `${BASE44_SERVER_URL}/api/apps/${BASE44_APP_ID}`;

export const DEFAULT_AGENT_SLUG =
  process.env.BASE44_DEFAULT_AGENT ??
  process.env.NEXT_PUBLIC_BASE44_DEFAULT_AGENT ??
  'support';
