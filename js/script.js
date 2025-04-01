document.addEventListener('DOMContentLoaded', function() {
    // Elementi del DOM
    const prenotazioneForm = document.getElementById('prenotazioneForm');
    const confermaDiv = document.getElementById('conferma');
    const nuovaPrenotazioneBtn = document.getElementById('nuovaPrenotazione');
    const dataInput = document.getElementById('data');
    const syncStatusIndicator = document.createElement('div');
    syncStatusIndicator.id = 'syncStatusIndicator';
    syncStatusIndicator.className = 'sync-status';
    document.querySelector('header').appendChild(syncStatusIndicator);
    
    // Configurazione della sincronizzazione
    const API_URL = './backend/api.php';
    let syncInProgress = false;
    let lastSyncTime = localStorage.getItem('lastSyncTime') || null;
    
    // Imposta il range di date selezionabili (da domani a due settimane)
    impostaRangeDate();
    
    // Event listeners
    prenotazioneForm.addEventListener('submit', gestisciPrenotazione);
    nuovaPrenotazioneBtn.addEventListener('click', mostraForm);
    
    // Aggiorna lo stato di sincronizzazione all'avvio
    updateSyncStatus();
    
    // Tenta di sincronizzare all'avvio
    sincronizzaPrenotazioni();
    
    // Imposta la sincronizzazione periodica (ogni 5 minuti)
    setInterval(sincronizzaPrenotazioni, 5 * 60 * 1000);
    
    // Controlla lo stato della connessione
    window.addEventListener('online', function() {
        syncStatusIndicator.textContent = 'Online - Sincronizzazione in corso...';
        syncStatusIndicator.className = 'sync-status syncing';
        sincronizzaPrenotazioni();
    });
    
    window.addEventListener('offline', function() {
        syncStatusIndicator.textContent = 'Offline - Dati salvati localmente';
        syncStatusIndicator.className = 'sync-status offline';
    });
    
    // Funzione per impostare il range di date selezionabili (da domani a un mese)
    function impostaRangeDate() {
        const oggi = new Date();
        
        // Data minima: domani
        const domani = new Date(oggi);
        domani.setDate(oggi.getDate() + 1);
        const annoMin = domani.getFullYear();
        const meseMin = String(domani.getMonth() + 1).padStart(2, '0');
        const giornoMin = String(domani.getDate()).padStart(2, '0');
        const dataMin = `${annoMin}-${meseMin}-${giornoMin}`;
        
        // Data massima: un mese dopo
        const unMese = new Date(oggi);
        unMese.setDate(oggi.getDate() + 30); // +30 giorni (1 mese)
        const annoMax = unMese.getFullYear();
        const meseMax = String(unMese.getMonth() + 1).padStart(2, '0');
        const giornoMax = String(unMese.getDate()).padStart(2, '0');
        const dataMax = `${annoMax}-${meseMax}-${giornoMax}`;
        
        // Imposta gli attributi min e max dell'input date
        dataInput.setAttribute('min', dataMin);
        dataInput.setAttribute('max', dataMax);
        
        // Imposta la data di default a domani
        dataInput.value = dataMin;
        
        // Aggiungi event listener per disabilitare lunedì, sabato e domenica
        dataInput.addEventListener('input', filtraGiorniSettimana);
        
        // Aggiungi event listener per disabilitare lunedì, sabato e domenica quando si apre il calendario
        dataInput.addEventListener('click', disabilitaGiorniNonValidi);
        
        // Esegui il filtro iniziale per la data di default
        filtraGiorniSettimana();
        
        // Disabilita i giorni non validi nel calendario
        disabilitaGiorniNonValidi();
    }
    
    // Funzione per filtrare i giorni della settimana (solo martedì-venerdì selezionabili)
    function filtraGiorniSettimana() {
        const dataSelezionata = new Date(dataInput.value);
        const giornoSettimana = dataSelezionata.getDay(); // 0=domenica, 1=lunedì, ..., 6=sabato
        
        // Se è lunedì (1), sabato (6) o domenica (0), trova il prossimo giorno valido
        if (giornoSettimana === 0 || giornoSettimana === 1 || giornoSettimana === 6) {
            // Calcola quanti giorni aggiungere per arrivare al prossimo martedì
            let giorniDaAggiungere = 0;
            
            if (giornoSettimana === 0) { // Domenica -> Martedì = +2
                giorniDaAggiungere = 2;
            } else if (giornoSettimana === 1) { // Lunedì -> Martedì = +1
                giorniDaAggiungere = 1;
            } else if (giornoSettimana === 6) { // Sabato -> Martedì = +3
                giorniDaAggiungere = 3;
            }
            
            // Imposta la data al prossimo giorno valido
            dataSelezionata.setDate(dataSelezionata.getDate() + giorniDaAggiungere);
            
            // Formatta la nuova data e aggiorna il campo
            const anno = dataSelezionata.getFullYear();
            const mese = String(dataSelezionata.getMonth() + 1).padStart(2, '0');
            const giorno = String(dataSelezionata.getDate()).padStart(2, '0');
            dataInput.value = `${anno}-${mese}-${giorno}`;
        }
    }
    
    // Funzione per disabilitare lunedì, sabato e domenica nel calendario
    function disabilitaGiorniNonValidi() {
        // Aggiungi stile CSS per disabilitare lunedì, sabato e domenica nel calendario
        if (!document.getElementById('date-picker-style')) {
            const style = document.createElement('style');
            style.id = 'date-picker-style';
            style.textContent = `
                /* Stile per disabilitare lunedì, sabato e domenica nel calendario */
                input[type="date"]::-webkit-calendar-picker-indicator {
                    cursor: pointer;
                }
                
                /* Questo stile viene applicato tramite JavaScript */
                .data-non-valida {
                    color: #ccc;
                    text-decoration: line-through;
                    pointer-events: none;
                    opacity: 0.5;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Aggiungi un event listener per intercettare l'apertura del calendario
        // Nota: questo è un workaround poiché non è possibile modificare direttamente il calendario nativo
        dataInput.addEventListener('mousedown', function(e) {
            // Mostra un messaggio informativo
            const messaggioInfo = document.createElement('div');
            messaggioInfo.className = 'info-message';
            messaggioInfo.textContent = 'Ricorda: puoi selezionare solo giorni da martedì a venerdì';
            messaggioInfo.style.color = '#3498db';
            messaggioInfo.style.fontSize = '0.9rem';
            messaggioInfo.style.marginTop = '5px';
            
            // Rimuovi eventuali messaggi precedenti
            const messaggioPrecedente = document.querySelector('.info-message');
            if (messaggioPrecedente) {
                messaggioPrecedente.remove();
            }
            
            // Aggiungi il messaggio dopo l'input della data
            dataInput.parentNode.appendChild(messaggioInfo);
            
            // Rimuovi il messaggio dopo 5 secondi
            setTimeout(() => {
                if (messaggioInfo.parentNode) {
                    messaggioInfo.remove();
                }
            }, 5000);
        });
    }
    
    // Funzione per gestire la prenotazione
    function gestisciPrenotazione(e) {
        e.preventDefault();
        
        // Ottieni i valori dal form
        const nome = document.getElementById('nome').value.trim();
        const cognome = document.getElementById('cognome').value.trim();
        const data = document.getElementById('data').value;
        const importo = document.getElementById('importo').value;
        
        // Validazione
        if (!nome || !cognome || !data || !importo) {
            alert('Per favore, compila tutti i campi.');
            return;
        }
        
        // Crea oggetto prenotazione
        const prenotazione = {
            nome,
            cognome,
            data,
            importo,
            timestamp: new Date().toISOString()
        };
        
        // Salva la prenotazione
        salvaPrenotazione(prenotazione);
        
        // Mostra conferma
        mostraConferma(prenotazione);
        
        // Tenta di sincronizzare dopo aver salvato una nuova prenotazione
        sincronizzaPrenotazioni();
    }
    
    // Funzione per salvare la prenotazione nel localStorage
    function salvaPrenotazione(prenotazione) {
        // Ottieni le prenotazioni esistenti o inizializza un array vuoto
        let prenotazioni = JSON.parse(localStorage.getItem('prenotazioni')) || [];
        
        // Aggiungi la nuova prenotazione
        prenotazioni.push(prenotazione);
        
        // Salva nel localStorage
        localStorage.setItem('prenotazioni', JSON.stringify(prenotazioni));
    }
    
    // Funzione per mostrare la conferma
    function mostraConferma(prenotazione) {
        // Nascondi il form
        prenotazioneForm.parentElement.classList.add('hidden');
        
        // Popola i dettagli della conferma
        document.getElementById('conf-nome').textContent = prenotazione.nome;
        document.getElementById('conf-cognome').textContent = prenotazione.cognome;
        
        // Formatta la data in formato italiano (GG/MM/AAAA)
        const dataObj = new Date(prenotazione.data);
        const giorno = String(dataObj.getDate()).padStart(2, '0');
        const mese = String(dataObj.getMonth() + 1).padStart(2, '0');
        const anno = dataObj.getFullYear();
        const dataFormattata = `${giorno}/${mese}/${anno}`;
        
        document.getElementById('conf-data').textContent = dataFormattata;
        document.getElementById('conf-importo').textContent = parseFloat(prenotazione.importo).toFixed(2);
        
        // Mostra la conferma
        confermaDiv.classList.remove('hidden');
    }
    
    // Funzione per mostrare nuovamente il form
    function mostraForm() {
        // Nascondi la conferma
        confermaDiv.classList.add('hidden');
        
        // Resetta il form
        prenotazioneForm.reset();
        impostaRangeDate();
        
        // Mostra il form
        prenotazioneForm.parentElement.classList.remove('hidden');
    }
    
    /**
     * Funzioni per la sincronizzazione
     */
    
    // Aggiorna lo stato di sincronizzazione visualizzato
    function updateSyncStatus() {
        if (syncInProgress) {
            syncStatusIndicator.textContent = 'Sincronizzazione in corso...';
            syncStatusIndicator.className = 'sync-status syncing';
        } else if (!navigator.onLine) {
            syncStatusIndicator.textContent = 'Offline - Dati salvati localmente';
            syncStatusIndicator.className = 'sync-status offline';
        } else if (lastSyncTime) {
            const lastSync = new Date(parseInt(lastSyncTime));
            syncStatusIndicator.textContent = `Ultima sincronizzazione: ${lastSync.toLocaleString()}`;
            syncStatusIndicator.className = 'sync-status synced';
        } else {
            syncStatusIndicator.textContent = 'Non sincronizzato';
            syncStatusIndicator.className = 'sync-status not-synced';
        }
    }
    
    // Sincronizza le prenotazioni con il server
    async function sincronizzaPrenotazioni() {
        // Non sincronizzare se già in corso o se offline
        if (syncInProgress || !navigator.onLine) {
            updateSyncStatus();
            return;
        }
        
        syncInProgress = true;
        updateSyncStatus();
        
        try {
            // Ottieni le prenotazioni dal localStorage
            const prenotazioni = JSON.parse(localStorage.getItem('prenotazioni')) || [];
            
            // Se non ci sono prenotazioni da sincronizzare, esci
            if (prenotazioni.length === 0) {
                syncInProgress = false;
                updateSyncStatus();
                return;
            }
            
            // Invia le prenotazioni al server
            const response = await fetch(`${API_URL}?action=sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prenotazioni: prenotazioni })
            });
            
            // Gestisci la risposta
            if (response.ok) {
                const result = await response.json();
                
                // Aggiorna le prenotazioni locali con gli ID server
                if (result.success && result.results) {
                    // Aggiorna l'orario dell'ultima sincronizzazione
                    lastSyncTime = Date.now().toString();
                    localStorage.setItem('lastSyncTime', lastSyncTime);
                    
                    // Se necessario, aggiorna le prenotazioni locali con gli ID server
                    for (const res of result.results) {
                        const index = prenotazioni.findIndex(p => p.timestamp === res.timestamp);
                        if (index !== -1) {
                            prenotazioni[index].server_id = res.server_id;
                        }
                    }
                    
                    // Aggiorna il localStorage
                    localStorage.setItem('prenotazioni', JSON.stringify(prenotazioni));
                }
            } else {
                console.error('Errore durante la sincronizzazione');
            }
        } catch (error) {
            console.error('Errore di rete durante la sincronizzazione:', error);
        } finally {
            syncInProgress = false;
            updateSyncStatus();
        }
    }
});