#!/usr/bin/env bash

set -euo pipefail

ts=$(date +"%Y%m%d-%H%M%S")
mkdir -p backups
tar -czf "backups/src-backup-$ts.tgz" src scripts || true

echo "Este repo ya está alineado al SSOT. Este script no sobrescribe archivos core."
exit 0
