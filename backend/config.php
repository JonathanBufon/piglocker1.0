<?php
// Configurações do Banco de Dados
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'testuser');
define('DB_PASSWORD', 'testpass123');
define('DB_NAME', 'piglocker');

// Chave de Criptografia - IMPORTANTE!
// Esta chave será usada para criptografar/descriptografar as senhas no cofre.
// Deve ser uma string aleatória e segura de 32 bytes.
// NUNCA mude esta chave após ter salvo senhas no banco.
define('ENCRYPTION_KEY', 'sua-chave-secreta-de-32-bytes-aqui'); // Ex: use random_bytes(32) para gerar uma

// Inicia a sessão em todos os scripts que incluírem este arquivo.
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
?>