@echo off
chcp 65001 >nul

:: === CONFIGURATION ===
setlocal enabledelayedexpansion
set "queue_dir=queue"

:: === INPUT UTILISATEUR ===
echo ========================================
set /p "game_name=Nom du jeu : "
set /p "version=Version du jeu : "
set /p "repacker=Nom du repacker (ex: FitGirl, DODI, etc) : "
echo ========================================

:: === DEMANDE DU FICHIER WINRAR ===
echo.
echo Glisse ici le fichier .rar à traiter puis appuie sur Entrée :
set /p "input_rar="

if not exist "%input_rar%" (
    echo ❌ Le fichier spécifié n'existe pas !
    pause
    exit /b
)

:: === ENREGISTREMENT DES DONNÉES DANS UNE FILE (.job) ===
set "job_id=%RANDOM%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
set "job_file=%queue_dir%\%job_id%.job"

if not exist "%queue_dir%" mkdir "%queue_dir%"

(
    echo game_name=%game_name%
    echo version=%version%
    echo repacker=%repacker%
    echo input_rar=%input_rar%
) > "%job_file%"

echo ✅ Tâche ajoutée à la file d’attente.
pause
exit /b
