#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNTIME_DIR="/tmp/spanish-its-dev"
CLIENT_PID_FILE="$RUNTIME_DIR/client.pid"
SERVER_PID_FILE="$RUNTIME_DIR/server.pid"
CLIENT_LOG_FILE="$RUNTIME_DIR/client.log"
SERVER_LOG_FILE="$RUNTIME_DIR/server.log"

mkdir -p "$RUNTIME_DIR"

is_running() {
  local pid="$1"
  kill -0 "$pid" 2>/dev/null
}

read_pid() {
  local pid_file="$1"

  if [[ -f "$pid_file" ]]; then
    cat "$pid_file"
  fi
}

stop_process() {
  local name="$1"
  local pid_file="$2"
  local pid

  pid="$(read_pid "$pid_file")"

  if [[ -z "${pid:-}" ]]; then
    echo "$name is not running."
    return
  fi

  if is_running "$pid"; then
    # Kill the whole process group so npm and its child process both stop.
    kill -TERM "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
    sleep 1

    if is_running "$pid"; then
      kill -KILL "-$pid" 2>/dev/null || kill -KILL "$pid" 2>/dev/null || true
    fi

    echo "Stopped $name."
  else
    echo "$name had a stale PID file."
  fi

  rm -f "$pid_file"
}

start_process() {
  local name="$1"
  local working_dir="$2"
  local pid_file="$3"
  local log_file="$4"
  local pid

  pid="$(read_pid "$pid_file")"

  if [[ -n "${pid:-}" ]] && is_running "$pid"; then
    echo "$name is already running (PID $pid)."
    return
  fi

  rm -f "$pid_file"
  : > "$log_file"

  nohup bash -lc "cd \"$working_dir\" && exec npm run dev" >>"$log_file" 2>&1 &

  pid=$!
  echo "$pid" > "$pid_file"
  echo "Started $name (PID $pid). Log: $log_file"
}

status_process() {
  local name="$1"
  local pid_file="$2"
  local pid

  pid="$(read_pid "$pid_file")"

  if [[ -n "${pid:-}" ]] && is_running "$pid"; then
    echo "$name: running (PID $pid)"
  else
    echo "$name: stopped"
  fi
}

start_all() {
  start_process "server" "$ROOT_DIR/server" "$SERVER_PID_FILE" "$SERVER_LOG_FILE"
  start_process "client" "$ROOT_DIR/client" "$CLIENT_PID_FILE" "$CLIENT_LOG_FILE"
}

stop_all() {
  stop_process "client" "$CLIENT_PID_FILE"
  stop_process "server" "$SERVER_PID_FILE"
}

restart_all() {
  stop_all
  start_all
}

print_status() {
  status_process "server" "$SERVER_PID_FILE"
  status_process "client" "$CLIENT_PID_FILE"
  echo "Server log: $SERVER_LOG_FILE"
  echo "Client log: $CLIENT_LOG_FILE"
}

print_usage() {
  cat <<'EOF'
Usage: ./dev-servers.sh [command]

Commands:
  start    Start both the server and client
  stop     Stop both the server and client
  restart  Restart both the server and client
  status   Show whether each process is running
EOF
}

COMMAND="${1:-start}"

case "$COMMAND" in
  start)
    start_all
    ;;
  stop)
    stop_all
    ;;
  restart)
    restart_all
    ;;
  status)
    print_status
    ;;
  *)
    print_usage
    exit 1
    ;;
esac
