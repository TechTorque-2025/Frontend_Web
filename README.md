# 💻 Frontend Web Application

## 🚦 Build Status

**main**

[![Build and Test Frontend_Web](https://github.com/TechTorque-2025/Frontend_Web/actions/workflows/buildtest.yaml/badge.svg)](https://github.com/TechTorque-2025/Frontend_Web/actions/workflows/buildtest.yaml)

**dev**

[![Build and Test Frontend_Web](https://github.com/TechTorque-2025/Frontend_Web/actions/workflows/buildtest.yaml/badge.svg?branch=dev)](https://github.com/TechTorque-2025/Frontend_Web/actions/workflows/buildtest.yaml)

This repository contains the source code for the TechTorque 2025 customer and employee-facing web application.

### ✨ Key Features

- **Customer Dashboard:** View vehicle service progress in real-time.
- **Appointment Booking:** Schedule, view, and manage service appointments.
- **Employee Portal:** Log work hours, update service status, and view daily schedules.
- **Admin Dashboard:** Manage users, services, and view system analytics.

### ⚙️ Tech Stack

![Next.js](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS

### 🚀 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Server:**
   Ensure all backend services are running via the main `docker-compose.yml`.
   ```bash
   npm run dev
   ```

3. **Access Application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Setup Git Hooks (Recommended):**
   ```bash
   npm run setup-hooks
   ```
   This configures automatic linting on commit and build checking on push. See [GIT_HOOKS.md](GIT_HOOKS.md) for details.

   ### 🔌 Environment

   - The frontend expects an API base to be available at runtime. You can configure this via the
      `NEXT_PUBLIC_API_BASE_URL` environment variable. When not set, the runtime defaults to
      `http://localhost:8080` (useful in development).

   - The AI chat widget reaches the AI chat proxy at `/api/v1/ai/chat` (or `{{NEXT_PUBLIC_API_BASE_URL}}/api/v1/ai/chat` when the public API base is set). This ensures the frontend talks to the configured API gateway or the local Next.js proxy.

### 🎨 Theme & Styling (Centralized)

- A single global stylesheet lives at `src/app/globals.css` and contains all theme variables for light & dark mode, plus utility classes like:
   - `.theme-button-primary`, `.theme-button-secondary` — semantic buttons
   - `.theme-bg-primary`, `.theme-text-primary`, `.theme-border`, etc — consistent building blocks
   - `.automotive-accent`, `.accent-badge`, `.text-gradient-accent`, `.progress-accent` — accent utilities

- Theme switching is implemented using `src/app/contexts/ThemeContext.tsx` plus a small pre-hydration script in `src/app/layout.tsx` (so the app applies the saved system preference or previously saved theme before React mounts to avoid flashes).

- Quick checks added:
   - `npm run check:theme` — verifies `globals.css` and `ThemeContext` contain expected hooks and variables.
   - `npm run check:colors` — scans `src/` for hardcoded hex/rgb color usage (ignores `globals.css`).

If you're adding new UI colors, add variables to `src/app/globals.css` and use the semantic utility classes (or create new ones) — this keeps light/dark behavior centralized and consistent across the app.
