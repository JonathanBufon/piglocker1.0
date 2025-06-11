<?php
require_once 'db_connection.php'; // Inclui config.php e inicia a sessão

header('Content-Type: application/json');

// Recebe os dados do POST (o frontend enviaria como JSON)
$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'E-mail e senha são obrigatórios.']);
    exit();
}

// Prepara a consulta para buscar o usuário pelo e-mail
$stmt = $conn->prepare("SELECT id, senha_hash FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    // Gera o hash da senha fornecida para comparação
    $password_hash_attempt = hash('sha256', $password);

    // Compara os hashes de forma segura para prevenir "timing attacks"
    if (hash_equals($user['senha_hash'], $password_hash_attempt)) {
        // Sucesso no login!
        
        // Regenera o ID da sessão para maior segurança
        session_regenerate_id(true);

        // Armazena informações do usuário na sessão
        $_SESSION['loggedin'] = true;
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['email'] = $email;

        echo json_encode([
            'status' => 'success',
            'message' => 'Login realizado com sucesso!'
        ]);
    } else {
        // Senha incorreta
        echo json_encode(['status' => 'error', 'message' => 'E-mail ou senha inválidos.']);
    }
} else {
    // Usuário não encontrado
    echo json_encode(['status' => 'error', 'message' => 'E-mail ou senha inválidos.']);
}

$stmt->close();
$conn->close();
?>