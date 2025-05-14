import { appConfig } from "@/config";
import { Request } from "express";


export interface CustomHeader {
  key: string;
  value: string;
}

export function getBaseUrl(req: Request): string {
  if (appConfig.appUrl) {
    return trimSlash(appConfig.appUrl);
  }
  const forwardedHost = req.headers['x-forwarded-host'] || req.get('host');
  const forwardedProto = req.headers['x-forwarded-proto'] || req.protocol;
  const baseUrl = `${forwardedProto}://${forwardedHost}`;
  return baseUrl;
}

export function getFullUrl(req: Request): string {
  const baseUrl = getBaseUrl(req);
  return `${baseUrl}${req.originalUrl}`;
}

export function trimSlash(url: string): string {
  if (url.endsWith('/')) {
    return url.slice(0, -1);
  }
  return url;
}