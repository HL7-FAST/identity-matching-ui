import { getCurrentClient, handleNoClient } from '@/lib/utils/client';
import { getBaseUrl } from '@/lib/utils/http';
import { CLIENT_ASSERTION_TYPE, getAccessToken, getClientAssertion } from '@/lib/utils/udap';
import { Router } from 'express';
import crypto from 'crypto';
import { loadCertificate } from '@/lib/utils/cert';

export const authRouter = Router();


/**
 * Login endpoint for authorization code flow.
 * This endpoint will redirect the user to the authorization endpoint of the current client.
 */
authRouter.get('/login', async (req, res) => {

  // const client = await getCurrentClient(req, true, 'authorization_code');
  const client = await getCurrentClient(req, false);
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
 * Logout endpoint for authorization code flow.
 * This revokes the current access token
 */
authRouter.get('/logout', async (req, res) => {

  // const client = await getCurrentClient(req, true, 'authorization_code');
  const client = await getCurrentClient(req, false);
  if (!client) {
    handleNoClient(req, res);
    return;
  }

  if (client.grantTypes === 'client_credentials') {
    res.status(400);
    res.json({ message: 'Current client for this session does not support authorization code flow.' });
    return;
  }


  const token = req.session.currentToken;

  // only need to do anything if we have a token
  if (token) {
    
    // TODO: investigate further
    // revoke the token if we have a known revocation endpoint
    // if (client.revocationEndpoint) {
    //   // get client assertion
    //   const cert = await loadCertificate(client.certificate, client.certificatePass || "");
    //   const assertion = await getClientAssertion(client.clientId, client.tokenEndpoint, cert);
    //   try {
    //     await fetch(client.revocationEndpoint, {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //       },
    //       body: new URLSearchParams({
    //         token: token,
    //         token_type_hint: 'access_token',
    //         client_assertion: assertion,
    //         client_assertion_type: CLIENT_ASSERTION_TYPE,
    //       }).toString(),
    //     });
    //   } catch (error) {
    //     console.error('Error revoking token:', error);
    //   }
    // }

    // clear the token from the session
    req.session.currentToken = undefined;
  }

  res.redirect(req.get('Referrer') || req.get('Referer') || getBaseUrl(req));

});



/**
 * Callback endpoint for authorization code flow.
 */
authRouter.get('/callback', async (req, res) => {

  // const client = await getCurrentClient(req, true, 'authorization_code');
  const client = await getCurrentClient(req, false);
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
 * 
 */
authRouter.get('/userinfo', async (req, res) => {
  // console.log('User info endpoint', req.session, req.session.id);

  if (!req.session.currentToken) {
    res.status(204).send();
    return;
  }

  const client = await getCurrentClient(req, false);
  if (!client) {
    handleNoClient(req, res);
    return;
  }

  if (!client.userinfoEndpoint) {
    res.status(200).json({
      name: 'Unknown User',
    });
    return;
  }
  
  try {
    const userInfo = await fetch(client.userinfoEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${req.session.currentToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (userInfo.status !== 200) {
      res.status(userInfo.status).json({ message: 'Error getting user info' });
      return;
    }
    const userInfoJson = await userInfo.json();
    res.status(200).json(userInfoJson);
  }
  catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({ message: 'Error getting user info', error });
    return;
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