#!/usr/bin/env bash
#
# Full-stack local dev controller for The Course Ledger.
#
# Runs Netlify Dev (Astro pages + Netlify Functions + Blobs + redirects) as a
# background process and manages its lifecycle. Start/stop clear stale ports so
# restarts are painless — important because Astro 7 and Netlify Dev each bind
# ports and can leave strays behind.
#
#   ./scripts/serve.sh start     start the full stack (default)
#   ./scripts/serve.sh stop      stop it and free ports
#   ./scripts/serve.sh restart   stop then start
#   ./scripts/serve.sh status    report running state and port usage
#
set -euo pipefail
cd "$(dirname "$0")/.."

FRONT_PORT=4321      # Astro dev server
ALT_PORT=4322        # Astro fallback if 4321 is busy
PROXY_PORT=8888      # Netlify Dev proxy (the URL you visit)
PID_FILE=".dev-server.pid"
LOG_FILE=".dev-server.log"

have() { command -v "$1" >/dev/null 2>&1; }

astro_bin() {
  if [ -x "node_modules/.bin/astro" ]; then echo "node_modules/.bin/astro"; else echo ""; fi
}

kill_port() {
  local port="$1" pids
  if have lsof; then
    pids="$(lsof -ti tcp:"$port" 2>/dev/null || true)"
    if [ -n "$pids" ]; then
      echo "  freeing port $port (pids: $pids)"
      # shellcheck disable=SC2086
      kill -9 $pids 2>/dev/null || true
    fi
  fi
}

free_ports() {
  echo "Clearing dev processes and ports..."
  pkill -f "netlify dev" 2>/dev/null || true
  local astro; astro="$(astro_bin)"
  [ -n "$astro" ] && "$astro" dev stop >/dev/null 2>&1 || true
  for p in "$FRONT_PORT" "$ALT_PORT" "$PROXY_PORT"; do kill_port "$p"; done
}

start() {
  free_ports
  if ! have node; then echo "Node.js is required (https://nodejs.org)"; exit 1; fi

  local runner
  if [ -x "node_modules/.bin/netlify" ]; then runner="node_modules/.bin/netlify"; else runner="npx --yes netlify-cli"; fi

  echo "Starting Netlify Dev (full stack)..."
  # ASTRO_DEV_BACKGROUND=1 keeps Astro in the FOREGROUND under Netlify Dev.
  # (Astro 7 otherwise auto-backgrounds in agent/CI shells and exits, which makes
  # Netlify Dev shut down.)
  ASTRO_TELEMETRY_DISABLED=1 ASTRO_DEV_BACKGROUND=1 nohup $runner dev >"$LOG_FILE" 2>&1 &
  echo $! >"$PID_FILE"
  echo "  pid $(cat "$PID_FILE") · logs: $LOG_FILE"
  printf "  waiting for http://localhost:%s " "$PROXY_PORT"

  local i
  for i in $(seq 1 45); do
    if have curl && curl -sf -o /dev/null "http://localhost:$PROXY_PORT/"; then
      echo ""
      echo "Ready -> http://localhost:$PROXY_PORT"
      return 0
    fi
    printf "."
    sleep 1
  done
  echo ""
  echo "Timed out waiting for the server. Recent log:"
  tail -n 20 "$LOG_FILE" || true
  exit 1
}

stop() {
  if [ -f "$PID_FILE" ]; then
    local pid; pid="$(cat "$PID_FILE" 2>/dev/null || true)"
    if [ -n "${pid:-}" ] && kill -0 "$pid" 2>/dev/null; then
      echo "Stopping dev server (pid $pid)..."
      kill "$pid" 2>/dev/null || true
      sleep 1
      kill -9 "$pid" 2>/dev/null || true
    fi
    rm -f "$PID_FILE"
  fi
  free_ports
  echo "Stopped."
}

status() {
  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE" 2>/dev/null || echo -1)" 2>/dev/null; then
    echo "Dev server running (pid $(cat "$PID_FILE")) -> http://localhost:$PROXY_PORT"
  else
    echo "Dev server not running."
  fi
  if have lsof; then
    for p in "$FRONT_PORT" "$PROXY_PORT"; do
      if lsof -ti tcp:"$p" >/dev/null 2>&1; then echo "  port $p: busy"; else echo "  port $p: free"; fi
    done
  fi
}

case "${1:-start}" in
  start)   start ;;
  stop)    stop ;;
  restart) stop; start ;;
  status)  status ;;
  *) echo "Usage: $0 {start|stop|restart|status}"; exit 1 ;;
esac
