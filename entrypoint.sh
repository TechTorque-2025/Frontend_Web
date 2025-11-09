#!/bin/sh
# entrypoint.sh - Generate runtime config and start Next.js

# Generate runtime configuration file
cat > /app/public/runtime-config.js <<EOF
window.__RUNTIME_CONFIG__ = {
  NEXT_PUBLIC_API_BASE_URL: "${NEXT_PUBLIC_API_BASE_URL:-http://localhost:8080}"
};
EOF

echo "Runtime configuration generated:"
cat /app/public/runtime-config.js

# Start Next.js server
exec node server.js
