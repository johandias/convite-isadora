@echo off
title Convite Isadora - Servidor Local
echo ========================================================
echo   Iniciando Convite Real da Isadora (1o Aninho)
echo ========================================================
echo.
echo Abrindo o navegador em http://localhost:8000 ...
start http://localhost:8000
python -m http.server 8000
pause
