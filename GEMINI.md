# Project: Kanban Board

This is a simple, frontend-only Kanban board application built with Next.js and styled with DaisyUI.

## Core Features

*   **Drag-and-Drop:** Users can move tasks (cards) between different columns to update their status.
*   **Persistent State:** The board state is saved to the browser's `localStorage`, so your tasks are preserved between sessions.
*   **Component-Based:** Built with React components for modularity and reusability.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **UI:** [DaisyUI](https://daisyui.com/) & [Tailwind CSS](https://tailwindcss.com/)
*   **Drag and Drop:** [@dnd-kit/core](https://dndkit.com/)
*   **Language:** TypeScript

## Architecture

This project is designed as a pure frontend application without a backend. All data is managed on the client-side and stored in `localStorage` to ensure data persistence across browser reloads.
