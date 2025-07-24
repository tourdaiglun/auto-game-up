@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "winrar_path=C:\Program Files\WinRAR\WinRAR.exe"
set "destination=Archives"
set "signature={cFinder}"
set "template=commentaire_template.txt"
set "commentaire=commentaire.txt"
set "logo=logo.png"
set "temp_folder=extracted"
set "pixeldrain_api_url=https://pixeldrain.com/api/file"
set "pixeldrain_api_key=VOTRE_CLE_PIXELDRAIN_ICI"

:loop
:: Vérifie s’il y a des jobs
for %%f in (queue\*.job) do (
    set "job_file=%%f"
    call :process_job "!job_file!"
    timeout /t 10 /nobreak >nul
)
timeout /t 3 >nul
goto loop

:process_job
setlocal
set "file=%~1"
echo Traitement du fichier : %file%

:: Lecture du fichier .job
for /f "delims=" %%l in (%file%) do (
    set "line=%%l"
    for /f "tokens=1,* delims==" %%a in ("!line!") do set "%%a=%%b"
)

set "archive_name=%game_name% %version% -%repacker% by %signature%"

if exist "%template%" (
    (for /f "delims=" %%l in (%template%) do (
        set "line=%%l"
        setlocal enabledelayedexpansion
        echo(!line:%%REPACKER%%=%repacker%!
        endlocal
    )) > "%commentaire%"
)

if exist "%temp_folder%" rd /s /q "%temp_folder%"
mkdir "%temp_folder%"
"%winrar_path%" x -o+ "%input_rar%" "%temp_folder%\" >nul
del /s /q "%temp_folder%\*.url" >nul 2>&1
if not exist "%destination%" mkdir "%destination%"
if exist "%logo%" copy /Y "%logo%" "%temp_folder%\logo.png" >nul

"%winrar_path%" a -r -ep1 -m3 -c- -z"%commentaire%" "%destination%\%archive_name%.rar" "%temp_folder%\*" >nul
rd /s /q "%temp_folder%"
del "%commentaire%"

curl -s -u :%pixeldrain_api_key% -F "file=@%destination%\%archive_name%.rar" "%pixeldrain_api_url%" > response.json
set "file_id="
for /f %%i in ('powershell -Command "(Get-Content response.json | ConvertFrom-Json).id"') do set "file_id=%%i"

if not defined file_id (
    echo ❌ Upload échoué. Vérifie la réponse :
    type response.json
    pause
    exit /b
)

set "public_link=https://pixeldrain.com/u/%file_id%"
echo %public_link% | clip
echo ✅ Upload OK. Lien copié : %public_link%

del response.json
del "%file%"

endlocal
goto :eof
