export const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT ? +process.env.PORT : undefined,
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  BUCKET_NAME: process.env.BUCKET_NAME,
  URL_EXPIRATION_TIME: process.env.URL_EXPIRATION_TIME
    ? +process.env.URL_EXPIRATION_TIME
    : undefined,
  API_KEY: process.env.API_KEY ? process.env.API_KEY.split(',') : undefined,
});
