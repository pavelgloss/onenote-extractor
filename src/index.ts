import express, { Request, Response } from 'express';
import { config } from './config';
import { exchangeAuthCodeForAccessToken, getAuthUrl } from './services/authService';
import { OneNoteExtractor } from './services/oneNoteExtractor';
import { logger } from './utils/logger';
import { OpenAIService } from './services/OpenAIService';



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

    // caution: this will load all notes and pages, and build the database
    // oneNoteExtractor.loadNotesAndBuildDatabase();
    // ------------------------------------------------------------------

    oneNoteExtractor.loadPagesContentAndContinueBuildingDatabase();

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

      // await oneNoteExtractor.checkPagesIntegrity();
      // oneNoteExtractor.createHtmlPages();
      
      logger.info("                                                                                                  ");
      logger.info("********************************** NEW START *****************************************************");
      logger.info("..................................................................................................");
      
      
      // Initialize the service with a system prompt
      const openAIService = new OpenAIService(
        `You are an AI specialized in analyzing and categorizing content from OneNote pages. You are consise, accurate and structured.`
      );
      
      
      const oneNoteExtractor = new OneNoteExtractor();
      oneNoteExtractor.enrichContentWithClassification(openAIService);
      
      
      // console.log('Tell me jokes about Chuck Norris');
//      const joke = await openAIService.generateResponse("Tell me jokes about Chuck Norris");
      // console.log(joke);



      app.listen(config.port, () => {
        console.log(`Server for receiving authorization callbacks is running on http://localhost:${config.port}`);
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }
)();

