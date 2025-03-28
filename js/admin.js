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
    
    // Stato dell'applicazione
    let prenotazioni = [];
    let filteredPrenotazioni = [];
    let currentSort = {
        column: 'timestamp',
        direction: 'desc'
    };
    
    // Carica direttamente le prenotazioni all'avvio
    loadPrenotazioni();
    filterData.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
    resetFilterBtn.addEventListener('click', resetFilters);
    refreshBtn.addEventListener('click', loadPrenotazioni);
    logoutBtn.addEventListener('click', logout);
    
    // Aggiungi event listeners per l'ordinamento della tabella
    tableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-sort');
            sortTable(column);
        });
    });
    
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
    function deletePrenotazione(timestamp) {
        if (confirm('Sei sicuro di voler eliminare questa prenotazione?')) {
            // Rimuovi la prenotazione dall'array
            prenotazioni = prenotazioni.filter(p => p.timestamp != timestamp);
            
            // Aggiorna il localStorage
            localStorage.setItem('prenotazioni', JSON.stringify(prenotazioni));
            
            // Aggiorna la visualizzazione
            loadPrenotazioni();
            
            // Mostra un messaggio di conferma
            showNotification('Prenotazione eliminata con successo!', 'success');
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
});