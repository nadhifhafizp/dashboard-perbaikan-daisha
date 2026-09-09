Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path $PSScriptRoot "..\public\logo-bs.png"
$src = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath))

function Resize-Png($img, [int]$w, [int]$h, [string]$dest) {
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($img, 0, 0, $w, $h)
    $destPath = Join-Path $PSScriptRoot "..\public\$dest"
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created $dest"
}

Resize-Png $src 192 192 "icon-192.png"
Resize-Png $src 512 512 "icon-512.png"
Resize-Png $src 180 180 "apple-touch-icon.png"

$src.Dispose()
Write-Host "All icons generated successfully!"
