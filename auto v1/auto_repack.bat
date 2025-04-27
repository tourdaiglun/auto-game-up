@echo off
setlocal enabledelayedexpansion

:: === CONFIGURATION ===
set "winrar_path=C:\Program Files\WinRAR\WinRAR.exe"
set "destination=Archives"
set "signature={cFinder}"
set "template=commentaire_template.txt"
set "commentaire=commentaire.txt"
set "logo=logo.png"
set "temp_folder=extracted"

:: === INPUT UTILISATEUR ===.
set /p "game_name=🕹️ Nom du jeu : "
set /p "version=📦 Version du jeu : "
set /p "repacker=👤 Nom du repacker (ex: FitGirl, DODI, etc) : "

:: === FORMAT DU NOM DE L'ARCHIVE ===
set "archive_name=%game_name% %version% -%repacker% by %signature%"

:: === PRÉPARATION DU COMMENTAIRE TEXTE ===
(for /f "delims=" %%l in (%template%) do (
    set "line=%%l"
    setlocal enabledelayedexpansion
    echo(!line:%%REPACKER%%=%repacker%!
    endlocal
)) > %commentaire%

:: === DEMANDE DU FICHIER WINRAR ===
echo 🔃 Glisse ici le fichier .rar à traiter, puis appuie sur Entrée :
set /p "input_rar="

:: === EXTRACTION ===
if exist "%temp_folder%" rd /s /q "%temp_folder%"
mkdir "%temp_folder%"
"%winrar_path%" x -o+ "%input_rar%" "%temp_folder%\"

:: === SUPPRESSION DES FICHIERS .url ===
del /s /q "%temp_folder%\*.url"

:: === CRÉATION DU DOSSIER DESTINATION SI INEXISTANT ===
if not exist "%destination%" mkdir "%destination%"

:: === AJOUT DU FICHIER LOGO À L'ARCHIVE ===
copy /Y "%logo%" "%temp_folder%\logo.png" >nul

:: === CRÉATION DE LA NOUVELLE ARCHIVE ===
"%winrar_path%" a -r -ep1 -m3 -c- -z"%commentaire%" "%destination%\%archive_name%.rar" "%temp_folder%\*"

:: === NETTOYAGE FINAL ===
rd /s /q "%temp_folder%"
del "%commentaire%"

echo ✅ Archive propre créée : %destination%\%archive_name%.rar

:: === CONFIGURATION PIXELDRAIN ===
set "pixeldrain_api_url=https://pixeldrain.com/api/file"
set "pixeldrain_api_key=YOUR_API_KEY"  :: Remplacez par votre clé API PixelDrain

:: === UPLOAD SUR PIXELDRAIN ===
echo 🔄 Upload de l'archive sur PixelDrain...
for /f "tokens=2 delims=: " %%a in ('curl -F "file=@%destination%\%archive_name%.rar" -F "key=%pixeldrain_api_key%" %pixeldrain_api_url% ^| findstr /i "id"') do set "file_id=%%a"

if not defined file_id (
    echo ❌ Échec de l'upload sur PixelDrain.
    pause
    exit /b
)

set "public_link=https://pixeldrain.com/u/%file_id%"
echo ✅ Upload réussi ! Lien public : %public_link%

:: === COPIE DU LIEN DANS LE PRESSE-PAPIER ===
echo %public_link% | clip
echo 📋 Le lien a été copié dans le presse-papier.

:: === OUVERTURE DU LIEN DANS LE NAVIGATEUR ===
start "" "%public_link%"
pause
