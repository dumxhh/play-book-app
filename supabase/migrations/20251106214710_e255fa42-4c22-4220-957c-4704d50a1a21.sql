-- Update court_photos with actual generated images
UPDATE court_photos 
SET image_url = '/src/assets/generated-futbol-court.jpg'
WHERE sport = 'futbol';

UPDATE court_photos 
SET image_url = '/src/assets/generated-paddle-court.jpg'
WHERE sport = 'paddle';

UPDATE court_photos 
SET image_url = '/src/assets/generated-tenis-court.jpg'
WHERE sport = 'tenis';

UPDATE court_photos 
SET image_url = '/src/assets/generated-golf-court.jpg'
WHERE sport = 'golf';

-- Insert additional reviews
INSERT INTO reviews (customer_name, sport, rating, comment, is_approved, customer_email) 
VALUES 
  ('Carlos Rodríguez', 'futbol', 5, 'Excelentes instalaciones, muy bien mantenidas. El césped sintético es de primera calidad. ¡Volveré seguro!', true, 'carlos@email.com'),
  ('Laura Martínez', 'paddle', 4, 'Muy buena experiencia. Las canchas están en perfectas condiciones y el personal es muy amable.', true, 'laura@email.com'),
  ('Javier López', 'tenis', 5, 'La mejor cancha de tenis de la zona. Iluminación perfecta para jugar de noche.', true, 'javier@email.com'),
  ('María Fernández', 'golf', 5, 'Campo de golf impecable. Los greens están perfectos y el ambiente es muy tranquilo.', true, 'maria@email.com'),
  ('Pablo Sánchez', 'futbol', 4, 'Buen lugar para jugar con amigos. Los vestuarios están limpios y hay estacionamiento amplio.', true, 'pablo@email.com'),
  ('Ana García', 'paddle', 5, 'Me encantó! Las canchas de paddle son las mejores que he probado. Totalmente recomendable.', true, 'ana@email.com')
ON CONFLICT DO NOTHING;