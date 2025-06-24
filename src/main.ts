import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { apiKeysMiddleware } from './shared/apiKeys';
import { logger } from './shared/logger';
import { router as adminRouter } from './services/admin';
import { ApiError } from './shared/ApiError';

const app = express();

app.use(cors());
app.use('/:service/api', apiKeysMiddleware);
app.use(express.json());

app.use(adminRouter);

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
