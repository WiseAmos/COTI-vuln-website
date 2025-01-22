-- SQLite database creation script
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
);

INSERT INTO users (username, password, role) VALUES
('admin', 'password123', 'admin'),
('user', 'user123', 'user');
('Tan Ming Xuan', '123123', 'user');
