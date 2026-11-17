# Rakshit Daily OS

A personal productivity dashboard for Rakshit Tiwari, focused on day-to-day execution, network operations, career growth, personal branding, learning and healthy routines.

## What's included

- **Overview dashboard:** task completion, pending work, high-priority tasks and habit check-ins.
- **Daily schedule:** editable time blocks with category labels, descriptions and start/end times.
- **Task manager:** add, complete, delete and filter tasks by area and priority.
- **Weekly goals:** create and check off outcomes across work, career, learning and personal-brand areas.
- **Habits:** daily check-ins and custom habits.
- **Daily reflection:** a notes space for wins, blockers and tomorrow's first action.
- **Responsive UI:** sidebar navigation on desktop and mobile-friendly layout.

## Run locally

Requirements: Node.js 18.17 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To create a production build:

```bash
npm run build
npm start
```

## Stack

Next.js 14 (App Router), React, TypeScript, Tailwind CSS and lucide-react.

## Data storage

The first version is local-first: your tasks, schedule, goals, habits and reflection are stored in your browser's localStorage. They are not sent to a server and do not yet sync across devices. Clearing the browser's site data will remove the locally saved planner data.

## Deployment

Import this repository into Vercel and deploy with the default Next.js settings. No environment variables are required for this version.
