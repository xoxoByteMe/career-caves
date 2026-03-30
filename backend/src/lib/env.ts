import dotenv from 'dotenv';

dotenv.config();

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: stripTrailingSlash(process.env.CORS_ORIGIN ?? 'http://localhost:5173'),
  supabaseUrl: stripTrailingSlash(requireEnv('SUPABASE_URL')),
  supabaseServiceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY').trim(),
  supabaseListingImagesBucket: (process.env.SUPABASE_LISTING_IMAGES_BUCKET ?? 'caves-images').trim(),
};
