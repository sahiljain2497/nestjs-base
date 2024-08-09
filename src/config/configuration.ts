export default () => ({
  PORT: parseInt(process.env.PORT, 10) || 3000,
  MONGO_URI: process.env.MONGO_URI,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'lovedogcat',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_VERIFICATION_SERVICE_ID: process.env.TWILIO_VERIFICATION_SERVICE_ID,
});
