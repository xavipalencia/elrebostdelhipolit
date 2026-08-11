$ConfigFile = Join-Path $PSScriptRoot 'deploy-config.json'
if (-not (Test-Path $ConfigFile)) {
    Write-Error "Missing deploy-config.json. Copy deploy-config.example.json to deploy-config.json and edit it."
    exit 1
}

$config = Get-Content $ConfigFile | ConvertFrom-Json
$sshHost = $config.ssh_host
$sshPort = $config.ssh_port
$sshUser = $config.ssh_user
$targetDir = $config.target_dir

if (-not $sshHost -or -not $sshPort -or -not $sshUser -or -not $targetDir) {
    Write-Error 'deploy-config.json must contain ssh_host, ssh_port, ssh_user and target_dir.'
    exit 1
}

$sourcePath = Join-Path $PSScriptRoot 'wa-shopping-bot'
if (-not (Test-Path $sourcePath)) {
    Write-Error "Source folder '$sourcePath' not found."
    exit 1
}

$scp = Get-Command scp -ErrorAction SilentlyContinue
if (-not $scp) {
    Write-Error 'scp is not installed or not available in PATH. Install OpenSSH client or use Git Bash with scp.'
    exit 1
}

Write-Host "Deploying wa-shopping-bot to $sshUser@$sshHost:$targetDir..."
& scp -P $sshPort -r "$sourcePath\*" "$sshUser@$sshHost:$targetDir"
Write-Host 'Deployment complete.'
