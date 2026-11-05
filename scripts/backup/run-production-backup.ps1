$ErrorActionPreference='Stop'
$taskRoot=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../..')).Path
Push-Location $taskRoot
try {
 $env:PAX_BACKUP_PROOF_DIR='docs/suivi-production-20261105/preuves/runs/'+[DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss').ToLowerInvariant()
 New-Item -ItemType Directory -Force $env:PAX_BACKUP_PROOF_DIR | Out-Null
 # The existing private handoff must be prepared interactively first.
 # This routine creates no fixture, changes no application configuration,
 # and never removes a historical archive.
 node scripts/tracking-production/backup-gate.mjs --routine
 if($LASTEXITCODE -ne 0){throw 'BACKUP_NOT_VERIFIED'}
}finally{Remove-Item Env:PAX_BACKUP_PROOF_DIR -ErrorAction SilentlyContinue;Pop-Location}
