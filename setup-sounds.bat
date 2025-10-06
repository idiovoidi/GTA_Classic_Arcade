@echo off
echo ========================================
echo Sound Folder Setup Script
echo ========================================
echo.

echo Creating sound directories...
mkdir sounds 2>nul
mkdir sounds\weapons 2>nul
mkdir sounds\effects 2>nul
mkdir sounds\vehicles 2>nul
mkdir sounds\ui 2>nul
mkdir sounds\police 2>nul
mkdir sounds\ambient 2>nul
mkdir sounds\music 2>nul

echo.
echo ✓ Directories created!
echo.
echo Directory structure:
echo sounds\
echo   ├── weapons\
echo   ├── effects\
echo   ├── vehicles\
echo   ├── ui\
echo   ├── police\
echo   ├── ambient\
echo   └── music\
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Download sounds from:
echo    https://opengameart.org/content/512-sound-effects-8-bit-style
echo.
echo 2. Extract and copy sound files to the folders above
echo.
echo 3. Copy a config file:
echo    copy js\sound-config-jsfxr.js js\sound-config.js
echo    OR
echo    copy js\sound-config-512pack.js js\sound-config.js
echo.
echo 4. Edit js\sound-config.js to match your file names
echo.
echo 5. Test with test-audio.html
echo.
echo 6. Play the game!
echo.
echo ========================================
echo For detailed instructions, see:
echo download-sounds.md
echo ========================================
echo.
pause
