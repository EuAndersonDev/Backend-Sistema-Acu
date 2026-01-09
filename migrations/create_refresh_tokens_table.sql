-- ================================================
-- Migração: Criar tabela refresh_tokens
-- Data: 2026-01-09
-- Descrição: Tabela para armazenar refresh tokens JWT
-- ================================================

-- Criar tabela refresh_tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id 
  ON refresh_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token 
  ON refresh_tokens(token);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at 
  ON refresh_tokens(expires_at);

-- Comentários das colunas
COMMENT ON TABLE refresh_tokens IS 'Tabela para armazenar refresh tokens JWT para autenticação';
COMMENT ON COLUMN refresh_tokens.id IS 'ID único do registro';
COMMENT ON COLUMN refresh_tokens.user_id IS 'ID do usuário proprietário do token';
COMMENT ON COLUMN refresh_tokens.token IS 'Refresh token JWT';
COMMENT ON COLUMN refresh_tokens.expires_at IS 'Data e hora de expiração do token';
COMMENT ON COLUMN refresh_tokens.created_at IS 'Data e hora de criação do registro';

-- Verificação
SELECT 
  'Tabela refresh_tokens criada com sucesso!' as status,
  COUNT(*) as total_tokens
FROM refresh_tokens;
