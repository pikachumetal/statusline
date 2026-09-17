# Instala el statusline en un directorio de configuración de Claude Code.
# Uso: .\install.ps1 [-ConfigDir "$HOME\.claude-gco"]
param([string]$ConfigDir = (Join-Path $HOME '.claude'))

$hooks = Join-Path $ConfigDir 'hooks'
New-Item -ItemType Directory -Force $hooks | Out-Null
foreach ($f in 'statusline.js', 'statusline.cmd', 'statusline.test.js') {
    Copy-Item (Join-Path $PSScriptRoot $f) $hooks -Force
}
$cmd = Join-Path $hooks 'statusline.cmd'
$settings = Join-Path $ConfigDir 'settings.json'
$json = ($cmd -replace '\', '\\')
Write-Host "Ficheros copiados en $hooks"
Write-Host "Pon esto en $settings :"
Write-Host @"
  "statusLine": {
    "type": "command",
    "command": "\"$json\"",
    "padding": 0,
    "refreshInterval": 10
  }
"@
