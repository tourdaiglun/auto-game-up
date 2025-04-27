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
pause
