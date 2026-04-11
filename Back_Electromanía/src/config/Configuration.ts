const configuration = () => ({
  port: process.env.PORT || 3000,
  storage: {
    driver: process.env.STORAGE_DRIVER,
  },
  database: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    type: process.env.DATABASE_TYPE,
    name: process.env.DATABASE_NAME,
    syncronize: process.env.DATABASE_STYNCHRONIZE,
  },
  bcrypt: {
    saltRounds: Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
  },
  jwtConstants: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION,
  },
  webSiteDomain: {
    url: process.env.WEBSITE_DOMAIN || 'http://localhost',
    port: process.env.WEBSITE_PORT || 80,
  },
  apiDomain: {
    url: process.env.API_DOMAIN || 'http://localhost:3000',
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
  },
  cloudflare: {
    account_id: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    access_key: process.env.CLOUDFLARE_ACCESS_KEY_ID || '',
    secret_key: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '',
    r2_endpoint: process.env.R2_ENDPOINT || '',
    buckets: {
      products: process.env.R2_PUBLIC_BUCKET_NAME || '',
      receipts: process.env.R2_PRIVATE_BUCKET_NAME || '',
    },
    publicUrl: process.env.R2_PUBLIC_ENDPOINT || '',
  },
  mail: {
    host: process.env.MAIL_HOST || '',
    port: process.env.MAIL_PORT || '',
    user: process.env.MAIL_USER || '',
    password: process.env.MAIL_PASSWORD || '',
    from: process.env.MAIL_FROM || '',
  },
  gotenberg: {
    url: process.env.GOTENBERG_URL || 'http://localhost:3001',
  },
});
export default configuration;
