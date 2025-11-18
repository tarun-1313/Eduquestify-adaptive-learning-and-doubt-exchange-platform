# Remove duplicate JavaScript files
$filesToRemove = @(
    "app\doubts\page.jsx",
    "app\login\page.jsx",
    "app\api\doubts\route.js",
    "app\api\doubts\[id]\messages\route.js"
)

foreach ($file in $filesToRemove) {
    $fullPath = Join-Path -Path $PSScriptRoot -ChildPath $file
    if (Test-Path $fullPath) {
        Write-Host "Removing $file..."
        Remove-Item -Path $fullPath -Force
    } else {
        Write-Host "File not found: $file"
    }
}

Write-Host "Cleanup complete!"
