require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const db = require('./models');
const { FORCE } = require('sequelize/lib/index-hints');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api', routes);

// Sincronizar banco de dados e iniciar servidor
// Render injeta a porta via process.env.PORT. Não fixe valores.
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Testar conexão com banco de dados
    await db.sequelize.authenticate();
    console.log('✓ Conexão com banco de dados estabelecida com sucesso.');

    // Sincronizar modelos (criar tabelas)
    // Use { force: true } para recriar tabelas (CUIDADO: apaga dados!)
    // Use { alter: true } para atualizar estrutura mantendo dados
    await db.sequelize.sync();
    console.log('✓ Modelos sincronizados com banco de dados.');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`✓ Servidor rodando na porta ${PORT}`);
      // Comentado para reduzir ruído em produção
      // console.log(`✓ Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('✗ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
