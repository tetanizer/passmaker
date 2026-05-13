param(
    [string] $Tag = "local",
    [string] $Image = $(if ($env:IMAGE) { $env:IMAGE } else { "passmaker" })
)
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
docker build -t "${Image}:${Tag}" .
Write-Host "OK: ${Image}:${Tag}"
