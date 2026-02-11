
-- Rodar este script no SQL Editor do seu console do Supabase

CREATE TABLE feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  status TEXT DEFAULT 'pending'
);

-- Ativar RLS (Row Level Security)
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Permitir que qualquer pessoa envie feedback (Inserir)
CREATE POLICY "Permitir inserção de feedback por qualquer pessoa" ON feedbacks
  FOR INSERT WITH CHECK (true);

-- Permitir que todos vejam feedbacks (Apenas se quiser tornar público, senão ajuste para o Admin)
CREATE POLICY "Permitir leitura de feedbacks pelo Admin" ON feedbacks
  FOR SELECT USING (true);
