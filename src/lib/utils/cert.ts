import crypto, { X509Certificate } from "crypto";
import * as forge from "node-forge";

import { P12Certificate } from "@/lib/models/auth";
import { readFile } from "fs/promises";
import { appConfig } from "@/config";
import { CertGenerationProvider } from "../models/cert";



export async function getGeneratedCertificate(altNames: string[], password: string, endpoint: string, provider: CertGenerationProvider): Promise<string> {

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      altNames,
      password,
      provider,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate certificate: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
  
}


export async function loadCertificate(certFile: string, encryptedCertPass: string): Promise<P12Certificate> {

  if (!certFile || !encryptedCertPass) {
    throw new Error("Certificate file and password are required");
  }

  const isBase64 = (str: string) => {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  };

  let buffer: Buffer;
  if (isBase64(certFile)) {
    buffer = Buffer.from(certFile, "base64");
  } else {
    buffer = await readFile(certFile);
  }

  const cert = await parseCertificate(buffer, encryptedCertPass);
  return cert;
}


export async function p12ToBase64(p12Cert: P12Certificate): Promise<string> {
  const x509 = await getX509Certficate(p12Cert);
  return x509.raw.toString("base64");
}


export function parseCertificate(
  buffer: Buffer<ArrayBufferLike>,
  encryptedCertPass: string,
): P12Certificate {
  const decryptedPass = decryptCertificatePassword(encryptedCertPass);
  const p12Asn1 = forge.asn1.fromDer(buffer.toString("binary"));
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, decryptedPass);

  return p12;
}


export function getX509Certficate(p12Cert: P12Certificate): X509Certificate {
  const certBags = p12Cert.getBags({ bagType: forge.pki.oids.certBag });
  const certBag = certBags[forge.pki.oids.certBag];
  if (!certBag || certBag.length === 0) {
    throw new Error("No certificate found in the provided P12 file");
  }

  const certChain: X509Certificate[] = certBag.map((bag) => {
    const cert = bag.cert;
    if (!cert) {
      throw new Error("Certificate is undefined");
    }
    return new X509Certificate(forge.pki.certificateToPem(cert));
  });

  // console.log("getX509Certficate() :: certChain:", certChain);

  if (certChain.length === 0) {
    throw new Error("No certificates found in the provided P12 file");
  }

  return certChain[certChain.length - 1];
}

export async function getPrivateKey(
  p12Cert: P12Certificate,
): Promise<forge.pki.PrivateKey | undefined> {
  const pkBags = p12Cert.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
  const pkBag = pkBags[forge.pki.oids.pkcs8ShroudedKeyBag];
  let pk: forge.pki.PrivateKey | undefined;
  if (pkBag && pkBag.length > 0) {
    pk = pkBag[0].key;
  }

  return pk;
}

export function getSubjectAltName(p12Cert: P12Certificate): string {
  const cert = getX509Certficate(p12Cert);
  const subjectAltName = cert.subjectAltName;
  if (!subjectAltName) {
    throw new Error("No subject alternative name found in the provided P12 file");
  }

  return subjectAltName;
}


export function encryptCertificatePassword(password: string): string {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    crypto.createHash("sha256").update(appConfig.authSecret).digest(),
    Buffer.alloc(16, 0)
  );

  let encrypted = cipher.update(password, "utf8", "base64");
  encrypted += cipher.final("base64");

  return encrypted;
}

export function decryptCertificatePassword(encryptedPassword: string): string {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    crypto.createHash("sha256").update(appConfig.authSecret).digest(),
    Buffer.alloc(16, 0)
  );

  let decrypted = decipher.update(encryptedPassword, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
