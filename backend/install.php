<?php
// Impostazioni di configurazione
$host = 'localhost';
$user = 'root'; // Cambiare in produzione
$pass = ''; // Cambiare in produzione
$dbname = 'prenotazioni_prelievi';

// Connessione all'istanza MySQL senza selezionare un database
$conn = new mysqli($host, $user, $pass);

// Verifica della connessione
if ($conn->connect_error) {
    die('Connessione fallita: ' . $conn->connect_error);
}

// Creazione del database
$sql = "CREATE DATABASE IF NOT EXISTS $dbname";
if ($conn->query($sql) === TRUE) {
    echo "Database creato con successo o già esistente.<br>";
} else {
    die('Errore nella creazione del database: ' . $conn->error);
}

// Selezione del database
$conn->select_db($dbname);

// Creazione della tabella prenotazioni
$sql = "CREATE TABLE IF NOT EXISTS prenotazioni (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    data_ritiro DATE NOT NULL,
    importo DECIMAL(10, 2) NOT NULL,
    timestamp VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql) === TRUE) {
    echo "Tabella prenotazioni creata con successo o già esistente.<br>";
} else {
    die('Errore nella creazione della tabella: ' . $conn->error);
}

// Creazione degli indici
$sql = "CREATE INDEX IF NOT EXISTS idx_nome_cognome ON prenotazioni (nome, cognome)";
if ($conn->query($sql) === TRUE) {
    echo "Indice idx_nome_cognome creato con successo.<br>";
} else {
    die('Errore nella creazione dell\'indice: ' . $conn->error);
}

$sql = "CREATE INDEX IF NOT EXISTS idx_data_ritiro ON prenotazioni (data_ritiro)";
if ($conn->query($sql) === TRUE) {
    echo "Indice idx_data_ritiro creato con successo.<br>";
} else {
    die('Errore nella creazione dell\'indice: ' . $conn->error);
}

// Chiudi la connessione
$conn->close();

echo "<p>Installazione completata con successo!</p>";
echo "<p>Si prega di aggiornare il file config.php con le credenziali appropriate per l'ambiente di produzione.</p>";
echo "<a href='../index.html'>Torna alla home page</a>";
?> 