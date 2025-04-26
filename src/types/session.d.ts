import 'express-session';


// Merge with the existing SessionData interface from express-session
declare module 'express-session' {
  interface SessionData {
    user?: { id: number; name: string };
  }
}
