import 'express-session';


// Merge with the existing SessionData interface from express-session
declare module 'express-session' {
  interface SessionData {
    user?: { id: number; name: string };
    fhirServer?: string;
    headers?: Record<string, string>[];

    /**
     * ID of the client being used by this session
     */
    currentClient?: string;

    currentToken?: string;

    state?: string;
    codeVerifier?: string;
  }
}
