import { Request } from "express";


export function getBaseUrl(req: Request): string {
  const forwardedHost = req.headers['x-forwarded-host'] || req.get('host');
  const forwardedProto = req.headers['x-forwarded-proto'] || req.protocol;
  const baseUrl = `${forwardedProto}://${forwardedHost}`;
  return baseUrl;
}

export function getFullUrl(req: Request): string {
  const baseUrl = getBaseUrl(req);
  return `${baseUrl}${req.originalUrl}`;
}
