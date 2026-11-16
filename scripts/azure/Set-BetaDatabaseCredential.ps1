param([string]$UserName = 'juntai_admin')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$credentialDirectory = Join-Path $projectRoot 'tmp/azure-auth'
New-Item -ItemType Directory -Force -Path $credentialDirectory | Out-Null
$password = Read-Host 'Senha do administrador do PostgreSQL Azure (entrada oculta)' -AsSecureString
if ($password.Length -eq 0) { throw 'A senha não pode estar vazia.' }
$credential = New-Object System.Management.Automation.PSCredential($UserName, $password)
$credential | Export-Clixml -LiteralPath (Join-Path $credentialDirectory 'postgres.credential.xml')
Write-Host 'Credencial protegida pelo Windows salva localmente. Avise na conversa que concluiu.'
