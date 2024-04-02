@echo off

title Lapis Automod

if not exist "./authCache/" cmd /c md authCache
if not exist package-lock.json echo Installing necessary files... && cmd /c npm i

node .
