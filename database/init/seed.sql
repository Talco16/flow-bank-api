CREATE TABLE IF NOT EXISTS persons (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  document VARCHAR UNIQUE NOT NULL,
  "birthDate" DATE NOT NULL
);

INSERT INTO persons (name, document, "birthDate")
VALUES ('Tal Cohen', '123456789', '1994-06-16')
ON CONFLICT (document) DO NOTHING;