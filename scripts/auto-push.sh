#!/bin/bash

PROJECT_DIR="/Users/gilbertopadilha/Documents/PROJETOS/PROJETOS/SITE CRM/nexusimoveis-crm-clone"
LOG_FILE="$PROJECT_DIR/scripts/auto-push.log"

cd "$PROJECT_DIR" || exit 1

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
    echo "[$TIMESTAMP] Nenhuma alteração para enviar." >> "$LOG_FILE"
    exit 0
fi

git add -A
git commit -m "auto: atualização automática - $TIMESTAMP"
git push origin master

if [ $? -eq 0 ]; then
    echo "[$TIMESTAMP] Push realizado com sucesso." >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] ERRO no push." >> "$LOG_FILE"
fi
