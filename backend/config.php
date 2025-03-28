<?php
// Configurazione del database
define('DB_HOST', 'localhost');
define('DB_USER', 'root'); // Cambiare con l'utente del database in produzione
define('DB_PASS', ''); // Cambiare con la password del database in produzione
define('DB_NAME', 'prenotazioni_prelievi');

// Connessione al database
function connectDB() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    // Verifica la connessione
    if ($conn->connect_error) {
        die(json_encode(['error' => 'Connessione al database fallita: ' . $conn->connect_error]));
    }
    
    // Imposta il charset a utf8
    $conn->set_charset('utf8');
    
    return $conn;
}

// Funzione per chiudere la connessione
function closeDB($conn) {
    $conn->close();
}

// Funzione per gestire le risposte JSON
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
?>