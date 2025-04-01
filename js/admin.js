document.addEventListener('DOMContentLoaded', function() {
    // Elementi del DOM
    const adminDashboard = document.getElementById('adminDashboard');
    const prenotazioniTableBody = document.getElementById('prenotazioniTableBody');
    const noPrenotazioni = document.getElementById('noPrenotazioni');
    const totalCount = document.getElementById('totalCount');
    const totalAmount = document.getElementById('totalAmount');
    const filterData = document.getElementById('filterData');
    const searchInput = document.getElementById('searchInput');
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const tableHeaders = document.querySelectorAll('th[data-sort]');
    const syncBtn = document.getElementById('syncBtn') || createSyncButton();
    const syncStatusIndicator = document.createElement('div');
    syncStatusIndicator.id = 'syncStatusIndicator';
    syncStatusIndicator.className = 'sync-status';
    document.querySelector('.admin-controls').appendChild(syncStatusIndicator);
    
    // Configurazione della sincronizzazione
    const API_URL = './backend/api.php';
    let syncInProgress = false;
    let lastSyncTime = localStorage.getItem('lastSyncTime') || null;
    
    // Stato dell'applicazione
    let prenotazioni = [];
    let filteredPrenotazioni = [];
    let currentSort = {
        column: 'timestamp',
        direction: 'desc'
    };
    
    // Carica direttamente le prenotazioni all'avvio
    loadPrenotazioni();
    updateSyncStatus();
    
    // Event listeners
    filterData.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
    resetFilterBtn.addEventListener('click', resetFilters);
    refreshBtn.addEventListener('click', loadPrenotazioni);
    logoutBtn.addEventListener('click', logout);
    syncBtn.addEventListener('click', sincronizzaPrenotazioni);
    
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
    
    // Aggiungi event listeners per l'ordinamento della tabella
    tableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-sort');
            sortTable(column);
        });
    });
    
    // Funzione per creare il pulsante di sincronizzazione se non esiste
    function createSyncButton() {
        const btn = document.createElement('button');
        btn.id = 'syncBtn';
        btn.className = 'btn btn-primary';
        btn.innerHTML = '<i class="fas fa-sync-alt"></i> Sincronizza';
        
        // Inserisci accanto al pulsante refresh
        refreshBtn.parentNode.insertBefore(btn, refreshBtn.nextSibling);
        return btn;
    }
    
    // Funzione per il logout
    function logout() {
        // Reindirizza alla home page
        window.location.href = 'index.html';
    }
    
    // Funzione per caricare le prenotazioni dal localStorage
    function loadPrenotazioni() {
        prenotazioni = JSON.parse(localStorage.getItem('prenotazioni')) || [];
        filteredPrenotazioni = [...prenotazioni];
        
        // Applica l'ordinamento corrente
        sortPrenotazioni();
        
        // Applica i filtri correnti
        if (filterData.value || searchInput.value) {
            applyFilters();
        } else {
            renderPrenotazioni();
        }
    }
    
    // Funzione per renderizzare le prenotazioni nella tabella
    function renderPrenotazioni() {
        // Svuota la tabella
        prenotazioniTableBody.innerHTML = '';
        
        // Mostra messaggio se non ci sono prenotazioni
        if (filteredPrenotazioni.length === 0) {
            noPrenotazioni.style.display = 'block';
            totalCount.textContent = '0';
            totalAmount.textContent = '0.00 €';
            return;
        }
        
        // Nascondi il messaggio se ci sono prenotazioni
        noPrenotazioni.style.display = 'none';
        
        // Calcola le statistiche
        totalCount.textContent = filteredPrenotazioni.length;
        const sum = filteredPrenotazioni.reduce((acc, p) => acc + parseFloat(p.importo), 0);
        totalAmount.textContent = sum.toFixed(2) + ' €';
        
        // Popola la tabella
        filteredPrenotazioni.forEach(p => {
            const row = document.createElement('tr');
            
            // Formatta la data di ritiro
            const dataRitiro = new Date(p.data);
            const giorno = String(dataRitiro.getDate()).padStart(2, '0');
            const mese = String(dataRitiro.getMonth() + 1).padStart(2, '0');
            const anno = dataRitiro.getFullYear();
            const dataRitiroFormattata = `${giorno}/${mese}/${anno}`;
            
            // Formatta la data di prenotazione
            const dataPrenotazione = new Date(p.timestamp);
            const dataPrenotazioneFormattata = `${String(dataPrenotazione.getDate()).padStart(2, '0')}/${String(dataPrenotazione.getMonth() + 1).padStart(2, '0')}/${dataPrenotazione.getFullYear()} ${String(dataPrenotazione.getHours()).padStart(2, '0')}:${String(dataPrenotazione.getMinutes()).padStart(2, '0')}`;
            
            row.innerHTML = `
                <td>${p.nome}</td>
                <td>${p.cognome}</td>
                <td>${dataRitiroFormattata}</td>
                <td>${parseFloat(p.importo).toFixed(2)} €</td>
                <td>${dataPrenotazioneFormattata}</td>
                <td class="action-cell">
                    <button class="btn-action btn-danger delete-btn" data-timestamp="${p.timestamp}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            prenotazioniTableBody.appendChild(row);
        });
        
        // Aggiungi event listener per i pulsanti di eliminazione
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const timestamp = this.getAttribute('data-timestamp');
                deletePrenotazione(timestamp);
            });
        });
    }
    
    // Funzione per eliminare una prenotazione
    async function deletePrenotazione(timestamp) {
        if (confirm('Sei sicuro di voler eliminare questa prenotazione?')) {
            // Rimuovi la prenotazione dall'array
            prenotazioni = prenotazioni.filter(p => p.timestamp != timestamp);
            
            // Aggiorna il localStorage
            localStorage.setItem('prenotazioni', JSON.stringify(prenotazioni));
            
            // Se online, comunica l'eliminazione anche al server
            if (navigator.onLine) {
                try {
                    const response = await fetch(`${API_URL}?action=delete`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ timestamp: timestamp })
                    });
                    
                    // Se eliminata con successo sul server, aggiorna l'interfaccia
                    if (response.ok) {
                        // Aggiorna la visualizzazione
                        loadPrenotazioni();
                        
                        // Mostra un messaggio di conferma
                        showNotification('Prenotazione eliminata con successo!', 'success');
                    } else {
                        // L'eliminazione sul server è fallita, ma è stata eliminata localmente
                        showNotification('Prenotazione eliminata localmente, ma non è stato possibile comunicare con il server.', 'warning');
                        loadPrenotazioni();
                    }
                } catch (error) {
                    console.error('Errore durante l\'eliminazione sul server:', error);
                    showNotification('Prenotazione eliminata localmente, ma si è verificato un errore di rete.', 'warning');
                    loadPrenotazioni();
                }
            } else {
                // Se offline, aggiorna solo l'interfaccia locale
                loadPrenotazioni();
                showNotification('Prenotazione eliminata localmente. Verrà sincronizzata col server quando sarai online.', 'info');
            }
        }
    }
    
    // Funzione per mostrare notifiche
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="close-btn"><i class="fas fa-times"></i></button>
        `;
        
        document.body.appendChild(notification);
        
        // Aggiungi event listener per chiudere la notifica
        notification.querySelector('.close-btn').addEventListener('click', () => {
            notification.remove();
        });
        
        // Rimuovi automaticamente la notifica dopo 5 secondi
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    // Funzione per applicare i filtri
    function applyFilters() {
        const dataFiltro = filterData.value;
        const searchFiltro = searchInput.value.toLowerCase();
        
        filteredPrenotazioni = [...prenotazioni];
        
        // Applica filtro per data
        if (dataFiltro) {
            filteredPrenotazioni = filteredPrenotazioni.filter(p => {
                return p.data === dataFiltro;
            });
        }
        
        // Applica filtro di ricerca
        if (searchFiltro) {
            filteredPrenotazioni = filteredPrenotazioni.filter(p => {
                return p.nome.toLowerCase().includes(searchFiltro) || 
                       p.cognome.toLowerCase().includes(searchFiltro);
            });
        }
        
        // Applica l'ordinamento corrente
        sortPrenotazioni();
        
        // Renderizza le prenotazioni filtrate
        renderPrenotazioni();
    }
    
    // Funzione per resettare i filtri
    function resetFilters() {
        filterData.value = '';
        searchInput.value = '';
        filteredPrenotazioni = [...prenotazioni];
        
        // Applica l'ordinamento corrente
        sortPrenotazioni();
        
        // Renderizza tutte le prenotazioni
        renderPrenotazioni();
    }
    
    // Funzione per ordinare la tabella
    function sortTable(column) {
        // Aggiorna la direzione dell'ordinamento
        if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.column = column;
            currentSort.direction = 'asc';
        }
        
        // Aggiorna le classi delle intestazioni della tabella
        tableHeaders.forEach(header => {
            const headerColumn = header.getAttribute('data-sort');
            header.classList.remove('sorted-asc', 'sorted-desc');
            
            if (headerColumn === currentSort.column) {
                header.classList.add(`sorted-${currentSort.direction}`);
            }
        });
        
        // Ordina le prenotazioni
        sortPrenotazioni();
        
        // Renderizza le prenotazioni ordinate
        renderPrenotazioni();
    }
    
    // Funzione per ordinare le prenotazioni
    function sortPrenotazioni() {
        filteredPrenotazioni.sort((a, b) => {
            let valueA, valueB;
            
            // Gestisci diversi tipi di dati
            switch (currentSort.column) {
                case 'importo':
                    valueA = parseFloat(a.importo);
                    valueB = parseFloat(b.importo);
                    break;
                case 'data':
                    valueA = new Date(a.data).getTime();
                    valueB = new Date(b.data).getTime();
                    break;
                case 'timestamp':
                    valueA = new Date(a.timestamp).getTime();
                    valueB = new Date(b.timestamp).getTime();
                    break;
                default:
                    valueA = a[currentSort.column].toLowerCase();
                    valueB = b[currentSort.column].toLowerCase();
            }
            
            // Applica la direzione dell'ordinamento
            if (currentSort.direction === 'asc') {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });
    }
    
    /**
     * Funzioni per la sincronizzazione
     */
    
    // Aggiorna lo stato di sincronizzazione visualizzato
    function updateSyncStatus() {
        if (syncInProgress) {
            syncStatusIndicator.textContent = 'Sincronizzazione in corso...';
            syncStatusIndicator.className = 'sync-status syncing';
            syncBtn.disabled = true;
        } else if (!navigator.onLine) {
            syncStatusIndicator.textContent = 'Offline - Dati salvati localmente';
            syncStatusIndicator.className = 'sync-status offline';
            syncBtn.disabled = true;
        } else if (lastSyncTime) {
            const lastSync = new Date(parseInt(lastSyncTime));
            syncStatusIndicator.textContent = `Ultima sincronizzazione: ${lastSync.toLocaleString()}`;
            syncStatusIndicator.className = 'sync-status synced';
            syncBtn.disabled = false;
        } else {
            syncStatusIndicator.textContent = 'Non sincronizzato';
            syncStatusIndicator.className = 'sync-status not-synced';
            syncBtn.disabled = false;
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
            // 1. Prima carica le prenotazioni dal server
            const getResponse = await fetch(`${API_URL}?action=get`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (getResponse.ok) {
                const serverData = await getResponse.json();
                
                if (serverData.prenotazioni) {
                    // Combina le prenotazioni del server con quelle locali
                    mergePrenotazioni(serverData.prenotazioni);
                }
            }
            
            // 2. Poi invia le prenotazioni locali al server
            const localPrenotazioni = JSON.parse(localStorage.getItem('prenotazioni')) || [];
            
            if (localPrenotazioni.length > 0) {
                const postResponse = await fetch(`${API_URL}?action=sync`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prenotazioni: localPrenotazioni })
                });
                
                if (postResponse.ok) {
                    const result = await postResponse.json();
                    
                    // Aggiorna le prenotazioni locali con gli ID server
                    if (result.success && result.results) {
                        // Aggiorna le prenotazioni locali con gli ID server
                        for (const res of result.results) {
                            const index = localPrenotazioni.findIndex(p => p.timestamp === res.timestamp);
                            if (index !== -1) {
                                localPrenotazioni[index].server_id = res.server_id;
                            }
                        }
                        
                        // Aggiorna il localStorage
                        localStorage.setItem('prenotazioni', JSON.stringify(localPrenotazioni));
                    }
                }
            }
            
            // Aggiorna l'orario dell'ultima sincronizzazione
            lastSyncTime = Date.now().toString();
            localStorage.setItem('lastSyncTime', lastSyncTime);
            
            // Ricarica le prenotazioni nella UI
            loadPrenotazioni();
            
            // Mostra notifica di successo
            showNotification('Sincronizzazione completata con successo!', 'success');
        } catch (error) {
            console.error('Errore durante la sincronizzazione:', error);
            showNotification('Errore durante la sincronizzazione. Riprova più tardi.', 'error');
        } finally {
            syncInProgress = false;
            updateSyncStatus();
        }
    }
    
    // Funzione per unire le prenotazioni del server con quelle locali
    function mergePrenotazioni(serverPrenotazioni) {
        // Ottieni le prenotazioni locali
        let localPrenotazioni = JSON.parse(localStorage.getItem('prenotazioni')) || [];
        
        // Mappa per tenere traccia delle prenotazioni per timestamp
        const prenotazioniMap = {};
        
        // Prima aggiungi tutte le prenotazioni locali alla mappa
        localPrenotazioni.forEach(p => {
            prenotazioniMap[p.timestamp] = p;
        });
        
        // Poi aggiungi o aggiorna con le prenotazioni del server
        serverPrenotazioni.forEach(p => {
            // Se non esiste localmente o ha un server_id, aggiorna/aggiungi
            if (!prenotazioniMap[p.timestamp] || !prenotazioniMap[p.timestamp].server_id) {
                prenotazioniMap[p.timestamp] = {...p};
            }
        });
        
        // Converti la mappa in un array
        const mergedPrenotazioni = Object.values(prenotazioniMap);
        
        // Aggiorna il localStorage
        localStorage.setItem('prenotazioni', JSON.stringify(mergedPrenotazioni));
        
        // Aggiorna le prenotazioni in memoria
        prenotazioni = mergedPrenotazioni;
    }
});