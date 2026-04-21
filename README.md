# QE Automation Hub

A modern web dashboard for managing test automation projects, RPA bots, and quality engineering workflows.

## Overview

QE Automation Hub provides a centralized interface for quality engineers to manage automation projects, track test executions, schedule runs, and collaborate with team members. It supports both **Test Automation** and **RPA (Robotic Process Automation)** project types.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev) |
| Routing | [TanStack Router](https://tanstack.com/router) |
| UI Components | [Radix UI](https://radix-ui.com) primitives |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [Tailwind Merge](https://github.com/dcastil/tailwind-merge) |
| Charts | [Recharts](https://recharts.org) |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Icons | [Lucide React](https://lucide.dev) |
| Build Tool | [Vite 7](https://vite.dev) |
| Deployment | [Cloudflare Pages](https://pages.cloudflare.com) (via `@cloudflare/vite-plugin`) |
| Language | TypeScript |
| Linting | ESLint + Prettier |

## Project Structure

```
src/
├── components/
│   ├── Shell.tsx              # Main layout wrapper with sidebar
│   ├── StatusBadge.tsx        # Reusable status indicator
│   └── project/               # Project detail tab components
│       ├── OverviewTab.tsx    # Project overview & metrics
│       ├── CasesTab.tsx       # Test case management
│       ├── ApiTab.tsx         # API endpoint testing
│       ├── ScriptsTab.tsx     # Automation scripts
│       ├── MobileTab.tsx      # Mobile app testing
│       ├── WebTab.tsx         # Web UI automation
│       ├── ExecutionTab.tsx   # Execution history
│       ├── ResultsTab.tsx     # Test results & logs
│       ├── RpaTab.tsx         # RPA flow management
│       ├── DiscussionTab.tsx  # Team discussions
│       └── SettingsTab.tsx    # Project settings
│   └── ui/                    # Reusable UI components (Radix-based)
├── routes/
│   ├── __root.tsx             # Root layout
│   ├── index.tsx              # Dashboard (home)
│   ├── projects.tsx           # Projects list
│   ├── projects.$projectId.tsx # Project detail with tabs
│   ├── runs.tsx               # All runs across projects
│   ├── schedule.tsx           # Scheduled automation runs
│   └── settings.tsx           # Workspace settings
├── lib/
│   ├── mock-data.ts           # Sample data for demonstration
│   └── utils.ts               # Utility functions (cn helper)
├── hooks/
│   └── use-mobile.tsx         # Mobile viewport detection
├── router.tsx                 # Router configuration
├── routeTree.gen.ts           # Generated route tree
└── styles.css                 # Global styles
```

## Features

### Dashboard
- Welcome hero with user greeting
- Project summary cards (total cases, pass rate, runs, flows)
- Pass/fail trend chart (Recharts AreaChart)
- Recent activity feed
- Quick access to projects

### Projects
- Filterable project list (All / Test Automation / RPA)
- Search functionality
- Create new project dialog
- Project cards with type, status, and metrics

### Project Detail
Multi-tab interface with:
- **Overview** — Project metrics, recent runs, team activity
- **Cases** — Test case management with priority and status
- **API** — API endpoint testing and monitoring
- **Scripts** — Automation script library (Selenium, Cypress, Playwright, Robot Framework, Python, JavaScript)
- **Mobile** — Mobile device management and builds
- **Web** — Web UI automation configuration
- **Execution** — Execution history and triggers
- **Results** — Detailed test results with logs and attachments
- **RPA** — RPA flow management and scheduling
- **Discussion** — Team comments and collaboration
- **Settings** — Project-specific configuration

### Runs
- Chronological list of all executions across projects
- Filter by date range (Today, This week)
- Filter by status (Failed only)
- Pass/fail statistics per run

### Schedule
- Weekly calendar view of scheduled runs
- Visual indicators for different projects
- Cron-based scheduling display
- Next run countdown

### Settings
- Team member management
- Role-based access (Admin, QE, Viewer)
- Integration settings
- Notification preferences

## Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Development build (for debugging)
npm run build:dev

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## Design System

### Glass Morphism
The UI uses a glass-morphism aesthetic with:
- Translucent backgrounds (`glass` class)
- Subtle borders (`border-white/60`)
- Blur effects for depth
- Gradient accents

### Color Scheme
- Primary gradient defined via CSS custom property `--gradient-primary`
- Semantic colors: success (green), error (red), warning (yellow), info (blue)
- Muted text for secondary content

### Components
All UI components are built on Radix UI primitives with Tailwind styling:
- Accordions, Alert Dialogs, Alerts
- Avatar, Badge, Breadcrumb
- Button, Calendar, Card, Carousel
- Checkbox, Collapsible, Context Menu
- Dialog, Drawer, Dropdown Menu
- Form, Hover Card, Input, Input OTP
- Label, Menubar, Navigation Menu
- Pagination, Popover, Progress
- Radio Group, Resizable Panels, Scroll Area
- Select, Separator, Sheet, Sidebar
- Skeleton, Slider, Sonner (toasts)
- Switch, Tabs, Textarea, Toggle, Tooltip

## Data Models

### Project
- `id`, `name`, `description`, `type` (Test Automation | RPA)
- `cases` (test case count), `passRate` (percentage)
- `runs[]`, `flows[]` (RPA flows), `team[]`

### Test Case
- `id`, `title`, `steps[]`, `expected`
- `priority` (P1/P2/P3), `status`, `lastRun`, `durationMs`
- `tags[]`, `linkedApi`, `linkedScript`, `attachments[]`

### Run Record
- `id`, `name`, `date`, `duration`
- `passed`, `failed`, `skipped` counts
- `trigger` (Manual | Scheduled | CI/CD)

### API Endpoint
- `id`, `name`, `method` (GET/POST/PUT/DELETE/PATCH)
- `url`, `headers`, `body`, `expectedStatus`
- `lastStatus`, `lastDurationMs`, `tags[]`

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment

This project is configured for **Cloudflare Pages** deployment:

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The app uses the `@cloudflare/vite-plugin` for server-side rendering on Cloudflare Workers. Configuration is in [wrangler.jsonc](wrangler.jsonc):

- **Compatibility Date**: `2025-09-24`
- **Compatibility Flag**: `nodejs_compat`
- **Entry Point**: `@tanstack/react-start/server-entry`

## Lovable Platform

This project is built on **Lovable** (lovable.dev), which provides:
- Pre-configured TanStack Start + React + Vite setup
- Automatic Cloudflare deployment
- Built-in component tagging for debugging
- Sandboxed development environment

The config is handled by `@lovable.dev/vite-tanstack-config` — do not add duplicate plugins in `vite.config.ts`.

## Color Palette (OKLCH)

The design system uses the OKLCH color space for consistent, accessible colors:

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `oklch(0.55 0.22 275)` | Violet/blue accent |
| `--success` | `oklch(0.68 0.17 155)` | Green (passed tests) |
| `--warning` | `oklch(0.78 0.16 75)` | Yellow (pending) |
| `--destructive` | `oklch(0.62 0.24 25)` | Red (failed tests) |
| `--background` | `oklch(0.99 0.005 240)` | Near-white base |

## Typography

- **Display Font**: Space Grotesk (headings, logo)
- **Body Font**: Inter (UI text, forms)

Loaded via Google Fonts in [__root.tsx](src/routes/__root.tsx).

## Extended Data Models

### Environment
```typescript
interface Environment {
  id: string;
  name: "Dev" | "UAT" | "Prod";
  baseUrl: string;
  variables: { key: string; value: string; secret?: boolean }[];
}
```

### TestSuite
```typescript
interface TestSuite {
  id: string;
  name: string;
  caseIds: string[];
  schedule?: string;
}
```

### DiscussionPost
```typescript
interface DiscussionPost {
  id: string;
  author: string;
  initials: string;
  date: string;
  title: string;
  body: string;
  replies: number;
  linkedTo?: { type: "case" | "api" | "run"; id: string; label: string };
  tags: string[];
}
```

### Coverage
```typescript
interface Coverage {
  ui: number;    // percentage
  api: number;   // percentage
  mobile: number; // percentage
}
```

### FlakyTest
```typescript
interface FlakyTest {
  id: string;
  title: string;
  failureRate: number;
  lastFailures: number;
}
```

## SEO & Meta

The app includes Open Graph and Twitter Card meta tags:

- **OG Title**: "QE Automation Hub"
- **OG Description**: "Manage automation projects, scripts, RPA flows and execution results in one glassy workspace."
- **OG Type**: website
- **Twitter Card**: summary_large_image

## Linting

ESLint configuration in [eslint.config.js](eslint.config.js):
- TypeScript ESLint
- React Hooks plugin
- React Refresh plugin
- Prettier integration

```bash
npm run lint    # Check code
npm run format  # Auto-fix formatting
```

## TypeScript Config

Strict mode enabled with:
- **Target**: ES2022
- **Module**: ESNext
- **Path Alias**: `@/*` → `./src/*`

## License

Created by Hazami