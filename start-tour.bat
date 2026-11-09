@echo off
chcp 65001 >nul
cd /d "%~dp0"
where python >nul 2>nul && (python serve.py & goto :eof)
where py >nul 2>nul && (py -3 serve.py & goto :eof)
echo Python not found. Install Python 3 and run this file again,
echo or open the tour from the editor's start-editor.bat.
pause
