#!/usr/bin/env bash
#
# One-command onboarding for The Course Ledger.
#   - installs dependencies
#   - creates .env from the template (if missing)
#   - extracts PDF text (incremental)
#
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Installing dependencies"
npm install

if [ ! -f .env ]; then
  cp .env.example .env
  echo "==> Created .env from .env.example"
  echo "    Add your ANTHROPIC_API_KEY there to enable the chat locally."
fi

echo "==> Extracting PDF text (incremental)"
npm run extract

cat <<'EOF'

Setup complete. Common commands:
  npm run dev        Pages-only dev server   -> http://localhost:4321
  npm start          Full stack (Functions)  -> http://localhost:8888
  npm stop           Stop the full-stack server and free ports
  npm run build      Production build into dist/
  npm run deploy     Deploy a draft to Netlify (needs `netlify link` first)
  npm run deploy:prod  Deploy to production
EOF
