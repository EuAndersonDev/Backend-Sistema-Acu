# 🛒 GUIA COMPLETO - ECOMMERCE API COM MERCADO PAGO

## 📋 Índice
1. [Arquitetura do Projeto](#arquitetura)
2. [Setup Inicial](#setup)
3. [Integração Mercado Pago](#mercado-pago)
4. [Referência de Endpoints](#endpoints)
5. [Fluxo de Pagamento](#fluxo-pagamento)
6. [Webhook Configuration](#webhooks)
7. [Deployment](#deployment)

---

## <a name="arquitetura"></a>🏗️ Arquitetura do Projeto

### Estrutura em Camadas
```
┌─────────────────────────────────────────────────────┐
│          HTTP Layer (Controllers)                    │
│  AuthController, ProductController, CartController  │
│  OrderController, PaymentController                 │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│          Service Layer (Business Logic)             │
│  CartService, OrderService, PaymentService          │
│  - Validations                                      │
│  - Business Rules                                   │
│  - Mercado Pago Integration                         │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│       Repository Layer (Data Access)                │
│  CartRepository, OrderRepository, PaymentRepository │
│  - Database Queries                                 │
│  - Sequelize ORM                                    │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│          Database Layer (PostgreSQL)                │
│  Models: User, Product, Cart, CartItem              │
│          Order, OrderItem, Payment                  │
└─────────────────────────────────────────────────────┘
```

### Modelos de Dados

#### User
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string (unique)",
  "password": "string (hashed)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### Product
```json
{
  "id": "uuid",
  "name": "string",
  "description": "text",
  "price": "decimal(12,2)",
  "stock": "integer",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### Cart
```json
{
  "id": "uuid",
  "userId": "uuid (FK -> User)",
  "status": "ACTIVE | COMPLETED | ABANDONED",
  "totalPrice": "decimal(12,2)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### CartItem
```json
{
  "id": "uuid",
  "cartId": "uuid (FK -> Cart)",
  "productId": "uuid (FK -> Product)",
  "quantity": "integer",
  "frozenPrice": "decimal(12,2)",
  "subtotal": "decimal(12,2)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### Order
```json
{
  "id": "uuid",
  "userId": "uuid (FK -> User)",
  "cartId": "uuid (FK -> Cart)",
  "status": "PENDING_PAYMENT | PAID | PROCESSING | SHIPPED | DELIVERED | CANCELLED",
  "totalPrice": "decimal(12,2)",
  "shippingAddress": {
    "street": "string",
    "number": "string",
    "complement": "string (optional)",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "notes": "string (optional)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### OrderItem
```json
{
  "id": "uuid",
  "orderId": "uuid (FK -> Order)",
  "productId": "uuid (FK -> Product)",
  "quantity": "integer",
  "frozenPrice": "decimal(12,2)",
  "subtotal": "decimal(12,2)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### Payment
```json
{
  "id": "uuid",
  "orderId": "uuid (FK -> Order, unique)",
  "externalId": "string (unique, Mercado Pago preference_id)",
  "amount": "decimal(12,2)",
  "status": "PENDING | PROCESSING | APPROVED | DECLINED | CANCELLED | REFUNDED | FAILED",
  "method": "CREDIT_CARD | DEBIT_CARD | PIX | BANK_TRANSFER",
  "paymentGateway": "MERCADO_PAGO",
  "metadata": {
    "preference_id": "string",
    "paymentUrl": "string",
    "paymentLink": "string",
    "paymentLinkQr": "string (para PIX)"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## <a name="setup"></a>⚙️ Setup Inicial

### Pré-requisitos
- Node.js 16+
- Docker & Docker Compose
- Conta Mercado Pago (produção ou sandbox)
- Git

### 1. Clonar e instalar dependências
```bash
git clone <repo-url>
cd Backend-Sistema-Acu
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Editar .env com suas configurações
```

### 3. Iniciar banco de dados
```bash
docker compose up -d postgres
# Aguardar 10 segundos para banco iniciar
```

### 4. Sincronizar modelos com banco
```bash
npm run migrate
# Script executa { force: true } no startup para recrear tabelas
```

### 5. Iniciar servidor
```bash
# Desenvolvimento com auto-reload
npm run dev

# Ou produção
npm start
```

### Variáveis de Ambiente Necessárias
```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=seu_secret_muito_seguro_aqui
JWT_EXPIRATION=7d

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-XXXXX...
MERCADO_PAGO_PUBLIC_KEY=APP_USR-XXXXX...
MERCADO_PAGO_NOTIFICATION_URL=https://seu-dominio.com/api/payments/webhook
WEBHOOK_SECRET=opcional_para_validacao

# Frontend URLs
FRONT_END_URL=http://localhost:3000
PAYMENT_SUCCESS_URL=http://localhost:3000/checkout/success
PAYMENT_FAILURE_URL=http://localhost:3000/checkout/failure
PAYMENT_PENDING_URL=http://localhost:3000/checkout/pending

# Servidor
PORT=3000
NODE_ENV=development
```

---

## <a name="mercado-pago"></a>💳 Integração Mercado Pago

### Obter Credenciais

1. **Acessar Mercado Pago**
   - Ir para https://www.mercadopago.com.br
   - Fazer login com sua conta ou criar uma

2. **Obter Access Token**
   - Ir para: Painel → Configurações → Credenciais
   - Copiar **Access Token** (ambiente escolhido: test ou produção)
   - Copiar **Public Key** (usado no frontend)

3. **Configurar Webhook**
   - Ir para: Painel → Notificações → Webhooks
   - Adicionar URL: `https://seu-dominio.com/api/payments/webhook`
   - Selecionar eventos: `payment.created` e `payment.updated`

### Métodos de Pagamento Suportados

| Método | Tipo | Parcelamento | Descrição |
|--------|------|--------------|-----------|
| **CREDIT_CARD** | Crédito | Até 12x | Cartão de crédito com opção de parcelamento |
| **DEBIT_CARD** | Débito | À vista | Cartão de débito, saque imediato |
| **PIX** | Instant | À vista | Transferência instantânea (0 juros) |
| **BANK_TRANSFER** | Transferência | À vista | Transferência bancária tradicional |

### Fluxo de Integração

```
1. Cliente inicia pagamento
   POST /api/payments
   {orderId, method, payerData}
   
2. PaymentService
   - Busca Order + OrderItems
   - Cria Preference no Mercado Pago
   - Salva externalId (preference_id)
   - Retorna paymentUrl + metadata
   
3. Cliente redireciona para MP
   - Acessa paymentUrl ou scanifia QRCode (PIX)
   - Completa pagamento
   
4. Mercado Pago processa
   - Envia webhook para /api/payments/webhook
   - {type: "payment", data: {id: "..."}}
   
5. PaymentService processa webhook
   - Busca Payment by externalId
   - Consulta status em tempo real na API MP
   - Mapeia status (pending → PROCESSING, approved → APPROVED)
   - Atualiza Payment.status
   - Atualiza Order.status (PENDING_PAYMENT → PAID)
   
6. Cliente recebe confirmação
   - Email de confirmação do pagamento
   - Pode acompanhar pedido em tempo real
```

### Exemplo de Integração com Frontend

#### 1. Iniciar Pagamento (Backend)
```javascript
// POST /api/payments
const response = await fetch('/api/payments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orderId: '12345-uuid',
    method: 'CREDIT_CARD',
    payerData: {
      email: 'cliente@example.com',
      name: 'João Silva'
    }
  })
});

const {data, paymentUrl, paymentLink} = await response.json();
// Retorna: {
//   id: uuid,
//   externalId: "123456789",
//   amount: 6700.00,
//   status: "PENDING",
//   paymentUrl: "https://www.mercadopago.com.br/checkout/...",
//   paymentLink: "https://www.mercadopago.com.br/...",
//   paymentLinkQr: "https://..." (para PIX)
// }
```

#### 2. Redirecionar para Mercado Pago (Frontend)
```javascript
// Opção 1: Redirecionar para checkout
window.location.href = data.paymentUrl;

// Opção 2: Usar Mercado Pago SDK
MercadoPago.checkout({
  preference: {
    id: data.externalId
  },
  autoOpen: true
});

// Opção 3: PIX QRCode (exibir código)
showQRCode(data.paymentLinkQr);
```

#### 3. Webhook (Automático)
```javascript
// Mercado Pago envia automaticamente quando há mudança de status
// Nossa API processa em /api/payments/webhook
// Nenhuma ação necessária no frontend
```

#### 4. Verificar Status (Optional)
```javascript
// Opcional: Cliente pode checar status em tempo real
const paymentStatus = await fetch(`/api/payments/${paymentId}`, {
  headers: {'Authorization': `Bearer ${token}`}
});
```

---

## <a name="endpoints"></a>📡 Referência de Endpoints

### Authentication

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha@123"
}

Response: 201
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com"
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "senha@123"
}

Response: 200
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com"
  }
}
```

#### Get Profile
```
GET /api/auth/me
Authorization: Bearer {token}

Response: 200
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@example.com",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Products

#### Get All Products
```
GET /api/products
Authorization: Bearer {token}

Response: 200
{
  "data": [
    {
      "id": "uuid",
      "name": "Notebook Dell",
      "price": 5500.00,
      "stock": 5,
      "description": "..."
    }
  ]
}
```

#### Create Product
```
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Monitor LG 4K",
  "description": "27 polegadas, 4K, 60Hz",
  "price": 2200.00,
  "stock": 8
}

Response: 201
{
  "id": "uuid",
  "name": "Monitor LG 4K",
  "price": 2200.00,
  "stock": 8
}
```

#### Update Product
```
PUT /api/products/{productId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "price": 2100.00,
  "stock": 7
}

Response: 200
{ ...updated product }
```

#### Delete Product
```
DELETE /api/products/{productId}
Authorization: Bearer {token}

Response: 204 (No Content)
```

### Cart

#### Get Cart
```
GET /api/cart
Authorization: Bearer {token}

Response: 200
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "status": "ACTIVE",
    "totalPrice": 6700.00,
    "items": [
      {
        "id": "uuid",
        "productId": "uuid",
        "quantity": 1,
        "frozenPrice": 5500.00,
        "subtotal": 5500.00,
        "product": {
          "id": "uuid",
          "name": "Notebook Dell",
          "price": 5500.00
        }
      }
    ],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### Add Item to Cart
```
POST /api/cart/items
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "uuid",
  "quantity": 1
}

Response: 201
{ ...updated cart }
```

#### Remove Item from Cart
```
DELETE /api/cart/items/{cartItemId}
Authorization: Bearer {token}

Response: 200
{ ...updated cart }
```

#### Clear Cart
```
DELETE /api/cart
Authorization: Bearer {token}

Response: 200
{ "message": "Cart cleared successfully" }
```

### Orders

#### Create Order (Checkout)
```
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "shippingAddress": {
    "street": "Avenida Paulista",
    "number": "1000",
    "complement": "Apto 2501",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01311-100",
    "country": "Brasil"
  },
  "notes": "Entregar em horário comercial"
}

Response: 201
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "cartId": "uuid",
    "status": "PENDING_PAYMENT",
    "totalPrice": 6700.00,
    "shippingAddress": {...},
    "notes": "...",
    "items": [...],
    "createdAt": "..."
  }
}
```

#### Get Orders
```
GET /api/orders
Authorization: Bearer {token}

Response: 200
{
  "data": [
    {
      "id": "uuid",
      "status": "PENDING_PAYMENT",
      "totalPrice": 6700.00,
      "createdAt": "..."
    }
  ]
}
```

#### Get Order Details
```
GET /api/orders/{orderId}
Authorization: Bearer {token}

Response: 200
{
  "data": {
    "id": "uuid",
    "status": "PENDING_PAYMENT",
    "totalPrice": 6700.00,
    "shippingAddress": {...},
    "items": [...],
    "payments": [...]
  }
}
```

#### Cancel Order
```
PATCH /api/orders/{orderId}/cancel
Authorization: Bearer {token}

Response: 200
{
  "message": "Order cancelled successfully",
  "data": {
    "id": "uuid",
    "status": "CANCELLED"
  }
}
```

### Payments (Mercado Pago)

#### Initiate Payment
```
POST /api/payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "uuid",
  "method": "CREDIT_CARD|DEBIT_CARD|PIX|BANK_TRANSFER",
  "payerData": {
    "email": "cliente@example.com",
    "name": "João Silva"
  }
}

Response: 201
{
  "data": {
    "id": "uuid",
    "orderId": "uuid",
    "externalId": "123456789",
    "amount": 6700.00,
    "status": "PENDING",
    "method": "CREDIT_CARD",
    "paymentUrl": "https://www.mercadopago.com.br/checkout/...",
    "paymentLink": "https://...",
    "paymentLinkQr": "https://..." // (only for PIX)
  }
}
```

#### Get Payment Status
```
GET /api/payments/{paymentId}
Authorization: Bearer {token}

Response: 200
{
  "id": "uuid",
  "status": "PROCESSING",
  "externalId": "123456789",
  "amount": 6700.00,
  "method": "CREDIT_CARD",
  "createdAt": "..."
}
```

#### Get Order Payments
```
GET /api/payments/order/{orderId}
Authorization: Bearer {token}

Response: 200
{
  "data": [
    {
      "id": "uuid",
      "status": "APPROVED",
      "amount": 6700.00,
      "method": "CREDIT_CARD",
      "createdAt": "..."
    }
  ]
}
```

#### Refund Payment
```
POST /api/payments/{paymentId}/refund
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Cliente solicitou reembolso"
}

Response: 200
{
  "message": "Refund processed successfully",
  "data": {
    "id": "uuid",
    "status": "REFUNDED"
  }
}
```

#### Webhook (Mercado Pago)
```
POST /api/payments/webhook
Content-Type: application/json

{
  "type": "payment",
  "data": {
    "id": "123456789"
  }
}

Response: 200
{
  "message": "Webhook processed successfully"
}
```

---

## <a name="fluxo-pagamento"></a>💰 Fluxo Completo de Pagamento

### Status das Ordens
```
PENDING_PAYMENT
    ↓
   PAID (após aprovação do pagamento)
    ↓
   PROCESSING (preparando envio)
    ↓
   SHIPPED (enviado)
    ↓
   DELIVERED (entregue)

Pode ser CANCELLED em qualquer estado
```

### Status dos Pagamentos
```
PENDING (inicial)
    ↓
   PROCESSING (processando)
    ↓
   APPROVED (aprovado) ─→ pode refundar para REFUNDED
    ↓
   DECLINED (recusado)
    
CANCELLED (cancelado)
FAILED (erro)
```

### Mapeamento Mercado Pago → Sistema
```
pending             → PROCESSING
approved            → APPROVED
authorized          → PROCESSING
in_process          → PROCESSING
in_mediation        → PROCESSING
rejected            → DECLINED
cancelled           → CANCELLED
refunded            → REFUNDED
charged_back        → CANCELLED
```

### Exemplo de Fluxo Completo

**1. Cliente faz registro**
```
POST /api/auth/register
↓ User criado
```

**2. Cliente visualiza produtos**
```
GET /api/products
↓ Lista de produtos retornada
```

**3. Cliente adiciona itens ao carrinho**
```
POST /api/cart/items
POST /api/cart/items
POST /api/cart/items
↓ Cart atualizado com 3 itens, total: 6700.00
```

**4. Cliente faz checkout (cria order)**
```
POST /api/orders
{
  "shippingAddress": {...},
  "notes": "..."
}
↓ Order criado em PENDING_PAYMENT
↓ Cart marcado como COMPLETED
↓ CartItems copiados para OrderItems com preços congelados
```

**5. Cliente inicia pagamento**
```
POST /api/payments
{
  "orderId": "uuid",
  "method": "CREDIT_CARD",
  "payerData": {...}
}
↓ Payment criado em PENDING
↓ Preference criada no Mercado Pago
↓ Retorna paymentUrl para redirecionar
```

**6. Cliente redireciona para Mercado Pago**
```
Usuário clica no link ou é redirecionado
↓ Completa pagamento no checkout do MP
↓ MP processa e aprova
```

**7. Mercado Pago envia webhook**
```
Webhook enviado para /api/payments/webhook
{
  "type": "payment",
  "data": {"id": "123456789"}
}
↓ PaymentService busca Payment by externalId
↓ Consulta Mercado Pago API para status
↓ Payment.status atualizado para APPROVED
↓ Order.status atualizado para PAID
↓ Email de confirmação enviado
```

**8. Cliente recebe confirmação**
```
GET /api/orders/{orderId}
↓ Order.status = "PAID"
↓ Pode acompanhar até entrega
```

---

## <a name="webhooks"></a>🔔 Configuração de Webhooks

### O que é Webhook?
Webhook é um mecanismo para o Mercado Pago notificar automaticamente sua API quando um evento ocorre (pagamento aprovado, recusado, etc).

### Setup Webhook Mercado Pago

1. **Em Desenvolvimento (com ngrok)**
   ```bash
   # Instalar ngrok
   npm install -g ngrok
   
   # Expor porta 3000
   ngrok http 3000
   
   # Cópia a URL pública: https://abc123.ngrok.io
   
   # Adicionar em .env
   MERCADO_PAGO_NOTIFICATION_URL=https://abc123.ngrok.io/api/payments/webhook
   ```

2. **No Dashboard Mercado Pago**
   - Acesse: https://www.mercadopago.com.br/ipn/events
   - Clique em "Adicionar nova notificação"
   - Cole a URL: `https://abc123.ngrok.io/api/payments/webhook`
   - Selecione eventos: `payment.created` e `payment.updated`
   - Salve

3. **Testando Webhook Localmente**
   ```bash
   # Use o arquivo ecommerce-requests.http
   # Na seção "FASE 6: WEBHOOKS & NOTIFICATIONS"
   
   # Ou use curl
   curl -X POST http://localhost:3000/api/payments/webhook \
     -H "Content-Type: application/json" \
     -d '{"type":"payment","data":{"id":"123456789"}}'
   ```

4. **Em Produção**
   - URL: `https://seu-dominio.com/api/payments/webhook`
   - Já está configurada em `.env` como `MERCADO_PAGO_NOTIFICATION_URL`
   - Dashboard MP autenticará e enviará webhooks automaticamente

### Formato do Webhook Recebido
```json
{
  "type": "payment",
  "data": {
    "id": "123456789"
  }
}
```

### Log de Webhooks Recebidos
```javascript
// Veja em src/controllers/PaymentController.js
// handleWebhook() registra todos os webhooks recebidos
// Verifique nos logs do servidor:

console.log('Webhook received:', data);
```

### Troubleshooting Webhooks

| Problema | Solução |
|----------|---------|
| Webhook não chega | Verificar URL em Dashboard MP está correta |
| Error 404 | Garantir endpoint `/api/payments/webhook` existe |
| Erro "Connection refused" | Servidor não está rodando, verificar porta 3000 |
| ngrok desconecta | ngrok desconecta após 2h. Reinicie e atualize URL em MP |
| Certificado SSL inválido | Em produção, certificado válido é obrigatório |

---

## <a name="deployment"></a>🚀 Deployment

### Pré-requisitos
- Servidor com Docker instalado
- Domínio próprio (HTTPS obrigatório)
- Banco PostgreSQL em nuvem (opcional, ou usar container)
- Mercado Pago em produção (não sandbox)

### Docker Compose (Produção)

#### 1. Arquivo `docker-compose.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "${DB_PORT}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  api:
    build: .
    ports:
      - "${PORT}:3000"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      MERCADO_PAGO_ACCESS_TOKEN: ${MERCADO_PAGO_ACCESS_TOKEN}
      MERCADO_PAGO_NOTIFICATION_URL: ${MERCADO_PAGO_NOTIFICATION_URL}
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 2. Deploy
```bash
# Clonar repositório
git clone <repo-url> && cd Backend-Sistema-Acu

# Criar .env com produção
cp .env.example .env
# Editar .env com valores de produção

# Iniciar containers
docker compose -f docker-compose.yml up -d

# Verificar logs
docker compose logs -f api
```

#### 3. Reverter Deploy (se necessário)
```bash
# Parar containers
docker compose down

# Voltar código anterior
git revert HEAD

# Reiniciar
docker compose up -d
```

### SSL com Let's Encrypt + Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}
```

### Checklist de Deploy

- [ ] Domínio apontado para servidor (DNS)
- [ ] SSL instalado (Let's Encrypt)
- [ ] `.env` preenchido com credenciais de produção
- [ ] `MERCADO_PAGO_NOTIFICATION_URL` configurada com domínio real
- [ ] Webhook registrado em Dashboard Mercado Pago
- [ ] Banco de dados configurado (local ou cloud)
- [ ] Docker containers iniciados e saudáveis
- [ ] Logs verificados sem erros
- [ ] Teste de pagamento realizado com cartão sandbox
- [ ] Webhook recebido e processado

### Monitoramento

```bash
# Verificar saúde dos containers
docker compose ps

# Ver logs em tempo real
docker compose logs -f api

# Reiniciar API
docker compose restart api

# Backup banco de dados
docker compose exec postgres pg_dump -U $DB_USER $DB_NAME > backup.sql

# Restaurar banco
docker compose exec -T postgres psql -U $DB_USER $DB_NAME < backup.sql
```

---

## 📚 Recursos Adicionais

- [Documentação Mercado Pago](https://developers.mercadopago.com.br)
- [Sequelize Documentation](https://sequelize.org)
- [Express.js Guide](https://expressjs.com)
- [JWT Tokens](https://jwt.io)

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verificar logs: `docker compose logs api`
2. Consultar documentação Mercado Pago
3. Abrir issue no repositório

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2024  
**Mantido por**: Development Team
