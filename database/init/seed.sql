INSERT INTO persons (name, document, "birthDate")
VALUES ('Tal Cohen', '123456789', '1994-06-16')
ON CONFLICT (document) DO NOTHING;