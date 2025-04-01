# Sistema di Sincronizzazione Prenotazioni Prelievi

Questo documento descrive come configurare e utilizzare il sistema di sincronizzazione per le prenotazioni prelievi.

## Requisiti

- PHP 7.2 o superiore
- MySQL 5.7 o superiore
- Un server web (Apache, Nginx, ecc.)

## Configurazione

1. **Configurazione del database**

   Creare un database MySQL e configurare le credenziali nel file `config.php`:

   ```php
   define('DB_HOST', 'localhost');   // Indirizzo del server MySQL
   define('DB_USER', 'username');    // Username MySQL
   define('DB_PASS', 'password');    // Password MySQL
   define('DB_NAME', 'prenotazioni_prelievi'); // Nome del database
   ```

2. **Creazione delle tabelle**

   Eseguire lo script SQL `create_table.sql` per creare le tabelle necessarie:

   ```bash
   mysql -u username -p < create_table.sql
   ```

   In alternativa, importare il file SQL tramite phpMyAdmin o un altro strumento di gestione MySQL.

## Come funziona la sincronizzazione

Il sistema utilizza un approccio di sincronizzazione bidirezionale:

1. **Client → Server**: Le prenotazioni create sul dispositivo vengono salvate prima localmente nel localStorage, poi sincronizzate con il server quando è disponibile una connessione.

2. **Server → Client**: Durante la sincronizzazione, il client recupera anche le prenotazioni create su altri dispositivi.

3. **Risoluzione dei conflitti**: In caso di conflitti, viene data priorità alla versione più recente.

## API disponibili

Il sistema fornisce due endpoint API:

1. **GET /backend/api.php?action=get**
   
   Restituisce tutte le prenotazioni presenti nel database.

2. **POST /backend/api.php?action=sync**
   
   Sincronizza le prenotazioni inviate dal client con il database.

   Payload di esempio:
   ```json
   {
     "prenotazioni": [
       {
         "nome": "Mario",
         "cognome": "Rossi",
         "data": "2023-12-15",
         "importo": "150.00",
         "timestamp": "2023-12-12T10:30:00.000Z"
       }
     ]
   }
   ```

## Modalità offline

Il sistema funziona anche in modalità offline:

1. Le prenotazioni vengono salvate nel localStorage del browser
2. Quando la connessione è ripristinata, le prenotazioni vengono sincronizzate automaticamente
3. Un indicatore visivo mostra lo stato della sincronizzazione

## Sicurezza

Per un ambiente di produzione, si consiglia di:

1. Configurare HTTPS per tutte le comunicazioni
2. Implementare un sistema di autenticazione per l'accesso alle API
3. Limitare l'accesso al server solo agli indirizzi IP autorizzati 