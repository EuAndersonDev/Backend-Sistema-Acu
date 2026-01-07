# 🛒 Backend Ecommerce API - Sistema ACU

Backend profissional de ecommerce com **Mercado Pago integrado**, desenvolvido em Node.js com arquitetura em **3 camadas** (Controller → Service → Repository).

## ✨ Funcionalidades

### Autenticação
- ✅ Registro de usuários com bcrypt
- ✅ Login com JWT tokens
- ✅ Proteção de rotas com middleware de autenticação

### Gestão de Produtos
- ✅ CRUD completo de produtos
- ✅ Controle de estoque
- ✅ Preços dinâmicos

### Carrinho de Compras
- ✅ Carrinho único e ativo por usuário
- ✅ Congelamento de preços ao adicionar item
- ✅ Atualização automática de total

### Pedidos
- ✅ Checkout com endereço de entrega
- ✅ Histórico de pedidos
- ✅ Status de pedido em tempo real
- ✅ Cancelamento de pedidos

### Pagamentos com Mercado Pago
- ✅ **4 métodos de pagamento**: Cartão Crédito, Cartão Débito, PIX, Transferência
- ✅ **Preferências** com items, payer, back_urls, notification_url
- ✅ **Webhooks** automáticos para notificações de pagamento
- ✅ **Refundos** integrados
- ✅ **Consulta de status** em tempo real
- ✅ Mapeamento de status Mercado Pago ↔ Sistema

## 🚀 Tecnologias

```
Backend:
  • Node.js 16+
  • Express.js
  • PostgreSQL + Sequelize ORM
  • JWT (jsonwebtoken)
  • bcryptjs
  
Pagamentos:
  • Mercado Pago SDK
  • Webhooks
  
DevOps:
  • Docker & Docker Compose
  • ngrok (webhooks em dev)
```

## 📁 Estrutura do Projeto

```
Backend-Sistema-Acu/
├── src/
│   ├── config/
│   │   ├── database.js              # Configuração Sequelize
│   │   ├── sequelize.js             # Conexão DB
│   │   └── mercado-pago.js          # Configuração Mercado Pago
│   │
│   ├── models/                      # Modelos de dados (Sequelize)
│   │   ├── index.js                 # Definições de relacionamentos
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   ├── CartItem.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   └── Payment.js
│   │
│   ├── repositories/                # Camada de acesso a dados
│   │   ├── CartRepository.js        # Queries do carrinho
│   │   ├── OrderRepository.js       # Queries de pedidos
│   │   └── PaymentRepository.js     # Queries de pagamentos
│   │
│   ├── services/                    # Lógica de negócio
│   │   ├── CartService.js           # Regras de carrinho
│   │   ├── OrderService.js          # Regras de pedidos
│   │   └── PaymentService.js        # Integração Mercado Pago
│   │
│   ├── controllers/                 # Handlers HTTP
│   │   ├── AuthController.js
│   │   ├── ProductController.js
│   │   ├── CartController.js
│   │   ├── OrderController.js
│   │   └── PaymentController.js
│   │
│   ├── routes/                      # Definição de endpoints
│   │   ├── index.js                 # Aggregador de rotas
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   └── payment.routes.js
│   │
│   ├── middlewares/
│   │   └── auth.js                  # JWT middleware
│   │
│   └── server.js                    # Entry point
│
├── docker-compose.yml               # Orquestração containers
├── Dockerfile                       # Build da aplicação
├── .env.example                     # Variáveis de ambiente
├── ecommerce-requests.http          # 33+ exemplos de testes
├── ECOMMERCE_GUIDE.md               # Guia completo
├── package.json
└── README.md
```

## 🛠️ Setup Inicial

### Pré-requisitos
- Docker & Docker Compose
- Node.js 16+ (se rodar localmente)
- Conta Mercado Pago

### 1️⃣ Clonar e preparar
```bash
git clone <repo-url>
cd Backend-Sistema-Acu
cp .env.example .env
```

### 2️⃣ Configurar variáveis
Editar `.env` com:
```env
# Database
DB_HOST=postgres
DB_USER=postgres
DB_PASSWORD=postgres123
DB_NAME=ecommerce_db

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=APP_USR_xxxx...
MERCADO_PAGO_NOTIFICATION_URL=https://seu-dominio.com/api/payments/webhook
```

### 3️⃣ Iniciar com Docker
```bash
docker compose up -d

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f api
```

### 4️⃣ Testar API
```bash
# Abrir ecommerce-requests.http no VS Code
# Usar extensão "REST Client" para executar requests
```

## 📚 Documentação

### Guia Completo
Veja [ECOMMERCE_GUIDE.md](./ECOMMERCE_GUIDE.md) para:
- ✅ Arquitetura detalhada
- ✅ Fluxo de pagamento Mercado Pago
- ✅ Configuração de webhooks
- ✅ Setup ngrok para teste local
- ✅ Deployment em produção

### Exemplos de Requests
Veja [ecommerce-requests.http](./ecommerce-requests.http) com **33+ exemplos** cobrindo:
- Fase 1: Auth (register, login, profile)
- Fase 2: Produtos (CRUD)
- Fase 3: Carrinho (add, remove, view)
- Fase 4: Pedidos (checkout, list, details)
- Fase 5: Pagamentos Mercado Pago (4 métodos)
- Fase 6: Webhooks (aprovado, recusado, pendente)
- Fase 7: Refunds & Cancelamentos
- Fase 8: Erros & Edge cases
- Fase 9: Operações adicionais

