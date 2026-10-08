@echo off
title GMSA HTU Portal Local Server
echo Starting GMSA HTU Web Portal...
echo Open your browser at http://localhost:3000
start http://localhost:3000/app/page.html
node server.js
pause
