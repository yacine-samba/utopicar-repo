#!/bin/bash
# Relance le faux Supabase (données de demo.mjs rechargées). Journal : $1 (défaut /tmp/faux-supabase.log)
cd "$(dirname "$0")"
LOG=${1:-/tmp/faux-supabase.log}
[ -f .pid ] && kill "$(cat .pid)" 2>/dev/null
node faux-supabase.mjs 54321 > "$LOG" 2>&1 &
echo $! > .pid
