import express, { Request, Response } from 'express';
import { config } from './config';
import { exchangeAuthCodeForAccessToken, getAuthUrl } from './services/authService';
import { OneNoteExtractor } from './services/oneNoteExtractor';

import { createLogger, LogLevel } from './utils/logger';

const logger = createLogger(LogLevel.DEBUG);


const app = express();

const debuggingDoNotExchangeAuthCodeForToken = false;

app.get('/microsoft-authorize', async (req: Request, res: Response) => {
  const authCode = req.query.code as string;
  console.log('authorize callback called, authCode: ', authCode);

  if (debuggingDoNotExchangeAuthCodeForToken) {
    return res.send(`
      <h1>Resolved auth code, but not exchanging auth code for token (debugging)</h1>
      <p>auth code: ${authCode}</p>
    `);
  }

  if (!authCode) {
    return res.status(400).send('Authorization code not found');
  }

  try {
    const accessToken: string = await exchangeAuthCodeForAccessToken(authCode);

    console.log('Access token:', accessToken);

    const oneNoteExtractor = new OneNoteExtractor(accessToken);
    // oneNoteExtractor.loadNotesAndBuildDatabase();
    //oneNoteExtractor.getAllPages();
    oneNoteExtractor.loadPagesContentAndBuildDatabase();


    res.send(`
      <h1>Authorization successful</h1>
      <p>You can now close this window</p>
    `);
  } catch (error) {
    console.error('Error exchanging code for token:', (error as any).response?.data || (error as Error).message);
    res.status(500).send('Failed to obtain access token');
  }
});

(
  async () => {
    try {
      console.log('To authorize the app, open the following URL in your browser:');
      console.log('\x1b[36m%s\x1b[0m', getAuthUrl());

      console.log('some other message');

      // const oneNoteExtractor = new OneNoteExtractor();
      // await oneNoteExtractor.checkPagesIntegrity();



      app.listen(config.port, () => {
        console.log(`Server for receiving authorization callbacks is running on http://localhost:${config.port}`);
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }
)();

