# MACHINE ONLY: stdout MUST be captured in memory, never forwarded to a console or log.
$ErrorActionPreference='Stop'
try {
 $file=Join-Path $env:LOCALAPPDATA 'PaxSolutio/private-api-20261105/session.dpapi'
 $sid=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value
 foreach($item in @([IO.Path]::GetDirectoryName($file),$file)){
  $acl=Get-Acl -LiteralPath $item
  if($item -ne $file -and -not $acl.AreAccessRulesProtected){throw 'ACL_REQUIRED'}
  foreach($rule in $acl.GetAccessRules($true,$true,[Security.Principal.SecurityIdentifier])){if($rule.AccessControlType -eq 'Allow' -and $rule.IdentityReference.Value -notin @($sid,'S-1-5-18')){throw 'ACL_REQUIRED'}}
 }
 $entropy=[Text.Encoding]::UTF8.GetBytes('PaxSolutio/nymrbqulweokwlaucrkv/api-backup-session/20261105')
 $plain=[Security.Cryptography.ProtectedData]::Unprotect([IO.File]::ReadAllBytes($file),$entropy,[Security.Cryptography.DataProtectionScope]::CurrentUser)
 try{[Console]::OpenStandardOutput().Write($plain,0,$plain.Length)}finally{[Array]::Clear($plain,0,$plain.Length)}
}catch{[Console]::Error.Write('PRIVATE_API_UNAVAILABLE');exit 1}
