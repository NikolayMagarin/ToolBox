import dotevn from 'dotenv';
import assert from 'assert';

dotevn.config();

function getEnvValue(key: string) {
  const val = process.env[key];
  assert(val, `Please set ${key} in .env file`);
  return val;
}

interface Config {
  env: 'production' | 'development';
  firebaseClientEmail: string;
  firebasePrivateKey: string;
  firebaseProjectId: string;
  groqApiKey: string;
  origin: string;
}

export const config: Config = {
  env: getEnvValue('NODE_ENV') === 'production' ? 'production' : 'development',
  firebaseClientEmail: getEnvValue('FIREBASE_CLIENT_EMAIL'),
  firebasePrivateKey: getEnvValue('FIREBASE_PRIVATE_KEY'),
  firebaseProjectId: getEnvValue('FIREBASE_PROJECT_ID'),
  groqApiKey: getEnvValue('GROQ_API_KEY'),
  origin: getEnvValue('ORIGIN'),
};
