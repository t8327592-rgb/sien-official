import { isIP } from "node:net";

type HeaderSource = Headers | Record<string, string | string[] | undefined>;
export function requestIdentity(headers: HeaderSource, fallback: string) {
  // Configure only a header overwritten by the deployment's trusted proxy.
  // Client-controlled forwarded headers are ignored by default.
  const configured = process.env.TRUSTED_CLIENT_IP_HEADER?.toLowerCase();
  if (configured && ["x-forwarded-for", "x-real-ip", "x-vercel-forwarded-for", "cf-connecting-ip"].includes(configured)) {
    const value = headers instanceof Headers ? headers.get(configured) : headers[configured];
    const ip = (Array.isArray(value) ? value[0] : value)?.split(",")[0]?.trim();
    if (ip && isIP(ip)) return `ip:${ip}`;
  }
  return `fallback:${fallback.trim().toLowerCase()}`;
}
