-- Creazione del database se non esiste
CREATE DATABASE IF NOT EXISTS prenotazioni_prelievi;

-- Uso del database
USE prenotazioni_prelievi;

-- Creazione della tabella prenotazioni
CREATE TABLE IF NOT EXISTS prenotazioni (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    data_ritiro DATE NOT NULL,
    importo DECIMAL(10, 2) NOT NULL,
    timestamp VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indice per la ricerca per nome/cognome
CREATE INDEX idx_nome_cognome ON prenotazioni (nome, cognome);

-- Indice per la ricerca per data
CREATE INDEX idx_data_ritiro ON prenotazioni (data_ritiro); 