# Backend Sistema ACU

Backend simples com Node.js, Express, PostgreSQL e Sequelize em arquitetura modular.

## 📋 Funcionalidades

- ✅ Autenticação JWT com bcrypt
- ✅ CRUD completo de produtos
- ✅ Todas as rotas protegidas (exceto login e registro)
- ✅ Arquitetura modular
- ✅ Validações de dados

## 🚀 Tecnologias

- Node.js
- Express
- PostgreSQL
- Sequelize ORM
- JWT (jsonwebtoken)
- Bcryptjs
- Dotenv
- Cors

## 📁 Estrutura do Projeto

```
Backend-Sistema-Acu/
├── src/
│   ├── config/
│   │   ├── database.js       # Configurações do banco
│   │   └── sequelize.js      # Instância do Sequelize
│   ├── controllers/
│   │   ├── AuthController.js # Controller de autenticação
│   │   └── ProductController.js # Controller de produtos
│   ├── middlewares/
│   │   └── auth.js           # Middleware de autenticação JWT
│   ├── models/
│   │   ├── User.js           # Model de usuário
│   │   ├── Product.js        # Model de produto
│   │   └── index.js          # Exportação dos models
│   ├── routes/
│   │   ├── auth.routes.js    # Rotas de autenticação
│   │   ├── product.routes.js # Rotas de produtos
│   │   └── index.js          # Agregador de rotas
│   └── server.js             # Servidor principal
├── .env.example              # Exemplo de variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

## ⚙️ Instalação

1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd Backend-Sistema-Acu
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_acu
DB_USER=postgres
DB_PASS=sua_senha

JWT_SECRET=sua_chave_secreta_jwt_aqui_mude_em_producao
JWT_EXPIRES_IN=7d
```

4. Crie o banco de dados PostgreSQL
```bash
# No PostgreSQL, execute:
CREATE DATABASE sistema_acu;
```

5. Inicie o servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📡 Endpoints da API

### Autenticação

#### Registrar usuário
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nome do Usuário",
  "email": "usuario@email.com",
  "password": "senha123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

#### Obter dados do usuário logado (Protegida)
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Produtos (Todas protegidas)

#### Listar todos os produtos
```http
GET /api/products
Authorization: Bearer {token}
```

#### Obter um produto
```http
GET /api/products/:id
Authorization: Bearer {token}
```

#### Criar produto
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nome do Produto",
  "description": "Descrição do produto",
  "price": 99.99,
  "stock": 10
}
```

#### Atualizar produto
```http
PUT /api/products/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Novo Nome",
  "description": "Nova descrição",
  "price": 149.99,
  "stock": 20
}
```

#### Deletar produto
```http
DELETE /api/products/:id
Authorization: Bearer {token}
```

## 🔒 Segurança

- Todas as senhas são criptografadas com bcrypt (10 salt rounds)
- Autenticação via JWT com expiração configurável
- Todas as rotas de produtos são protegidas
- Validação de dados nas requisições

## 📝 Models

### User
- id (PK, auto-increment)
- name (string, required)
- email (string, required, unique)
- password (string, required, hashed)
- createdAt
- updatedAt

### Product
- id (PK, auto-increment)
- name (string, required)
- description (text, optional)
- price (decimal, required, min: 0)
- stock (integer, default: 0, min: 0)
- createdAt
- updatedAt

## 🛠️ Scripts

```bash
npm start      # Inicia o servidor em produção
npm run dev    # Inicia o servidor em desenvolvimento com nodemon
```

## 📌 Observações

- O Sequelize está configurado com `sync({ alter: true })` para atualizar as tabelas automaticamente
- Para ambiente de produção, considere usar migrations do Sequelize
- Lembre-se de alterar o `JWT_SECRET` em produção para uma chave forte e segura

## 👨‍💻 Autor

Anderson Reis
