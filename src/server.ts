import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import 'dotenv/config';
import { appConfig } from '@/config';

import session from 'express-session';
import cookieParser from 'cookie-parser';

import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './api';

import { createRequire } from 'module';
import { initDatabase } from '@/db';
import { isDevMode } from '@angular/core';
const require = createRequire(import.meta.url);


const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');


const server = express();
const angularApp = new AngularNodeAppEngine();

console.log('NODE_CONFIG:', JSON.parse(process.env.NODE_CONFIG || '{}'));

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());

// Initialize the database and session store if this module is the main entry point or in development mode
// This prevents a database from being created when building
if (isMainModule(import.meta.url) || isDevMode()) {
  /**
   * Initialize the database
   */
  await initDatabase();
    
  /**
   * Session management
   */
  const SQLiteStore = require('connect-sqlite3')(session);
  server.use(session({
    store: new SQLiteStore({
      db: appConfig.database.url.replace('file:', ''),
      table: 'sessions',
    }),
    secret: appConfig.authSecret,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: appConfig.env === 'production',
      maxAge: 60 * 60 * 1000,
    },
  }));
}



/**
 * Use the API router for all /api endpoints (things not to be handled by the Angular router).
 */
server.use('/api', apiRouter);

/**
 * Serve static files from /browser
 */
server.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);


/**
 * Handle all other requests by rendering the Angular application.
 */
server.all('/{*splat}', async (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});


/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {

  const port = appConfig.port || 4000;
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(server);
