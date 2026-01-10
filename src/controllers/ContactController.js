const { Resend } = require('resend');

// Lazy initialization - Resend é inicializado apenas quando necessário
let resend = null;

const getResendClient = () => {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY não configurada no .env');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

// Email do dono da loja (configurável via .env)
// Fallback para o email informado pelo cliente
const OWNER_EMAIL = process.env.CONTACT_RECEIVER_EMAIL || 'acumateriascontrucao@gmail.com';
// Remetente configurável (necessário usar domínio verificado para enviar a qualquer destinatário)
const FROM_ADDRESS = process.env.CONTACT_FROM_ADDRESS || 'Contact Form <onboarding@resend.dev>';
// Email da conta Resend (usado para testes com resend.dev)
const RESEND_ACCOUNT_EMAIL = (process.env.RESEND_ACCOUNT_EMAIL || '').toLowerCase();
// Detecta se estamos usando domínio de teste resend.dev
const isResendDev = FROM_ADDRESS.includes('@resend.dev');

/**
 * Valida os dados do formulário de contato
 * @param {string} name - Nome do usuário
 * @param {string} email - Email do usuário
 * @param {string} message - Mensagem do usuário
 * @returns {Object|null} Retorna objeto com erro ou null se válido
 */
const validateContactData = (name, email, message) => {
  // Validação do nome (mínimo 2 caracteres)
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { error: 'Nome deve ter no mínimo 2 caracteres' };
  }

  // Validação do email (formato válido)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return { error: 'Email inválido' };
  }

  // Validação da mensagem (mínimo 10 caracteres)
  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return { error: 'Mensagem deve ter no mínimo 10 caracteres' };
  }

  return null;
};

/**
 * Envia email para o dono do site com a mensagem do cliente
 * @param {string} name - Nome do cliente
 * @param {string} email - Email do cliente
 * @param {string} message - Mensagem do cliente
 */
const sendEmailToOwner = async (name, email, message) => {
  const htmlContent = `
    <!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #0f172a;
      background-color: #f8fafc;
      padding: 20px;
    }

    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
      border-bottom: 4px solid #0f172a;
    }

    .header h1 {
      font-size: 28px;
      margin-bottom: 8px;
      font-weight: 700;
    }

    .header p {
      font-size: 14px;
      opacity: 0.95;
    }

    .content {
      padding: 40px 30px;
    }

    .greeting {
      font-size: 16px;
      color: #0f172a;
      margin-bottom: 30px;
      line-height: 1.8;
    }

    .greeting strong {
      color: #f97316;
    }

    .field-group {
      margin-bottom: 25px;
      border-left: 4px solid #f97316;
      padding-left: 20px;
      background-color: #fafaf9;
      padding: 15px;
      border-radius: 4px;
    }

    .field-label {
      font-weight: 600;
      color: #0f172a;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 8px;
      color: #f97316;
    }

    .field-value {
      color: #1e293b;
      font-size: 15px;
      word-break: break-word;
    }

    .message-box {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #f97316;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-size: 14px;
      line-height: 1.7;
      color: #0f172a;
    }

    .action-section {
      margin-top: 30px;
      padding-top: 30px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
    }

    .email-reply {
      display: inline-block;
      background-color: #f97316;
      color: white;
      padding: 12px 30px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 15px;
    }

    .email-reply:hover {
      background-color: #ea580c;
    }

    .email-address {
      background-color: #f0f9ff;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #0ea5e9;
      margin-top: 15px;
      font-size: 14px;
    }

    .email-address strong {
      color: #0ea5e9;
    }

    .footer {
      background-color: #f1f5f9;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
    }

    .footer-logo {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 10px;
    }

    .footer-logo span {
      color: #f97316;
    }

    .footer p {
      margin: 5px 0;
    }

    .divider {
      height: 1px;
      background-color: #e2e8f0;
      margin: 20px 0;
    }

    .highlight {
      background-color: #fef3c7;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 500;
    }

    @media (max-width: 600px) {
      .email-container {
        border-radius: 0;
      }

      .header {
        padding: 30px 20px;
      }

      .header h1 {
        font-size: 24px;
      }

      .content {
        padding: 25px 20px;
      }

      .field-group {
        padding-left: 15px;
      }
    }
  </style>
</head>

<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>🔧 Novo Contato Recebido</h1>
      <p>Você recebeu uma nova mensagem através do formulário de contato</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">
        Olá! Você recebeu uma nova mensagem de um visitante do seu site. <br>
        Aqui estão os detalhes:
      </div>

      <!-- Nome -->
      <div class="field-group">
        <span class="field-label">👤 Nome do Visitante</span>
        <div class="field-value">${name}</div>
      </div>

      <!-- Email -->
      <div class="field-group">
        <span class="field-label">✉️ Email para Resposta</span>
        <div class="field-value">${email}</div>
      </div>

      <!-- Mensagem -->
      <div class="field-group">
        <span class="field-label">💬 Mensagem Completa</span>
        <div class="message-box">${message}</div>
      </div>

      <!-- Action Section -->
      <div class="action-section">
        <p style="margin-bottom: 15px; color: #64748b; font-size: 14px;">
          Você pode responder diretamente clicando no botão abaixo:
        </p>
        <a href="mailto:${email}" class="email-reply">
          ↩️ Responder ao Cliente
        </a>

        <div class="email-address">
          <strong>Email do Cliente:</strong><br>
          ${email}
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="divider"></div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-logo">
        <span>ACU</span> Materiais de Construção
      </div>
      <p>Este email foi enviado automaticamente pelo formulário de contato</p>
      <p style="margin-top: 15px; font-size: 11px; color: #94a3b8;">
        © 2026 ACU Materiais de Construção. Todos os direitos reservados.
      </p>
    </div>
  </div>
</body>

</html>
    `;

  await getResendClient().emails.send({
    from: FROM_ADDRESS,
    to: OWNER_EMAIL,
    replyTo: email,
    subject: `Nova mensagem de ${name}`,
    html: htmlContent,
  });
};

