# SentryShot Frontend

This is the frontend for SentryShot, a web application for viewing live video streams, logs, and recordings.

## Tech Stack

- **Framework:** [Solid](https://solidjs.com/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Components:** [daisyUI](https://daisyui.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Routing:** [React Router](https://reactrouter.com/)
- **Tables:** [TanStack Table](https://tanstack.com/table)
- **Icons:** [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/)

### Installation

1.  Clone the repository.
2.  Install the dependencies:
    ```bash
    pnpm install
    ```

### Running the Development Server

To start the local development server, run:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Available Scripts

-   `pnpm dev`: Starts the development server.
-   `pnpm build`: Builds the application for production.
-   `pnpm lint`: Lints the codebase using ESLint.
-   `pnpm preview`: Serves the production build locally for preview.

## Project Structure

-   `src/pages`: Contains the main pages of the application (LiveView, Logs, Recordings, Settings).
-   `src/components`: Contains reusable React components.
    -   `src/components/ui`: Auto-generated components from shadcn/ui.
    -   `src/components/logs-viewer`: Components related to the logs table.
    -   `src/components/viewer`: Components for video streaming and playback.
-   `src/lib`: Utility functions.
-   `src/hooks`: Custom React hooks.
