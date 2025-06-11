CREATE USER 'piglocker_user'@'localhost' IDENTIFIED BY 'Cosmos1964@#@';

GRANT SELECT, INSERT, UPDATE, DELETE ON pig_locker_db.* TO 'piglocker_user'@'localhost';

FLUSH PRIVILEGES;

EXIT;


CREATE DATABASE piglocker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE piglocker;

-- Tabela para armazenar os dados de login dos usuários
CREATE TABLE usuarios (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(64) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para armazenar as credenciais salvas no cofre
CREATE TABLE credenciais (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT(11) UNSIGNED NOT NULL,
    nome VARCHAR(255) NOT NULL,
    login VARCHAR(255) NOT NULL,
    senha_cifrada TEXT NOT NULL,
    iv VARCHAR(32) NOT NULL,
    site VARCHAR(255),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);


CREATE USER 'testuser'@'localhost' IDENTIFIED BY 'testpass123';
GRANT SELECT, INSERT, UPDATE, DELETE ON piglocker.* TO 'testuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;


-- jonathanbufon@gmail.com
-- 123Teste12@@


-- K432687@gmail.com
-- 123Teste12$##