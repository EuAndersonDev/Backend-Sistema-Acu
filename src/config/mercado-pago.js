// src/config/mercado-pago.js

const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// Inicializar SDK do Mercado Pago (v2.11.0+)
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

// Constantes de configuração
const MERCADO_PAGO_CONFIG = {
  // Moeda (BRL = Real Brasileiro)
  currency: 'BRL',
  
  // URLs de redirecionamento após pagamento
  notification_url: process.env.MERCADO_PAGO_NOTIFICATION_URL,
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
  webhook_secret: process.env.WEBHOOK_SECRET || null,
  
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
