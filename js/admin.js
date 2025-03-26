document.addEventListener('DOMContentLoaded', function() {
    // Elementi del DOM
    const loginForm = document.getElementById('loginForm');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminDashboard = document.getElementById('adminDashboard');
    const prenotazioniTableBody = document.getElementById('prenotazioniTableBody');
    const noPrenotazioni = document.getElementById('noPrenotazioni');
    const totalCount = document.getElementById('totalCount');
    const totalAmount = document.getElementById('totalAmount');
    const filterData = document.getElementById('filterData');
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const tableHeaders = document.querySelectorAll('th[data-sort]');
    
    // Credenziali di accesso (in un'applicazione reale, questo dovrebbe essere gestito lato server)
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123';
    
    // Stato dell'applicazione
    let prenotazioni = [];
    let filteredPrenotazioni = [];
    let currentSort = {
        column: 'timestamp',
        direction: 'desc'
    };
    
    // Controlla se l'utente è già autenticato
    checkAuth();
    
    // Event listeners
    adminLoginForm.addEventListener('submit', handleLogin);
    filterData.addEventListener('change', applyFilters);
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
    
    // Funzione per verificare l'autenticazione
    function checkAuth() {
        const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
        
        if (isAuthenticated) {
            showDashboard();
            loadPrenotazioni();
        } else {
            showLoginForm();
        }
    }
    
    // Funzione per gestire il login
    function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // Salva lo stato di autenticazione
            sessionStorage.setItem('adminAuthenticated', 'true');
            
            // Mostra la dashboard
            showDashboard();
            loadPrenotazioni();
        } else {
            alert('Credenziali non valide. Riprova.');
        }
    }
    
    // Funzione per mostrare il form di login
    function showLoginForm() {
        loginForm.classList.remove('hidden');
        adminDashboard.classList.add('hidden');
    }
    
    // Funzione per mostrare la dashboard
    function showDashboard() {
        loginForm.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
    }
    
    // Funzione per caricare le prenotazioni dal localStorage
    function loadPrenotazioni() {
        prenotazioni = JSON.parse(localStorage.getItem('prenotazioni')) || [];
        filteredPrenotazioni = [...prenotazioni];
        
        // Applica l'ordinamento corrente
        sortPrenotazioni();
        
        // Applica i filtri correnti
        if (filterData.value) {
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
            noPrenotazioni.classList.remove('hidden');
            totalCount.textContent = '0';
            totalAmount.textContent = '0.00 €';
            return;
        }
        
        // Nascondi il messaggio se ci sono prenotazioni
        noPrenotazioni.classList.add('hidden');
        
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
            `;
            
            prenotazioniTableBody.appendChild(row);
        });
    }
    
    // Funzione per applicare i filtri
    function applyFilters() {
        const dataFiltro = filterData.value;
        
        if (dataFiltro) {
            filteredPrenotazioni = prenotazioni.filter(p => {
                return p.data === dataFiltro;
            });
        } else {
            filteredPrenotazioni = [...prenotazioni];
        }
        
        // Applica l'ordinamento corrente
        sortPrenotazioni();
        
        // Renderizza le prenotazioni filtrate
        renderPrenotazioni();
    }
    
    // Funzione per resettare i filtri
    function resetFilters() {
        filterData.value = '';
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
    
    // Funzione per il logout
    function logout() {
        // Rimuovi lo stato di autenticazione
        sessionStorage.removeItem('adminAuthenticated');
        
        // Mostra il form di login
        showLoginForm();
    }