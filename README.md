# Weekly Schedule App

An interactive weekly schedule planner built with Next.js and React.

## Features

- **Interactive Grid**: Click anywhere on the grid to create an event at that time slot.
- **Multi-Day Events**: Easily schedule recurring events in one go.
- **Customizable**: Pick from a palette of pastel colors for your events.
- **Smart Time Input**: Flexible time entry (supports dropdown selection and manual input).
- **Persist & Share**:
    - **Save**: Download your schedule as a clean JSON file.
    - **Load**: Import your schedule on any device.
    - **Print**: Optimized landscape print layout for physical copies.
- **Clean UI**: Minimalist design with glassmorphism effects and smooth animations.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Library**: [React](https://reactjs.org/)
- **Styling**: CSS Modules (Vanilla CSS)
- **Icons**: SVG Icons (Lucide-style)
- **Language**: TypeScript

## Project Structure

- `components/`: Reusable UI components.
    - `TimeGrid/`: Main schedule grid logic.
    - `AddEventModal/`: Form for creating/editing events.
    - `EventCard/`: The visual block for a scheduled item.
    - `TopActions/`: Toolbar for Save/Load/Clear/Print.
- `utils/`: Helper constants and functions.
- `app/`: Next.js App Router pages.

### Made using [Antigravity](https://antigravity.google)