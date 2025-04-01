# Sistema di Prenotazione Prelievi

Questo è un sistema web per la prenotazione di prelievi, progettato per essere utilizzato da dispositivi mobili e desktop. Il sistema consente ai clienti di prenotare il proprio prelievo per il giorno successivo e agli amministratori di visualizzare e gestire tutte le prenotazioni effettuate.

## Caratteristiche

### Interfaccia Cliente
- Prenotazione semplice e intuitiva
- Inserimento di nome, cognome, data di ritiro e importo
- Conferma immediata della prenotazione
- Design responsive per un'ottima esperienza su dispositivi mobili
- **Sincronizzazione** con il server quando si è online

### Pannello Amministrativo
- Visualizzazione di tutte le prenotazioni in una tabella ordinabile
- Filtro per data di ritiro
- Statistiche sul numero totale di prenotazioni e sull'importo totale
- **Sincronizzazione** con il server e altri dispositivi
- Protezione con autenticazione

### Funzionalità di Sincronizzazione
- Funzionamento anche offline con salvataggio locale
- Sincronizzazione automatica quando si torna online
- Supporto per più dispositivi con condivisione dati
- Indicatori visivi dello stato di sincronizzazione

## Configurazione

### Requisiti
- PHP 7.2 o superiore
- MySQL 5.7 o superiore
- Un server web (Apache, Nginx, ecc.)

### Installazione
1. Clonare o scaricare il repository
2. Configurare le credenziali del database in `backend/config.php`
3. Eseguire lo script di installazione `backend/install.php` tramite browser
4. (Opzionale) Importare manualmente lo schema del database da `backend/create_table.sql`

## Come Utilizzare

### Per i Clienti
1. Aprire il file `index.html` nel browser
2. Compilare il modulo con i propri dati
3. Cliccare su "Prenota"
4. Ricevere la conferma della prenotazione
5. Le prenotazioni vengono sincronizzate automaticamente con il server quando si è online

### Per gli Amministratori
1. Cliccare sul link "Accesso Amministratore" in fondo alla pagina principale
2. Visualizzare e gestire le prenotazioni
3. Utilizzare il pulsante "Sincronizza" per sincronizzare manualmente con il server
4. Monitorare lo stato della sincronizzazione tramite l'indicatore visivo

## Tecnologie Utilizzate

- HTML5
- CSS3
- JavaScript (ES6+)
- PHP per il backend
- MySQL per il database
- LocalStorage per la persistenza dei dati offline

## Funzionamento Offline

Il sistema supporta il funzionamento offline:
1. I dati vengono salvati nel localStorage del browser
2. Quando si è online, le prenotazioni vengono sincronizzate con il server
3. Un indicatore visivo mostra lo stato della sincronizzazione
4. Le modifiche effettuate su un dispositivo saranno visibili su tutti gli altri dispositivi dopo la sincronizzazione

## Sicurezza

Per un ambiente di produzione, si consiglia di:
1. Configurare HTTPS per tutte le comunicazioni
2. Implementare un sistema di autenticazione robusto per l'accesso alle API
3. Limitare l'accesso al server solo agli indirizzi IP autorizzati
4. Configurare le credenziali di database appropriate in `backend/config.php`

## Personalizzazione

È possibile personalizzare l'aspetto dell'applicazione modificando i file CSS nella cartella `css`.

---

© 2023 Sistema di Prenotazione Prelievi