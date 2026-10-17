#!/usr/bin/env bash
#
# Full-stack local dev controller for Latent Inference.
#
# Runs two background processes and manages their lifecycle:
#   - the API server (server/dev.ts): the same /api router the Lambda runs,
#     against a local file store in .data/ and the secrets in .env
#   - Astro's dev server, which proxies /api to it
#
#   ./scripts/serve.sh start     start both (default)
#   ./scripts/serve.sh stop      stop them and free ports
#   ./scripts/serve.sh restart   stop then start
#   ./scripts/serve.sh status    report running state and port usage
#
set -euo pipefail
cd "$(dirname "$0")/.."

FRONT_PORT=4321   # Astro dev server (the URL you visit)
API_PORT=8787     # local API server
PID_FILE=".dev-server.pid"
LOG_FILE=".dev-server.log"

have() { command -v "$1" >/dev/null 2>&1; }

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
  for p in "$FRONT_PORT" "$API_PORT"; do kill_port "$p"; done
}

start() {
  free_ports
  if ! have node; then echo "Node.js is required (https://nodejs.org)"; exit 1; fi

  echo "Starting the API server and Astro..."
  : >"$LOG_FILE"
  API_PORT=$API_PORT nohup node_modules/.bin/tsx server/dev.ts >>"$LOG_FILE" 2>&1 &
  echo $! >"$PID_FILE"
  # ASTRO_DEV_BACKGROUND=1 keeps Astro in the foreground of its own process.
  # (Astro 7 otherwise auto-backgrounds in agent/CI shells and exits.)
  ASTRO_TELEMETRY_DISABLED=1 ASTRO_DEV_BACKGROUND=1 API_PORT=$API_PORT \
    nohup node_modules/.bin/astro dev --port "$FRONT_PORT" >>"$LOG_FILE" 2>&1 &
  echo $! >>"$PID_FILE"
  echo "  pids $(tr '\n' ' ' <"$PID_FILE")· logs: $LOG_FILE"
  printf "  waiting for http://localhost:%s " "$FRONT_PORT"

  local i
  for i in $(seq 1 45); do
    if have curl && curl -sf -o /dev/null "http://localhost:$FRONT_PORT/" && curl -s -o /dev/null "http://localhost:$API_PORT/api/editions"; then
      echo ""
      echo "Ready -> http://localhost:$FRONT_PORT"
      return 0
    fi
    printf "."
    sleep 1
  done
  echo ""
  echo "Timed out waiting for the servers. Recent log:"
  tail -n 20 "$LOG_FILE" || true
  exit 1
}

stop() {
  if [ -f "$PID_FILE" ]; then
    while read -r pid; do
      if [ -n "${pid:-}" ] && kill -0 "$pid" 2>/dev/null; then
        echo "Stopping pid $pid..."
        kill "$pid" 2>/dev/null || true
      fi
    done <"$PID_FILE"
    rm -f "$PID_FILE"
  fi
  free_ports
  echo "Stopped."
}

status() {
  if [ -f "$PID_FILE" ]; then
    echo "Dev servers (pids $(tr '\n' ' ' <"$PID_FILE")) -> http://localhost:$FRONT_PORT"
  else
    echo "Dev servers not running."
  fi
  if have lsof; then
    for p in "$FRONT_PORT" "$API_PORT"; do
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
