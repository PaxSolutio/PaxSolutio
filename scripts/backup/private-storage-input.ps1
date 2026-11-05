$ErrorActionPreference='Stop'
$Host.UI.RawUI.WindowTitle='PaxSolutio - Sauvegarde photos : cle serveur existante'
$taskFile=Join-Path $env:LOCALAPPDATA 'PaxSolutio/private-api-20261105/session.dpapi'
$entropy=[Text.Encoding]::UTF8.GetBytes('PaxSolutio/nymrbqulweokwlaucrkv/api-backup-session/20261105')
try {
 $plain=[Security.Cryptography.ProtectedData]::Unprotect([IO.File]::ReadAllBytes($taskFile),$entropy,[Security.Cryptography.DataProtectionScope]::CurrentUser)
 $payload=[Text.Encoding]::UTF8.GetString($plain)|ConvertFrom-Json -AsHashtable
 [Array]::Clear($plain,0,$plain.Length)
 if($payload.projectRef -ne 'nymrbqulweokwlaucrkv'){throw 'TARGET_REFUSED'}
 Write-Host 'Reutilisez seulement la cle serveur existante du projet PaxSolutio nymrbqulweokwlaucrkv.'
 Write-Host 'Ne creez ni ne remplacez de cle. N utilisez aucune cle PSBC.'
 $secure=Read-Host 'Cle service_role ou sb_secret existante (masquee)' -AsSecureString
 $pointer=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
 try{$value=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer).Trim()}finally{[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer);$secure.Dispose()}
 if($value.Length -lt 30 -or $value -notmatch '^(eyJ|sb_secret_)'){throw 'KEY_FORMAT_REFUSED'}
 $payload.storageKey=$value
 $bytes=[Text.Encoding]::UTF8.GetBytes(($payload|ConvertTo-Json -Compress))
 $cipher=[Security.Cryptography.ProtectedData]::Protect($bytes,$entropy,[Security.Cryptography.DataProtectionScope]::CurrentUser)
 [IO.File]::WriteAllBytes($taskFile,$cipher)
 [Array]::Clear($bytes,0,$bytes.Length)
 Write-Host 'Complement enregistre dans le relais prive temporaire. Aucune modification distante.'
}catch{Write-Host 'Saisie interrompue. Aucun secret affiche.';exit 1}
finally{$value=$null;$payload=$null;$bytes=$null;$plain=$null}
[void](Read-Host 'Entree pour fermer')
