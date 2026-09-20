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
Write-Host "Ficheros copiados en $hooks"

# Update: si settings.json ya lanza este statusline no hay nada que pegar. Solo se lee, nunca se escribe.
$current = $null
try { $current = (Get-Content $settings -Raw -ErrorAction Stop | ConvertFrom-Json).statusLine.command } catch { }
if ($current -and $current.IndexOf($cmd, [StringComparison]::OrdinalIgnoreCase) -ge 0) {
    Write-Host "Actualizado: $settings ya apunta a $cmd"
    return
}

# .Replace es literal; -replace interpreta el patrón como regex y una '\' suelta no es válida.
$json = $cmd.Replace('\', '\\')
Write-Host "Pon esto en $settings :"
Write-Host @"
  "statusLine": {
    "type": "command",
    "command": "\"$json\"",
    "padding": 0,
    "refreshInterval": 10
  }
"@
