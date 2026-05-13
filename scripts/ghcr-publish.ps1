# Сборка и push в ghcr.io. Сначала: docker login ghcr.io -u USER -p TOKEN
# Пример:
#   $env:IMAGE = "ghcr.io/tetanizer/passmaker"
#   .\scripts\ghcr-publish.ps1
#   .\scripts\ghcr-publish.ps1 -Tag "v1.0.0"
param(
    [string] $Tag = "latest"
)
$ErrorActionPreference = "Stop"
if (-not $env:IMAGE) {
    Write-Error "Задайте переменную окружения IMAGE, например: ghcr.io/tetanizer/passmaker"
}
Set-Location (Join-Path $PSScriptRoot "..")
docker build -t "$($env:IMAGE):$Tag" .
docker push "$($env:IMAGE):$Tag"
Write-Host "Pushed $($env:IMAGE):$Tag"
