# Instala el statusline en un directorio de configuración de Claude Code, y el mod de controles con el CLI claude.
# Uso: .\install.ps1 [-ConfigDir "$HOME\.claude-gco"]
# -OrcaHook y -Claude existen para los tests: fijan si se ve Orca y qué CLI se usa sin depender de la máquina.
param(
    [string]$ConfigDir = (Join-Path $HOME '.claude'),
    [string]$OrcaHook = (Join-Path $HOME '.orca\agent-hooks\claude-statusline.cmd'),
    [string]$Claude = (Get-Command claude -ErrorAction Ignore).Source
)

$hooks = Join-Path $ConfigDir 'hooks'
New-Item -ItemType Directory -Force $hooks | Out-Null
foreach ($f in 'statusline.js', 'statusline.cmd', 'statusline-orca.cmd', 'statusline.test.js') {
    $src = Join-Path $PSScriptRoot $f
    $dst = Join-Path $hooks $f
    # Idéntico no se copia: una sesión abierta tiene statusline.cmd abierto y sobrescribirlo fallaría sin nada que cambiar.
    if ((Test-Path $dst -PathType Leaf) -and (Get-FileHash $src).Hash -eq (Get-FileHash $dst).Hash) { continue }
    # Stop: un fichero bloqueado corta el script; sin él, se daría por bueno un update a medias.
    Copy-Item $src $hooks -Force -ErrorAction Stop
}
# Con Orca instalado, el wrapper pinta el statusline y además le reenvía el JSON (rate_limits).
$cmd = Join-Path $hooks $(if (Test-Path $OrcaHook) { 'statusline-orca.cmd' } else { 'statusline.cmd' })
$settings = Join-Path $ConfigDir 'settings.json'
Write-Host "Ficheros copiados en $hooks"

# Update: si settings.json ya lanza este statusline no hay nada que pegar. Solo se lee, nunca se escribe.
$current = $null
try { $current = (Get-Content $settings -Raw -ErrorAction Stop | ConvertFrom-Json).statusLine.command } catch { }
if ($current -and $current.IndexOf($cmd, [StringComparison]::OrdinalIgnoreCase) -ge 0) {
    Write-Host "Actualizado: $settings ya apunta a $cmd"
}
else {
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
}

# El mod se lee del clon: el repo es un marketplace de carpeta y el CLI lo registra en este perfil.
$steps = @(
    @('plugin', 'marketplace', 'add', $PSScriptRoot),
    @('plugin', 'install', 'statusline-controls@statusline')
)
# El perfil por defecto va sin la variable: con ella, el CLI crea un .claude.json propio dentro de ~/.claude.
$isDefault = [IO.Path]::GetFullPath($ConfigDir).TrimEnd('\').Equals([IO.Path]::GetFullPath((Join-Path $HOME '.claude')), [StringComparison]::OrdinalIgnoreCase)
if (-not $Claude -or -not (Test-Path $Claude)) {
    $how = if ($isDefault) { 'Instálalo a mano con:' } else { "Instálalo a mano con CLAUDE_CONFIG_DIR=$ConfigDir :" }
    Write-Warning "Sin CLI claude en el PATH: no se ha instalado el mod de controles. $how"
    foreach ($step in $steps) { Write-Warning "  claude $($step -join ' ')" }
    exit 0
}
$previous = $env:CLAUDE_CONFIG_DIR
$env:CLAUDE_CONFIG_DIR = if ($isDefault) { $null } else { $ConfigDir }
try {
    foreach ($step in $steps) {
        & $Claude @step
        if ($LASTEXITCODE -ne 0) {
            [Console]::Error.WriteLine("Falló: claude $($step -join ' ') (código $LASTEXITCODE)")
            exit 1
        }
    }
}
finally { $env:CLAUDE_CONFIG_DIR = $previous }
Write-Host "Mod de controles instalado en $ConfigDir"