## 🔌 Endpoints Principais

### Autenticação
```
POST   /api/auth/register              # Registrar usuário
POST   /api/auth/login                 # Login e obter token
GET    /api/auth/me                    # Perfil do usuário
```

### Produtos
```
GET    /api/products                   # Listar todos
POST   /api/products                   # Criar
PUT    /api/products/{id}              # Atualizar
DELETE /api/products/{id}              # Deletar
```

### Carrinho
```
GET    /api/cart                       # Ver carrinho ativo
POST   /api/cart/items                 # Adicionar item
DELETE /api/cart/items/{itemId}        # Remover item
DELETE /api/cart                       # Limpar carrinho
```

### Pedidos
```
POST   /api/orders                     # Checkout (criar order)
GET    /api/orders                     # Listar pedidos
GET    /api/orders/{id}                # Detalhes do pedido
PATCH  /api/orders/{id}/cancel         # Cancelar pedido
```

### Pagamentos (Mercado Pago)
```
POST   /api/payments                   # Iniciar pagamento
GET    /api/payments/{id}              # Status do pagamento
GET    /api/payments/order/{orderId}   # Histórico de pagamentos
POST   /api/payments/{id}/refund       # Reembolsar
POST   /api/payments/webhook           # Webhook Mercado Pago
```

## 🎯 Fluxo Típico de Compra

```
1. Cliente faz registro
   POST /api/auth/register
   
2. Cliente visualiza produtos
   GET /api/products
   
3. Cliente adiciona ao carrinho (3 produtos)
   POST /api/cart/items × 3
   
4. Cliente faz checkout
   POST /api/orders
   ↓ Order criado em PENDING_PAYMENT
   ↓ Carrinho marcado como COMPLETED
   
5. Cliente inicia pagamento
   POST /api/payments
   ↓ Preference criada no Mercado Pago
   ↓ Retorna link para redirecionar
   
6. Cliente completa pagamento (no Mercado Pago)
   
7. Mercado Pago envia webhook
   POST /api/payments/webhook
   ↓ Payment status → APPROVED
   ↓ Order status → PAID
   ↓ Processamento do pedido
```

## 💳 Métodos de Pagamento (Mercado Pago)

| Método | Tipo | Parcelamento | Tempo | Juros |
|--------|------|--------------|-------|-------|
| Cartão Crédito | credit_card | Até 12x | Imediato | Configurável |
| Cartão Débito | debit_card | À vista | Imediato | Não |
| PIX | pix | À vista | Instantâneo | Não |
| Transferência | bank_transfer | À vista | 1-2 dias | Não |

## 🧪 Testando com REST Client

### VS Code Extension
```
1. Instalar: REST Client (Huachao Mao)
2. Abrir: ecommerce-requests.http
3. Clicar: "Send Request"
```

### CURL (Linux/Mac)
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@test.com","password":"123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@test.com","password":"123"}'

# List products (com token)
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3000/api/products
```

## 🌐 Mercado Pago - Setup Webhooks

### Desenvolvimento (ngrok)
```bash
# Terminal 1: Iniciar servidor
docker compose up -d

# Terminal 2: Expor com ngrok
ngrok http 3000

# Cópia URL: https://abc123.ngrok.io

# Dashboard Mercado Pago:
# Painel → Notificações → Adicionar webhook
# URL: https://abc123.ngrok.io/api/payments/webhook
```

### Produção
```
1. Domínio com HTTPS obrigatório
2. URL: https://seu-dominio.com/api/payments/webhook
3. Configurar em Dashboard Mercado Pago
4. Mercado Pago enviará webhooks automaticamente
```

## 📋 Checklist de Deploy

- [ ] Credenciais Mercado Pago obtidas (Access Token + Public Key)
- [ ] `.env` preenchido com valores de produção
- [ ] Domínio apontado para servidor (DNS)
- [ ] SSL instalado (Let's Encrypt)
- [ ] Webhook URL configurada em Dashboard MP
- [ ] Docker containers inicializados
- [ ] Banco de dados migrado
- [ ] Teste de pagamento com cartão sandbox executado
- [ ] Webhook recebido e processado com sucesso

## 🐛 Troubleshooting

### "Connection refused"
```bash
# Verificar se containers estão rodando
docker compose ps

# Reiniciar
docker compose down && docker compose up -d
```

### "Payment not found"
```
1. Verificar Payment.externalId foi salvo
2. Verificar webhook foi recebido
3. Ver logs: docker compose logs api
```

### "Webhook não chega"
```
1. Verificar URL em Dashboard Mercado Pago está correta
2. Se usando ngrok, verificar se ainda está ativo
3. Verificar firewall permite POST para /api/payments/webhook
```

## 📞 Suporte & Recursos

- 📖 [Documentação Mercado Pago](https://developers.mercadopago.com.br)
- 📖 [Guia Ecommerce](./ECOMMERCE_GUIDE.md)
- 🧪 [Exemplos de Requests](./ecommerce-requests.http)
- 🛠️ [Sequelize Docs](https://sequelize.org)
- 🚀 [Express Guide](https://expressjs.com)

## 📝 Licença

MIT - Livre para usar e modificar

---

**Status**: ✅ Pronto para produção  
**Versão**: 1.0.0  
**Última atualização**: Janeiro 2024

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
