import { X509Certificate } from "crypto";
import * as forge from "node-forge";

import { P12Certificate } from "@/lib/models/auth";
import { readFile } from "fs/promises";



export async function getGeneratedCertificate(altNames: string[], password: string, endpoint: string): Promise<string> {

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      altNames,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate certificate: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
  
}


export async function loadCertificate(certFile: string, certPassword: string): Promise<P12Certificate> {

  if (!certFile || !certPassword) {
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

  const cert = await parseCertificate(buffer, certPassword);
  return cert;
}


export async function p12ToBase64(p12Cert: P12Certificate): Promise<string> {
  const x509 = await getX509Certficate(p12Cert);
  return x509.raw.toString("base64");
}


export async function parseCertificate(
  buffer: Buffer<ArrayBufferLike>,
  password: string,
): Promise<P12Certificate> {
  const p12Asn1 = forge.asn1.fromDer(buffer.toString("binary"));
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

  return p12;
}


export async function getX509Certficate(p12Cert: P12Certificate): Promise<X509Certificate> {
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
