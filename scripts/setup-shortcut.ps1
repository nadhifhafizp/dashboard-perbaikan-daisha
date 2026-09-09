$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Join-Path $PSScriptRoot ".."
$projectRoot = [System.IO.Path]::GetFullPath($projectRoot)

$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "DAISHA Management System.lnk"

# 1. Buat Icon (.ico) dari logo-bs.png
$pngPath = Join-Path $projectRoot "public\logo-bs.png"
$icoPath = Join-Path $projectRoot "public\daisha-icon.ico"

if (Test-Path $pngPath) {
    Write-Host "Mengonversi logo menjadi format icon..."
    $img = [System.Drawing.Image]::FromFile($pngPath)
    $bmp = New-Object System.Drawing.Bitmap($img, 256, 256)
    
    # Save as memory stream
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $ms.Position = 0
    
    # Create simple ICO header for PNG data (Vista+ ICO format)
    $fs = New-Object System.IO.FileStream($icoPath, [System.IO.FileMode]::Create)
    $bw = New-Object System.IO.BinaryWriter($fs)
    
    $bw.Write([int16]0) # Reserved
    $bw.Write([int16]1) # Type (1=Icon)
    $bw.Write([int16]1) # Count
    $bw.Write([byte]0)  # Width (0=256)
    $bw.Write([byte]0)  # Height (0=256)
    $bw.Write([byte]0)  # Colors
    $bw.Write([byte]0)  # Reserved
    $bw.Write([int16]1) # Color Planes
    $bw.Write([int16]32)# Bits per pixel
    $bw.Write([int]$ms.Length) # Size of image data
    $bw.Write([int]22)  # Offset to image data
    
    $ms.WriteTo($fs)
    
    $bw.Close()
    $fs.Close()
    $ms.Close()
    $bmp.Dispose()
    $img.Dispose()
    Write-Host "Icon berhasil dibuat: daisha-icon.ico"
} else {
    Write-Warning "File logo-bs.png tidak ditemukan. Shortcut akan menggunakan icon default."
}

# 2. Buat Desktop Shortcut
Write-Host "Membuat Shortcut Desktop..."
$wshShell = New-Object -ComObject WScript.Shell
$shortcut = $wshShell.CreateShortcut($shortcutPath)

$shortcut.TargetPath = Join-Path $projectRoot "Jalankan-DAISHA.vbs"
$shortcut.WorkingDirectory = $projectRoot
$shortcut.Description = "Sistem Manajemen Perbaikan - PT Bridgestone Tire Indonesia"

if (Test-Path $icoPath) {
    $shortcut.IconLocation = "$icoPath, 0"
} else {
    # Fallback to shell32 or edge
    $shortcut.IconLocation = "shell32.dll, 13"
}

$shortcut.Save()

Write-Host ""
Write-Host "=========================================================="
Write-Host " SUKSES! " -ForegroundColor Green
Write-Host " Shortcut 'DAISHA Management System' berhasil dibuat di Desktop."
Write-Host " Anda sekarang bisa menjalankan aplikasi langsung dari Desktop."
Write-Host "=========================================================="
