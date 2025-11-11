// runtime-config.js
// This file is intentionally simple and is loaded before the app hydrates.
// In production you may overwrite this file at container startup with real
// environment values. Example generation (Linux entrypoint):
//   cat > /usr/share/app/public/runtime-config.js <<EOF
//   window.__RUNTIME_CONFIG__ = { NEXT_PUBLIC_API_BASE_URL: "$NEXT_PUBLIC_API_BASE_URL" }
//   EOF

window.__RUNTIME_CONFIG__ = {
  // Default values used for local development. Replace at runtime in containers.
  // Point to the API Gateway service (update host/port as needed for your environment)
  NEXT_PUBLIC_API_BASE_URL: "http://localhost:8080",
};
