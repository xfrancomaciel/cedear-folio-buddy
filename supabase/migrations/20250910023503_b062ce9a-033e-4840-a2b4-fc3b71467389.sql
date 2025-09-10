-- Add categoria column to transactions table with predefined categories
CREATE TYPE transaction_category AS ENUM (
  'Jubilación',
  'Viaje', 
  'Ahorro',
  'Emergencias',
  'Educación',
  'Inversión',
  'Casa',
  'Auto'
);

ALTER TABLE transactions 
ADD COLUMN categoria transaction_category DEFAULT 'Inversión';