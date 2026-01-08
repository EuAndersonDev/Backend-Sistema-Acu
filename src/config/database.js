require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    url: process.env.DATABASE_URL,
    dialectOptions: (process.env.DB_SSL === 'true')
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : undefined,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    url: process.env.DATABASE_URL,
    dialectOptions: (process.env.DB_SSL === 'true')
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : undefined,
  }
};
