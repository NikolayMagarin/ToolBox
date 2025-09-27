import express from 'express';
import path from 'path';

export const router = express.Router();

router.use('/pictext', express.static(path.resolve('public', 'textOnImage')));
