# Interactive human-only handoff. Never run with a transcript or redirected output.
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
$Host.UI.RawUI.WindowTitle='PaxSolutio - Publication suivi : sauvegarde privee'
$taskRoot=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../..')).Path
$taskPrivate=Join-Path $env:LOCALAPPDATA 'PaxSolutio/private-api-20261105'
$taskBackups=Join-Path $env:LOCALAPPDATA 'PaxSolutio/private-backups'
$taskFile=Join-Path $taskPrivate 'session.dpapi'
$taskState=Join-Path $taskRoot 'docs/suivi-production-20261105/preuves/private-api-input.json'
$taskSecrets=@{}
$taskStage='initialization'
function Plain([Security.SecureString]$value){$p=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($value);try{return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($p)}finally{[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($p)}}
function PrivateFolder([string]$folder){
 $absolute=[IO.Path]::GetFullPath($folder)
 $base=[IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'PaxSolutio'))+[IO.Path]::DirectorySeparatorChar
 if(-not $absolute.StartsWith($base,[StringComparison]::OrdinalIgnoreCase)){throw 'PRIVATE_PATH_REFUSED'}
 New-Item -ItemType Directory -Path $absolute -Force | Out-Null
 $identity=[Security.Principal.WindowsIdentity]::GetCurrent().User
 # Modify only the DACL. A fresh descriptor passed to Set-Acl can request
 # owner/audit privileges that an ordinary user does not hold.
 $directory=[IO.DirectoryInfo]::new($absolute)
 $acl=[IO.FileSystemAclExtensions]::GetAccessControl($directory,[Security.AccessControl.AccessControlSections]::Access)
 $acl.SetAccessRuleProtection($true,$false)
 foreach($rule in @($acl.GetAccessRules($true,$false,[Security.Principal.SecurityIdentifier]))){$acl.RemoveAccessRuleSpecific($rule)}
 foreach($sid in @($identity,[Security.Principal.SecurityIdentifier]::new('S-1-5-18'))){$acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($sid,'FullControl','ContainerInherit,ObjectInherit','None','Allow'))}
 [IO.FileSystemAclExtensions]::SetAccessControl($directory,$acl)
}
try {
 if(Test-Path -LiteralPath $taskFile){throw 'PRIVATE_SESSION_ALREADY_EXISTS'}
 Write-Host 'Cible EXCLUSIVE : PaxSolutio / nymrbqulweokwlaucrkv'
 Write-Host 'Utilisez un jeton existant limite a ce projet, ou creez-en un dans :'
 Write-Host 'https://supabase.com/dashboard/account/tokens'
 Write-Host 'Nom conseille : PaxSolutio-backup-20261105 ; expiration la plus courte compatible avec la recette.'
 Write-Host 'Portee : projet PaxSolutio uniquement. Permissions seulement :'
 Write-Host ' - Project Settings : Read'
 Write-Host ' - Connection Pooling : Read'
 Write-Host ' - Database : Read-write (necessaire au role SQL temporaire demande en lecture seule)'
 Write-Host 'Ne choisissez pas Full access / Legacy. Ne modifiez aucun mot de passe.'
 Write-Host 'Si les choix ne correspondent pas, fermez cette fenetre sans saisir de secret.'
 Write-Host 'Les secrets seront temporairement proteges par DPAPI CurrentUser, hors depot et OneDrive.'
 $taskStage='scope-confirmation'
 $taskConfirmed=Read-Host 'Confirmez ces limites exactes dans Supabase (tapez OUI)'
 if($taskConfirmed -cne 'OUI'){throw 'TOKEN_SCOPE_NOT_CONFIRMED'}
 $taskExpiry=Read-Host 'Date/heure expiration affichee par Supabase (information non secrete)'
 if([string]::IsNullOrWhiteSpace($taskExpiry)){throw 'TOKEN_EXPIRY_REQUIRED'}
 $taskStage='token-input'
 $taskSecrets.token=Read-Host 'Jeton API limite (masque, jamais dans le chat)' -AsSecureString
 $taskToken=(Plain $taskSecrets.token).Trim()
 if($taskToken -notmatch '^sbp_fc[A-Za-z0-9._-]+$' -or $taskToken.Length -lt 20){throw 'SCOPED_TOKEN_REQUIRED'}
 Write-Host 'Recuperez la cle de sauvegarde 256 bits deja conservee dans votre coffre prive.'
 $taskStage='key-recovery'
 $taskSecrets.key=Read-Host 'Cle de sauvegarde (64 caracteres hexadecimaux, masque)' -AsSecureString
 $taskKey=(Plain $taskSecrets.key).Trim().ToLowerInvariant()
 if($taskKey -notmatch '^[a-f0-9]{64}$'){throw 'RECOVERY_KEY_FORMAT_REFUSED'}
 $taskSecrets.confirm=Read-Host 'Relisez le coffre puis saisissez a nouveau la cle (masque)' -AsSecureString
 $taskConfirmation=(Plain $taskSecrets.confirm).Trim().ToLowerInvariant()
 if($taskKey -cne $taskConfirmation){throw 'KEY_RECOVERY_MISMATCH'}
 $taskStage='private-directory'
 PrivateFolder $taskPrivate
 $taskStage='backup-directory'
 PrivateFolder $taskBackups
 $taskStage='protected-handoff'
 $taskPayload=@{projectRef='nymrbqulweokwlaucrkv';token=$taskToken;tokenScopeConfirmed=$true;tokenExpiryStatement=$taskExpiry;permissions=@('project_admin_read','database_pooling_config_read','database_write');keyHex=$taskKey;keyRecoveredAt=[DateTime]::UtcNow.ToString('o');backupDirectory=$taskBackups}|ConvertTo-Json -Compress
 $taskBytes=[Text.Encoding]::UTF8.GetBytes($taskPayload)
 $taskEntropy=[Text.Encoding]::UTF8.GetBytes('PaxSolutio/nymrbqulweokwlaucrkv/api-backup-session/20261105')
 $taskCipher=[Security.Cryptography.ProtectedData]::Protect($taskBytes,$taskEntropy,[Security.Cryptography.DataProtectionScope]::CurrentUser)
 $taskStream=[IO.File]::Open($taskFile,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
 try{$taskStream.Write($taskCipher,0,$taskCipher.Length)}finally{$taskStream.Dispose()}
 [Array]::Clear($taskBytes,0,$taskBytes.Length)
 @{at=[DateTime]::UtcNow.ToString('o');status='ready';target='nymrbqulweokwlaucrkv';scopeConfirmedByUser=$true;keyRecovery='Recovered twice from existing private vault; historical encrypted archives will verify this recovered key';privateAcl=$true;relay='DPAPI CurrentUser';remoteWriteExecuted=$false}|ConvertTo-Json|Set-Content -LiteralPath $taskState -Encoding utf8
 Write-Host 'Saisie terminee. Aucun role SQL ni migration cree par cette fenetre.'
}catch{
 $taskReason=if($_.Exception.Message -cmatch '^(PRIVATE_SESSION_ALREADY_EXISTS|PRIVATE_PATH_REFUSED|TOKEN_SCOPE_NOT_CONFIRMED|TOKEN_EXPIRY_REQUIRED|SCOPED_TOKEN_REQUIRED|RECOVERY_KEY_FORMAT_REFUSED|KEY_RECOVERY_MISMATCH)$'){$_.Exception.Message}else{'PRIVATE_INPUT_ERROR'}
 @{at=[DateTime]::UtcNow.ToString('o');status='input-not-ready';stage=$taskStage;reason=$taskReason;errorType=$_.Exception.GetType().FullName;target='nymrbqulweokwlaucrkv';remoteWriteExecuted=$false}|ConvertTo-Json|Set-Content -LiteralPath $taskState -Encoding utf8
 Write-Host 'Saisie interrompue. Aucun secret journalise, aucune modification distante.'
}finally{
 foreach($s in $taskSecrets.Values){$s.Dispose()}
 $taskToken=$null;$taskKey=$null;$taskConfirmation=$null;$taskPayload=$null;$taskBytes=$null;$taskCipher=$null
}
[void](Read-Host 'Entree pour fermer cette fenetre privee')
