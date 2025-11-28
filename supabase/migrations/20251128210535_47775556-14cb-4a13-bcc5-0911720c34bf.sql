-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE vendas;
ALTER PUBLICATION supabase_realtime ADD TABLE conquistas_usuarios;

-- Create function to update user points and XP
CREATE OR REPLACE FUNCTION update_user_stats_on_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_xp_ganho INTEGER;
  v_novo_nivel INTEGER;
BEGIN
  -- Calculate XP (10% of points)
  v_xp_ganho := FLOOR(NEW.pontos_totais * 0.1);
  
  -- Update user profile
  UPDATE profiles
  SET 
    pontos_total = pontos_total + NEW.pontos_totais,
    xp_total = xp_total + v_xp_ganho,
    updated_at = now()
  WHERE id = NEW.usuario_id;
  
  -- Calculate new level (every 1000 XP = 1 level)
  SELECT FLOOR((xp_total + v_xp_ganho) / 1000) + 1
  INTO v_novo_nivel
  FROM profiles
  WHERE id = NEW.usuario_id;
  
  -- Update level if increased
  UPDATE profiles
  SET nivel_atual = v_novo_nivel
  WHERE id = NEW.usuario_id
  AND nivel_atual < v_novo_nivel;
  
  -- Log level up event if level increased
  IF v_novo_nivel > (SELECT nivel_atual FROM profiles WHERE id = NEW.usuario_id) THEN
    INSERT INTO eventos_nivel (usuario_id, nivel_alcancado)
    VALUES (NEW.usuario_id, v_novo_nivel);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic stats update
DROP TRIGGER IF EXISTS trigger_update_stats_on_sale ON vendas;
CREATE TRIGGER trigger_update_stats_on_sale
  AFTER INSERT ON vendas
  FOR EACH ROW
  WHEN (NEW.status = 'APROVADA')
  EXECUTE FUNCTION update_user_stats_on_sale();

-- Create function to check and unlock achievements
CREATE OR REPLACE FUNCTION check_achievements_on_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_vendas INTEGER;
  v_total_pontos INTEGER;
BEGIN
  -- Get user stats
  SELECT COUNT(*), COALESCE(SUM(pontos_totais), 0)
  INTO v_total_vendas, v_total_pontos
  FROM vendas
  WHERE usuario_id = NEW.usuario_id
  AND status = 'APROVADA';
  
  -- Unlock "Primeira Venda" achievement
  IF v_total_vendas = 1 THEN
    INSERT INTO conquistas_usuarios (usuario_id, conquista_id)
    SELECT NEW.usuario_id, id
    FROM conquistas
    WHERE codigo_interno = 'primeira_venda'
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Unlock "10 Vendas" achievement
  IF v_total_vendas = 10 THEN
    INSERT INTO conquistas_usuarios (usuario_id, conquista_id)
    SELECT NEW.usuario_id, id
    FROM conquistas
    WHERE codigo_interno = 'dez_vendas'
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Unlock "Vendedor Bronze" achievement (1000 pontos)
  IF v_total_pontos >= 1000 THEN
    INSERT INTO conquistas_usuarios (usuario_id, conquista_id)
    SELECT NEW.usuario_id, id
    FROM conquistas
    WHERE codigo_interno = 'vendedor_bronze'
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Unlock "Vendedor Prata" achievement (5000 pontos)
  IF v_total_pontos >= 5000 THEN
    INSERT INTO conquistas_usuarios (usuario_id, conquista_id)
    SELECT NEW.usuario_id, id
    FROM conquistas
    WHERE codigo_interno = 'vendedor_prata'
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Unlock "Vendedor Ouro" achievement (10000 pontos)
  IF v_total_pontos >= 10000 THEN
    INSERT INTO conquistas_usuarios (usuario_id, conquista_id)
    SELECT NEW.usuario_id, id
    FROM conquistas
    WHERE codigo_interno = 'vendedor_ouro'
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for achievement checking
DROP TRIGGER IF EXISTS trigger_check_achievements ON vendas;
CREATE TRIGGER trigger_check_achievements
  AFTER INSERT ON vendas
  FOR EACH ROW
  WHEN (NEW.status = 'APROVADA')
  EXECUTE FUNCTION check_achievements_on_sale();

-- Insert sample achievements if they don't exist
INSERT INTO conquistas (codigo_interno, nome, descricao, raridade, icone) VALUES
  ('primeira_venda', 'Primeira Venda', 'Registrou sua primeira venda no sistema', 'COMUM', '🎯'),
  ('dez_vendas', '10 Vendas', 'Completou 10 vendas com sucesso', 'RARO', '🔟'),
  ('vendedor_bronze', 'Vendedor Bronze', 'Acumulou 1.000 pontos', 'COMUM', '🥉'),
  ('vendedor_prata', 'Vendedor Prata', 'Acumulou 5.000 pontos', 'RARO', '🥈'),
  ('vendedor_ouro', 'Vendedor Ouro', 'Acumulou 10.000 pontos', 'EPICO', '🥇')
ON CONFLICT (codigo_interno) DO NOTHING;