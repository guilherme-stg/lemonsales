-- Function to reverse points when a sale is rejected
CREATE OR REPLACE FUNCTION reverse_user_stats_on_sale_rejection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_xp_perdido INTEGER;
  v_novo_nivel INTEGER;
BEGIN
  -- Only process if status changed to REJEITADA
  IF NEW.status = 'REJEITADA' AND OLD.status != 'REJEITADA' THEN
    -- Calculate XP lost (10% of points)
    v_xp_perdido := FLOOR(NEW.pontos_totais * 0.1);
    
    -- Update user profile - subtract points and XP
    UPDATE profiles
    SET 
      pontos_total = GREATEST(0, pontos_total - NEW.pontos_totais),
      xp_total = GREATEST(0, xp_total - v_xp_perdido),
      updated_at = now()
    WHERE id = NEW.usuario_id;
    
    -- Recalculate level based on new XP
    SELECT FLOOR(GREATEST(0, xp_total - v_xp_perdido) / 1000) + 1
    INTO v_novo_nivel
    FROM profiles
    WHERE id = NEW.usuario_id;
    
    -- Update level if decreased
    UPDATE profiles
    SET nivel_atual = v_novo_nivel
    WHERE id = NEW.usuario_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for sale rejection
DROP TRIGGER IF EXISTS reverse_stats_on_rejection ON vendas;
CREATE TRIGGER reverse_stats_on_rejection
AFTER UPDATE ON vendas
FOR EACH ROW
EXECUTE FUNCTION reverse_user_stats_on_sale_rejection();