# Sistema di Prenotazione Prelievi

Questo è un sistema web per la prenotazione di prelievi, progettato per essere utilizzato da dispositivi mobili e desktop. Il sistema consente ai clienti di prenotare il proprio prelievo per il giorno successivo e agli amministratori di visualizzare e gestire tutte le prenotazioni effettuate.

## Caratteristiche

### Interfaccia Cliente
- Prenotazione semplice e intuitiva
- Inserimento di nome, cognome, data di ritiro (automaticamente impostata al giorno successivo) e importo
- Conferma immediata della prenotazione
- Design responsive per un'ottima esperienza su dispositivi mobili

### Pannello Amministrativo
- Visualizzazione di tutte le prenotazioni in una tabella ordinabile
- Filtro per data di ritiro
- Statistiche sul numero totale di prenotazioni e sull'importo totale
- Protezione con autenticazione

## Come Utilizzare

### Per i Clienti
1. Aprire il file `index.html` nel browser
2. Compilare il modulo con i propri dati
3. Cliccare su "Prenota"
4. Ricevere la conferma della prenotazione

### Per gli Amministratori
1. Cliccare sul link "Accesso Amministratore" in fondo alla pagina principale
2. Inserire le credenziali di accesso:
   - Username: `admin`
   - Password: `admin123`
3. Visualizzare e gestire le prenotazioni

## Tecnologie Utilizzate

- HTML5
- CSS3
- JavaScript (ES6+)
- LocalStorage per la persistenza dei dati

## Note sulla Sicurezza

Questo sistema utilizza il localStorage del browser per memorizzare i dati delle prenotazioni. In un ambiente di produzione, sarebbe consigliabile implementare un backend con un database e un'autenticazione più robusta.

## Personalizzazione

È possibile personalizzare l'aspetto dell'applicazione modificando i file CSS nella cartella `css`.

---

© 2023 Sistema di Prenotazione Prelievi