/**
 * Envia email de confirmação automática para o cliente
 * @param {string} name - Nome do cliente
 * @param {string} email - Email do cliente
 */
const sendConfirmationEmailToClient = async (name, email) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 30px;
            border: 1px solid #e0e0e0;
          }
          .header {
            background-color: #2196F3;
            color: white;
            padding: 15px;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 20px -30px;
            text-align: center;
          }
          .content {
            background-color: white;
            padding: 20px;
            border-radius: 4px;
            margin-bottom: 20px;
          }
          .checkmark {
            font-size: 48px;
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #777;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">✓ Mensagem Recebida</h2>
          </div>
          
          <div class="checkmark">✅</div>
          
          <div class="content">
            <p>Olá <strong>${name}</strong>,</p>
            
            <p>Recebemos sua mensagem e agradecemos pelo contato!</p>
            
            <p>Nossa equipe analisará sua solicitação e retornaremos em breve. Normalmente respondemos em até 24 horas úteis.</p>
            
            <p>Caso sua mensagem seja urgente, você também pode entrar em contato conosco através dos nossos outros canais de atendimento.</p>
            
            <p style="margin-top: 30px;">Atenciosamente,<br>
            <strong>Equipe ACU Materiais de Construção</strong></p>
          </div>
          
          <div class="footer">
            <p>Este é um email automático. Por favor, não responda.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Em modo teste (onboarding@resend.dev), a Resend só entrega para o email da conta.
  // Se o cliente não for a conta, encaminhamos para RESEND_ACCOUNT_EMAIL para validar o fluxo.
  const clientRecipient =
    isResendDev && RESEND_ACCOUNT_EMAIL && RESEND_ACCOUNT_EMAIL !== email.toLowerCase()
      ? RESEND_ACCOUNT_EMAIL
      : email;

  await getResendClient().emails.send({
    from: FROM_ADDRESS,
    to: clientRecipient,
    subject: isResendDev && clientRecipient !== email.toLowerCase() ? '[TEST] Recebemos sua mensagem' : 'Recebemos sua mensagem',
    html: htmlContent,
  });
};

/**
 * Controller para processar o formulário de contato
 * @param {Object} req - Request do Express
 * @param {Object} res - Response do Express
 */
const sendContactMessage = async (req, res) => {
  try {
    // Validação do Content-Type
    if (!req.is('application/json')) {
      return res.status(400).json({ 
        error: 'Content-Type deve ser application/json' 
      });
    }

    const { name, email, message } = req.body;

    // Validação dos dados
    const validationError = validateContactData(name, email, message);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    // Remove espaços extras dos dados
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMessage = message.trim();

    // Envia somente para o dono da loja (confirmação ao cliente desativada)
    await sendEmailToOwner(cleanName, cleanEmail, cleanMessage);

    // Resposta de sucesso
    return res.status(200).json({ 
      success: true 
    });

  } catch (error) {
    console.error('Erro ao enviar email de contato:', error);
    
    // Resposta de erro genérica (não expõe detalhes internos)
    return res.status(500).json({ 
      error: 'Erro ao enviar email' 
    });
  }
};

module.exports = {
  sendContactMessage
};
