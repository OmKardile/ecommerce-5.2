#!/bin/bash
# Dev server launcher — fully detached, survives parent shell exit.
# Reads secrets from .env (gitignored). Never hardcode credentials here.
cd /home/z/my-project
set -a
[ -f .env ] && . .env
set +a
exec ./node_modules/.bin/next dev -p 3000
