# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands
- Build: `npm run build` - TypeScript build and Vite build
- Development: `npm run dev` - Start Vite dev server
- Linting: `npm run lint` - Run ESLint on the codebase
- Preview: `npm run preview` - Preview the production build
- Testing: `npx jest src/tests/gridStore.test.ts` - Run the gridStore test file

## Code Style Guidelines
- **Imports**: Use absolute imports with `@/` alias for src directory paths
- **TypeScript**: Strict mode enabled; avoid unused variables/parameters
- **React**: Use functional components with hooks; follow React-hooks ESLint rules
- **Naming**: PascalCase for components; camelCase for variables/functions
- **Components**: Follow ShadCN/Radix UI patterns for UI components
- **Styling**: Use Tailwind CSS with the `cn` utility for class merging
- **Error Handling**: Use try/catch blocks for async operations
- **State Management**: Prefer React hooks (useState, useContext) and Zustand for global state
- **File Structure**: Group related components in subdirectories
- **AG Grid**: Use AG Grid Enterprise components for data tables
- **Testing**: Use Jest for unit tests