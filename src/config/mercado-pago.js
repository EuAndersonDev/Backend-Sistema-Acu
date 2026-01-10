// src/config/mercado-pago.js

const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// Inicializar SDK do Mercado Pago (v2.11.0+)
// Suporte a variáveis MP_* e fallback para as existentes
const accessToken = process.env.MP_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN;
const notificationUrl = process.env.MP_WEBHOOK_URL || process.env.MERCADO_PAGO_NOTIFICATION_URL;
const webhookSecret = process.env.MP_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || null;

const client = new MercadoPagoConfig({
  accessToken,
});

// Constantes de configuração
const MERCADO_PAGO_CONFIG = {
  // Moeda (BRL = Real Brasileiro)
  currency: 'BRL',
  
  // URLs de redirecionamento após pagamento
  notification_url: notificationUrl,
  success_url: process.env.PAYMENT_SUCCESS_URL || 'http://localhost:3000/checkout/success',
  failure_url: process.env.PAYMENT_FAILURE_URL || 'http://localhost:3000/checkout/failure',
  pending_url: process.env.PAYMENT_PENDING_URL || 'http://localhost:3000/checkout/pending',
  
  // Métodos de pagamento aceitos
  payment_methods: {
    CREDIT_CARD: 'CREDIT_CARD',
    DEBIT_CARD: 'DEBIT_CARD',
    PIX: 'PIX',
    BANK_TRANSFER: 'BANK_TRANSFER',
  },
  
  // Mapeamento de métodos para Mercado Pago
  payment_method_map: {
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    PIX: 'pix',
    BANK_TRANSFER: 'bank_transfer',
  },
  
  // Configurações de parcelamento para cartão de crédito
  installments: {
    max_installments: 12,
    min_installment_value: 0,
  },
  
  // Webhook secret para validação (opcional)
  webhook_secret: webhookSecret,
  
  // Timeout para requisições
  request_timeout: 30000,
  
  // Log de debug (apenas em desenvolvimento)
  debug: process.env.NODE_ENV === 'development',
};

// Mapear status Mercado Pago → Status do Sistema
const STATUS_MAPPING = {
  pending: 'PROCESSING',
  approved: 'APPROVED',
  authorized: 'PROCESSING',
  in_process: 'PROCESSING',
  in_mediation: 'PROCESSING',
  rejected: 'DECLINED',
  cancelled: 'CANCELLED',
  refunded: 'REFUNDED',
  charged_back: 'CANCELLED',
  expired: 'DECLINED',
};

// Exportar
module.exports = {
  client,
  Preference,
  Payment,
  MERCADO_PAGO_CONFIG,
  STATUS_MAPPING,
};
