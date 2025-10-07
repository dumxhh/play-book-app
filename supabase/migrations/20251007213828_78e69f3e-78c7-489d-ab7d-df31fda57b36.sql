-- Primero eliminar las reservas pendientes (esto no afecta a transactions porque la FK es de reservations hacia transactions)
DELETE FROM reservations WHERE payment_status = 'pending';

-- Luego eliminar transacciones huérfanas (sin reserva asociada)
DELETE FROM transactions 
WHERE id NOT IN (SELECT payment_id FROM reservations WHERE payment_id IS NOT NULL);