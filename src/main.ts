import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { apiKeysMiddleware } from './shared/apiKeys';
import { logger } from './shared/logger';
import { router as adminRouter } from './services/admin';
import { router as linksRouter } from './services/linkShortener';
import { router as aiProxyRouter } from './services/aiProxy';
import { ApiError } from './shared/ApiError';

const app = express();

app.get('/ping', (req, res) => res.status(200).send('pong'));

app.use(cors());
app.use('/:service/api', apiKeysMiddleware);
app.use(express.json());

app.use(adminRouter);
app.use(linksRouter);
app.use(aiProxyRouter);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ApiError) {
    res.status(error.code).json({ error: error.message });
  } else if (error instanceof Error) {
    logger.error('[app] ' + error.message, error);
    res.status(500).json({ error: error.message });
  } else {
    logger.error('[app] ' + error?.message, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(80, () => {
  logger.info('[app] server started');
});
