<?php
require_once 'config.php';

// Gestione delle richieste in base al metodo
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Imposta gli header per CORS e JSON
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Gestisci le richieste OPTIONS (per CORS)
if ($method === 'OPTIONS') {
    sendResponse([], 200);
}

// Instrada la richiesta alla funzione appropriata
switch ($action) {
    case 'sync':
        if ($method === 'POST') {
            syncPrenotazioni();
        } else {
            sendResponse(['error' => 'Metodo non consentito'], 405);
        }
        break;
    case 'get':
        if ($method === 'GET') {
            getPrenotazioni();
        } else {
            sendResponse(['error' => 'Metodo non consentito'], 405);
        }
        break;
    case 'delete':
        if ($method === 'POST') {
            deletePrenotazione();
        } else {
            sendResponse(['error' => 'Metodo non consentito'], 405);
        }
        break;
    default:
        sendResponse(['error' => 'Azione non valida'], 400);
}

/**
 * Ottiene tutte le prenotazioni dal database
 */
function getPrenotazioni() {
    $conn = connectDB();
    
    // Query per ottenere tutte le prenotazioni
    $sql = "SELECT * FROM prenotazioni ORDER BY timestamp DESC";
    $result = $conn->query($sql);
    
    if ($result === false) {
        sendResponse(['error' => 'Errore nella query: ' . $conn->error], 500);
    }
    
    $prenotazioni = [];
    while ($row = $result->fetch_assoc()) {
        $prenotazioni[] = [
            'id' => $row['id'],
            'nome' => $row['nome'],
            'cognome' => $row['cognome'],
            'data' => $row['data_ritiro'],
            'importo' => $row['importo'],
            'timestamp' => $row['timestamp'],
            'server_id' => $row['id']
        ];
    }
    
    closeDB($conn);
    sendResponse(['prenotazioni' => $prenotazioni]);
}

/**
 * Sincronizza le prenotazioni dal client al server
 */
function syncPrenotazioni() {
    // Ottieni i dati JSON dalla richiesta
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!isset($data['prenotazioni']) || !is_array($data['prenotazioni'])) {
        sendResponse(['error' => 'Formato dati non valido'], 400);
    }
    
    $conn = connectDB();
    $prenotazioni = $data['prenotazioni'];
    $risultati = [];
    
    // Inizia una transazione
    $conn->begin_transaction();
    
    try {
        foreach ($prenotazioni as $p) {
            // Verifica se la prenotazione esiste già (usando il timestamp come identificatore unico)
            $stmt = $conn->prepare("SELECT id FROM prenotazioni WHERE timestamp = ?");
            $stmt->bind_param("s", $p['timestamp']);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                // La prenotazione esiste già, aggiorna
                $row = $result->fetch_assoc();
                $id = $row['id'];
                
                $stmt = $conn->prepare("UPDATE prenotazioni SET nome = ?, cognome = ?, data_ritiro = ?, importo = ? WHERE id = ?");
                $stmt->bind_param("sssdi", $p['nome'], $p['cognome'], $p['data'], $p['importo'], $id);
                $stmt->execute();
                
                $risultati[] = [
                    'timestamp' => $p['timestamp'],
                    'server_id' => $id,
                    'status' => 'updated'
                ];
            } else {
                // Nuova prenotazione, inserisci
                $stmt = $conn->prepare("INSERT INTO prenotazioni (nome, cognome, data_ritiro, importo, timestamp) VALUES (?, ?, ?, ?, ?)");
                $stmt->bind_param("sssds", $p['nome'], $p['cognome'], $p['data'], $p['importo'], $p['timestamp']);
                $stmt->execute();
                
                $risultati[] = [
                    'timestamp' => $p['timestamp'],
                    'server_id' => $conn->insert_id,
                    'status' => 'inserted'
                ];
            }
        }
        
        // Commit della transazione
        $conn->commit();
        closeDB($conn);
        
        sendResponse([
            'success' => true,
            'results' => $risultati
        ]);
    } catch (Exception $e) {
        // Rollback in caso di errore
        $conn->rollback();
        closeDB($conn);
        sendResponse(['error' => 'Errore durante la sincronizzazione: ' . $e->getMessage()], 500);
    }
}

/**
 * Elimina una prenotazione dal database
 */
function deletePrenotazione() {
    // Ottieni i dati JSON dalla richiesta
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Verifica se è stato fornito un timestamp valido
    if (!isset($data['timestamp']) || empty($data['timestamp'])) {
        sendResponse(['error' => 'Timestamp non valido'], 400);
    }
    
    $timestamp = $data['timestamp'];
    
    // Connessione al database
    $conn = connectDB();
    
    // Utilizza una query preparata per evitare SQL injection
    $stmt = $conn->prepare("DELETE FROM prenotazioni WHERE timestamp = ?");
    $stmt->bind_param("s", $timestamp);
    $result = $stmt->execute();
    
    if ($result === false) {
        closeDB($conn);
        sendResponse(['error' => 'Errore durante l\'eliminazione: ' . $conn->error], 500);
    }
    
    // Verifica se è stata eliminata almeno una riga
    if ($stmt->affected_rows > 0) {
        closeDB($conn);
        sendResponse(['success' => true, 'message' => 'Prenotazione eliminata con successo']);
    } else {
        closeDB($conn);
        sendResponse(['success' => false, 'message' => 'Nessuna prenotazione trovata con il timestamp specificato']);
    }
} 