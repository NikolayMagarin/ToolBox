import dotevn from 'dotenv';
import assert from 'assert';

dotevn.config();

function getEnvValue(key: string, optional: true): string | undefined;
function getEnvValue(key: string, optional?: false): string;
function getEnvValue(key: string, optional = false) {
  const val = process.env[key];
  if (optional) return val;
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
  selfPingUrl: string | null;
  selfPingSecret: string | null;
  selfPingInterval: number | null;
}

export const config: Config = {
  env: getEnvValue('NODE_ENV') === 'production' ? 'production' : 'development',
  firebaseClientEmail: getEnvValue('FIREBASE_CLIENT_EMAIL'),
  firebasePrivateKey: getEnvValue('FIREBASE_PRIVATE_KEY'),
  firebaseProjectId: getEnvValue('FIREBASE_PROJECT_ID'),
  groqApiKey: getEnvValue('GROQ_API_KEY'),
  origin: getEnvValue('ORIGIN'),
  selfPingUrl: getEnvValue('SELF_PING_URL', true) || null,
  selfPingSecret: getEnvValue('SELF_PING_SECRET', true) || null,
  selfPingInterval: Number(getEnvValue('SELF_PING_INTERVAL', true)) || null,
};
