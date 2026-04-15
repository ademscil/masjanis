@echo off
setlocal
set USER_DIR=C:\Users\adam.cid00676
set BACKUP_DIR=D:\temp\backup
set TARGET_DIR=D:\temp

echo ============================================
echo  Cache Migration Script - MasJanis Dev
echo ============================================
echo.

:: Buat folder backup dan target
mkdir "%BACKUP_DIR%" 2>nul
mkdir "%TARGET_DIR%" 2>nul

echo [1/5] Backup semua folder ke %BACKUP_DIR%...
echo.

for %%F in (.vscode .kiro .gradle .m2 .android .codex .cache .codeium) do (
    if exist "%USER_DIR%\%%F" (
        echo   Backup %%F ...
        xcopy /E /I /H /Q "%USER_DIR%\%%F" "%BACKUP_DIR%\%%F" >nul
        echo   OK: %%F
    ) else (
        echo   SKIP: %%F tidak ditemukan
    )
)

echo.
echo [2/5] Backup selesai di %BACKUP_DIR%
echo.
pause
echo.

echo [3/5] Pindah folder ke %TARGET_DIR% dan buat symlink...
echo.

for %%F in (.vscode .kiro .gradle .m2 .codeium) do (
    if exist "%USER_DIR%\%%F" (
        echo   Memindah %%F ...
        xcopy /E /I /H /Q "%USER_DIR%\%%F" "%TARGET_DIR%\%%F" >nul
        rmdir /s /q "%USER_DIR%\%%F"
        mklink /D "%USER_DIR%\%%F" "%TARGET_DIR%\%%F"
        echo   OK: %%F dipindah + symlink dibuat
    )
)

echo.
echo [4/5] Hapus cache yang bisa di-regenerate (.codex .cache)...
echo.
if exist "%USER_DIR%\.codex"  ( rmdir /s /q "%USER_DIR%\.codex"  && echo   OK: .codex dihapus )
if exist "%USER_DIR%\.cache"  ( rmdir /s /q "%USER_DIR%\.cache"  && echo   OK: .cache dihapus )

echo.
echo [5/5] Pindah .android + set environment variable...
echo.
if exist "%USER_DIR%\.android" (
    xcopy /E /I /H /Q "%USER_DIR%\.android" "%TARGET_DIR%\.android" >nul
    rmdir /s /q "%USER_DIR%\.android"
    mklink /D "%USER_DIR%\.android" "%TARGET_DIR%\.android"
    setx ANDROID_SDK_ROOT "%TARGET_DIR%\android"
    echo   OK: .android dipindah + symlink dibuat
)

echo.
echo ============================================
echo  SELESAI! Semua folder berhasil dipindah.
echo  Backup tersimpan di: %BACKUP_DIR%
echo  Data baru di: %TARGET_DIR%
echo ============================================
echo.
echo Silakan buka kembali VS Code, Kiro, dll.
pause
