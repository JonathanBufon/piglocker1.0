<?php
require_once 'config.php'; // Apenas para iniciar a sessão

header('Content-Type: application/json');

if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
    // A sessão está ativa
    echo json_encode(['status' => 'success', 'loggedin' => true, 'email' => $_SESSION['email']]);
} else {
    // Nenhuma sessão ativa
    echo json_encode(['status' => 'success', 'loggedin' => false]);
}
?>