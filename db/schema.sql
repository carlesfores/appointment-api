CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE,
  hour TIME
);
