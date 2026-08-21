# AI Workplace Productivity Assistant

A modern, responsive web application that helps professionals automate everyday workplace tasks using AI. Built with a clean SaaS aesthetic and powered by a server-side AI gateway, the assistant provides three focused tools for drafting emails, summarising meetings, and planning tasks.

## Live Demo

- **Published site:** https://workbuddy-ai-62.lovable.app
- **Preview site:** https://id-preview--75421045-8bc0-4fd7-911c-632186f93c81.lovable.app

## Features

### 1. Smart Email Generator

Draft professional email responses from a short description or a pasted email thread.

- **Context-aware tone:** The AI automatically detects the required tone (formal, friendly, persuasive, apologetic, direct) from the email context.
- **Adaptive length:** The output length is inferred from the context, producing concise, standard, or detailed replies as needed.
- **Recipient & sign-off:** Add the recipient and preferred sign-off to personalise the draft.
- **One-click actions:** Generate, regenerate, copy, and reset the draft instantly.

### 2. Meeting Notes Summariser

Turn raw meeting notes or a full transcript into a structured summary.

- **Auto-detected title:** The AI infers the meeting title from the notes.
- **Auto detail level:** The summary depth is determined automatically (brief, balanced, or thorough).
- **Structured output:** Extracts summary points, decisions, action items, deadlines, and open questions.
- **One-click actions:** Summarise, regenerate, copy, and reset.

### 3. AI Task Planner

Generate daily or weekly schedules from a list of tasks, goals, and constraints.

- **Daily or weekly schedules:** The AI chooses the right horizon based on what you describe.
- **Automatic priorities:** Tasks are assigned High, Moderate, or Low priority automatically.
- **Priority-based ordering:** Schedules are organised by priority without fixed clock-time blocks.
- **One-click actions:** Generate schedule, regenerate, copy, and reset.

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start/) (full-stack React framework)
- **Language:** TypeScript
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4 with custom oklch colour tokens
- **AI Provider:** Lovable AI Gateway
- **Build Tool:** Vite 7

## Project Structure

```
.
├── src/
│   ├── components/           # Shared UI components (AppShell, Workspace)
│   ├── lib/                  # Utility libraries and AI server functions
│   ├── routes/               # TanStack Start file-based routes
│   ├── styles.css            # Global styles and theme tokens
│   ├── router.tsx            # Router configuration
│   └── start.ts              # Server start configuration
├── public/                   # Static assets
├── README.md
├── package.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm or bun

### Install & Run

```sh
# Clone the repository
git clone <repository-url>
cd ai-workplace-productivity-assistant

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080` by default.

### Build for Production

```sh
npm run build
```

## AI Usage & Responsible AI Disclaimer

This application uses AI to generate workplace content. While the outputs are designed to save time, they should always be reviewed and edited before being used in professional contexts. The assistant does not store personal data by default and relies on user-provided input for each generation.

## License

This project is built and owned by the project creator. See the repository for licensing details.
