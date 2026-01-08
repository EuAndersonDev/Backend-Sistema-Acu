const { Sequelize } = require('sequelize');
const dbConfig = require('./database');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

// Suporte a conexão via URL completa (DATABASE_URL)
// Preferir config.url (vindo de src/config/database.js) e cair para env
const databaseUrl = config.url || process.env.DATABASE_URL;

// Detecta necessidade de SSL (Render Postgres e similares)
const hostCandidate = databaseUrl || config.host || '';
const useSsl = (
  process.env.DB_SSL === 'true' ||
  hostCandidate.includes('render.com')
);

let sequelize;

if (databaseUrl) {
  // Usa a URL completa
  sequelize = new Sequelize(databaseUrl, {
    dialect: config.dialect || 'postgres',
    logging: config.logging,
    dialectOptions: useSsl
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : undefined,
  });
} else {
  // Usa parâmetros separados do arquivo de configuração
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      logging: config.logging,
      dialectOptions: useSsl
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : undefined,
    }
  );
}

module.exports = sequelize;
