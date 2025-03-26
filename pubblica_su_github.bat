@echo off
echo ===================================================
echo    PUBBLICAZIONE AUTOMATICA SU GITHUB PAGES
echo ===================================================
echo.

:: Verifica se Git è installato
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERRORE: Git non è installato sul sistema.
    echo Scarica e installa Git da https://git-scm.com/downloads
    echo.
    pause
    exit /b 1
)

:: Verifica se la cartella è già un repository Git
if not exist ".git" (
    echo Inizializzazione del repository Git...
    git init
    if %ERRORLEVEL% neq 0 (
        echo ERRORE: Impossibile inizializzare il repository Git.
        pause
        exit /b 1
    )
    echo Repository Git inizializzato con successo.
) else (
    echo Repository Git già inizializzato.
)

:: Aggiunge tutti i file al repository
echo.
echo Aggiunta dei file al repository...
git add .
if %ERRORLEVEL% neq 0 (
    echo ERRORE: Impossibile aggiungere i file al repository.
    pause
    exit /b 1
)
echo File aggiunti con successo.

:: Richiede un messaggio di commit all'utente
echo.
set /p COMMIT_MSG=Inserisci un messaggio per il commit (es. "Aggiornamento del sito"): 
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Aggiornamento del sito

:: Crea un commit con il messaggio fornito
echo.
echo Creazione del commit...
git commit -m "%COMMIT_MSG%"
if %ERRORLEVEL% neq 0 (
    echo ERRORE: Impossibile creare il commit.
    echo Assicurati di aver configurato il tuo nome utente e email di Git con i comandi:
    echo git config --global user.name "Il tuo nome"
    echo git config --global user.email "la-tua-email@esempio.com"
    pause
    exit /b 1
)
echo Commit creato con successo.

:: Verifica se esiste un remote origin
git remote -v | findstr origin >nul
if %ERRORLEVEL% neq 0 (
    echo.
    echo Non è stato configurato un repository remoto.
    echo Per pubblicare su GitHub, è necessario creare un repository su GitHub e collegarlo.
    echo.
    set /p REPO_URL=Inserisci l'URL del repository GitHub (es. https://github.com/username/prenotazioneprelievi.git): 
    
    if "%REPO_URL%"=="" (
        echo Nessun URL fornito. Impossibile continuare.
        pause
        exit /b 1
    )
    
    echo Collegamento al repository remoto...
    git remote add origin %REPO_URL%
    if %ERRORLEVEL% neq 0 (
        echo ERRORE: Impossibile collegare il repository remoto.
        pause
        exit /b 1
    )
    echo Repository remoto collegato con successo.
) else (
    echo Repository remoto già configurato.
)

:: Push al repository remoto
echo.
echo Pubblicazione su GitHub...
git push -u origin master
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERRORE: Impossibile pubblicare su GitHub.
    echo Possibili cause:
    echo 1. Non hai accesso al repository remoto.
    echo 2. Il branch locale non corrisponde al branch remoto.
    echo.
    echo Prova a eseguire: git push -u origin main
    echo.
    set /p BRANCH=Vuoi provare a pubblicare sul branch "main" invece di "master"? (s/n): 
    if /i "%BRANCH%"=="s" (
        git push -u origin main
        if %ERRORLEVEL% neq 0 (
            echo ERRORE: Impossibile pubblicare sul branch "main".
            pause
            exit /b 1
        )
    ) else (
        pause
        exit /b 1
    )
)

:: Configurazione di GitHub Pages
echo.
echo Pubblicazione completata con successo!
echo.
echo Per attivare GitHub Pages:
echo 1. Vai su https://github.com/[username]/prenotazioneprelievi/settings/pages
echo 2. Nella sezione "Source", seleziona il branch master (o main)
echo 3. Clicca su "Save"
echo.
echo Il tuo sito sarà disponibile all'indirizzo:
echo https://[username].github.io/prenotazioneprelievi/
echo.
echo ===================================================

pause