import { RequestHandler, Router } from 'express';
import { config } from '../config';
import axios from 'axios';
import { logger } from './logger';

export const selfPingRouter = Router();

const useSelfPingSecret: RequestHandler = (req, res, next) => {
  if (req.header('selfping-secret') === config.selfPingSecret) {
    next();
  } else {
    res.status(403).send('not allowed');
  }
};

const selfPingHandler: RequestHandler = (req, res) => {
  if (config.selfPingInterval) {
    setTimeout(selfPing, config.selfPingInterval);
  }
  res.status(200).send('selfpong');
};

export async function selfPing() {
  if (config.selfPingUrl && config.selfPingSecret) {
    try {
      await axios.get(config.selfPingUrl, {
        headers: {
          'selfping-secret': config.selfPingSecret,
        },
      });
    } catch {
      logger.error('[app] selfping failed');
    }
  }
}

selfPingRouter.get('/selfping', useSelfPingSecret, selfPingHandler);
