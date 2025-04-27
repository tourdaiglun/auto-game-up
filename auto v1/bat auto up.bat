::[Bat To Exe Converter]
::
::YAwzoRdxOk+EWAnk
::fBw5plQjdG8=
::YAwzuBVtJxjWCl3EqQJgSA==
::ZR4luwNxJguZRRnk
::Yhs/ulQjdF+5
::cxAkpRVqdFKZSDk=
::cBs/ulQjdF+5
::ZR41oxFsdFKZSDk=
::eBoioBt6dFKZSDk=
::cRo6pxp7LAbNWATEpCI=
::egkzugNsPRvcWATEpCI=
::dAsiuh18IRvcCxnZtBJQ
::cRYluBh/LU+EWAnk
::YxY4rhs+aU+JeA==
::cxY6rQJ7JhzQF1fEqQJQ
::ZQ05rAF9IBncCkqN+0xwdVs0
::ZQ05rAF9IAHYFVzEqQJQ
::eg0/rx1wNQPfEVWB+kM9LVsJDGQ=
::fBEirQZwNQPfEVWB+kM9LVsJDGQ=
::cRolqwZ3JBvQF1fEqQJQ
::dhA7uBVwLU+EWDk=
::YQ03rBFzNR3SWATElA==
::dhAmsQZ3MwfNWATElA==
::ZQ0/vhVqMQ3MEVWAtB9wSA==
::Zg8zqx1/OA3MEVWAtB9wSA==
::dhA7pRFwIByZRRnk
::Zh4grVQjdCyDJGyX8VAjFA9bWRaGAE+/Fb4I5/jH7v+TrQ0IRKJtRI7OzrvONrEv713hNZc4wnUajdtCCQNdHg==
::YB416Ek+ZG8=
::
::
::978f952a14a936cc963da21a135fa983
@echo off
chcp 65001 >nul

:: === CONFIGURATION ===
setlocal enabledelayedexpansion
set "winrar_path=C:\Program Files\WinRAR\WinRAR.exe"
set "destination=Archives"
set "signature={cFinder}"
set "template=commentaire_template.txt"
set "commentaire=commentaire.txt"
set "logo=logo.png"
set "temp_folder=extracted"
set "pixeldrain_api_url=https://pixeldrain.com/api/file"
set "pixeldrain_api_key=d4c47035-ff06-4304-a09f-c1ac33efdddb"

:: === INPUT UTILISATEUR ===
echo ========================================
set /p "game_name=Nom du jeu : "
set /p "version=Version du jeu : "
set /p "repacker=Nom du repacker (ex: FitGirl, DODI, etc) : "
echo ========================================

:: === FORMAT DU NOM DE L'ARCHIVE ===
set "archive_name=%game_name% %version% -%repacker% by %signature%"

:: === PRÉPARATION DU COMMENTAIRE TEXTE ===
if exist "%template%" (
    (for /f "delims=" %%l in (%template%) do (
        set "line=%%l"
        setlocal enabledelayedexpansion
        echo(!line:%%REPACKER%%=%repacker%!
        endlocal
    )) > "%commentaire%"
) else (
    echo ❌ Template de commentaire introuvable !
    pause
    exit /b
)

:: === DEMANDE DU FICHIER WINRAR ===
echo.
echo Glisse ici le fichier .rar à traiter puis appuie sur Entrée :
set /p "input_rar="

if not exist "%input_rar%" (
    echo ❌ Le fichier spécifié n'existe pas !
    pause
    exit /b
)

:: === EXTRACTION ===
if exist "%temp_folder%" rd /s /q "%temp_folder%"
mkdir "%temp_folder%"
"%winrar_path%" x -o+ "%input_rar%" "%temp_folder%\" >nul

:: === SUPPRESSION DES FICHIERS .url ===
del /s /q "%temp_folder%\*.url" >nul 2>&1

:: === CRÉATION DU DOSSIER DESTINATION SI INEXISTANT ===
if not exist "%destination%" mkdir "%destination%"

:: === AJOUT DU FICHIER LOGO À L'ARCHIVE ===
if exist "%logo%" copy /Y "%logo%" "%temp_folder%\logo.png" >nul

:: === CRÉATION DE LA NOUVELLE ARCHIVE ===
"%winrar_path%" a -r -ep1 -m3 -c- -z"%commentaire%" "%destination%\%archive_name%.rar" "%temp_folder%\*" >nul

:: === NETTOYAGE TEMP FOLDER + COMMENTAIRE ===
rd /s /q "%temp_folder%"
del "%commentaire%"

echo ========================================
echo [OK] Archive propre créée : "%destination%\%archive_name%.rar"
echo ========================================

:: === UPLOAD SUR PIXELDRAIN AVEC API KEY CORRECTE ===
echo Upload de l'archive sur PixelDrain...
curl -s -u :%pixeldrain_api_key% -F "file=@%destination%\%archive_name%.rar" "%pixeldrain_api_url%" > response.json

:: === EXTRACTION DE L'ID DU FICHIER AVEC POWERSHELL ===
set "file_id="
for /f %%i in ('powershell -Command "(Get-Content response.json | ConvertFrom-Json).id"') do set "file_id=%%i"

if not defined file_id (
    echo ❌ Échec de l'upload sur PixelDrain. Vérifiez la réponse de l'API :
    type response.json
    pause
    exit /b
)

:: === GÉNÉRATION DU LIEN PUBLIC ===
set "public_link=https://pixeldrain.com/u/%file_id%"
echo ========================================
echo [OK] Upload réussi
echo Lien public : %public_link%
echo ========================================

:: === COPIE DU LIEN DANS LE PRESSE-PAPIER ===
echo %public_link% | clip

:: === NETTOYAGE FICHIER TEMP JSON ===
del response.json

echo 📋 Le lien a été copié dans ton presse-papier.
pause
exit /b
