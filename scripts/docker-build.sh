#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
IMAGE="${IMAGE:-passmaker}"
TAG="${1:-local}"
docker build -t "${IMAGE}:${TAG}" .
echo "OK: ${IMAGE}:${TAG}"
