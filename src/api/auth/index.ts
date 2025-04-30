import { getCurrentClient, handleNoClient } from '@/lib/utils/client';
import { getBaseUrl } from '@/lib/utils/http';
import { getAccessToken } from '@/lib/utils/udap';
import { Router } from 'express';
import crypto from 'crypto';

export const authRouter = Router();


/**
 * Login endpoint for authorization code flow.
 * This endpoint will redirect the user to the authorization endpoint of the current client.
 */
authRouter.get('/login', async (req, res) => {

  const client = await getCurrentClient(req, true, 'authorization_code');
  if (!client) {
    handleNoClient(req, res);
    return;
  }

  if (client.grantTypes === 'client_credentials') {
    res.status(400);
    res.json({ message: 'Current client for this session does not support authorization code flow.' });
    return;
  }

  if (!client.authorizationEndpoint) {
    res.status(400);
    res.json({ message: 'Current client for this session does not have an authorization endpoint.' });
    return;
  }

  const callbackUrl = req.get('Referrer') || req.get('Referer') || getBaseUrl(req);
  res.cookie('callbackUrl', callbackUrl, {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'strict',
  });
  const redirectUrl = getBaseUrl(req) + '/api/auth/callback';


  
  const state = crypto.randomBytes(16).toString('hex');

  // Generate a code verifier and code challenge for PKCE
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  // Store codeVerifier and state in session for later verification
  req.session.codeVerifier = codeVerifier;
  req.session.state = state;
  const authUrl = `${client.authorizationEndpoint}?response_type=code&client_id=${client.clientId}&redirect_uri=${redirectUrl}&scope=${client.scopesGranted}&aud=${client.fhirBaseUrl}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  // console.log('Redirecting to auth URL:', authUrl);

  res.redirect(authUrl);
});



/**
 * Callback endpoint for authorization code flow.
 */
authRouter.get('/callback', async (req, res) => {

  const client = await getCurrentClient(req, true, 'authorization_code');
  if (!client) {
    handleNoClient(req, res);
    return;
  }

  try {
    const token = await getAccessToken(req, client);
  } catch (error) {
    console.error('Error getting access token:', error);
    res.status(500).json({ message: 'Error getting access token', error });
    return;
  }

  res.redirect(req.cookies?.callbackUrl || getBaseUrl(req));

});


/**
 * User info endpoint.
 * This endpoint will return the user info from the session.
 */
authRouter.get('/userinfo', async (req, res) => {
  // console.log('User info endpoint', req.session, req.session.id);
  
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});



/**
 * Returns the current access token for the current session. (FOR TESTING PURPOSES ONLY)
 */
authRouter.get('/token', async (req, res) => {
  if (req.session.currentToken) {
    res.json({ token: req.session.currentToken });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});