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

## License

Created by Hazami