#!/usr/bin/env bash
# Сборка и отправка образа в GitHub Container Registry.
# Перед запуском: docker login ghcr.io -u USERNAME -p GITHUB_TOKEN
# Токен: GitHub → Settings → Developer settings → PAT с правом write:packages
# либо для своего аккаунта достаточно GITHUB_TOKEN в Actions (см. workflow).
#
# Пример:
#   export IMAGE=ghcr.io/tetanizer/passmaker
#   ./scripts/ghcr-publish.sh
#   ./scripts/ghcr-publish.sh v1.0.0
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
: "${IMAGE:?Укажите IMAGE=ghcr.io/владелец/репозиторий (строчными буквами)}"
TAG="${1:-latest}"
docker build -t "${IMAGE}:${TAG}" .
docker push "${IMAGE}:${TAG}"
echo "Pushed ${IMAGE}:${TAG}"
