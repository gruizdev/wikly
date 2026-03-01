# Objectives App

A colorful, mobile-optimized React app to define and track weekly, monthly, and yearly objectives.

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

✨ **Create Objectives** - Add objectives with optional emoji icons and frequency (weekly, monthly, yearly)

📊 **Track Progress** - Mark objectives as complete and see your daily progress

🎨 **Vibrant Design** - Youth-friendly, colorful interface optimized for mobile

💾 **Local Storage** - Your objectives are automatically saved to your device

## Project Structure

```
src/
  ├── components/      # Reusable React components
  ├── pages/          # Page components (Home, CreateObjective)
  ├── context/        # React Context for state management
  ├── types/          # TypeScript types
  ├── styles/         # Global styles
  └── App.tsx         # Main app component
```

## Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **LocalStorage** - Data persistence

## Development

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```
