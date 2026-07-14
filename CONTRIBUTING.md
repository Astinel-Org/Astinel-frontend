# Contributing to Astinel Frontend

## Development Setup

```bash
git clone https://github.com/Astinel-Org/Astinel-frontend.git
cd Astinel-frontend
npm install
npm run dev
```

## CI Expectations

Every pull request must pass:

```bash
npm run build    # Production build
npm run lint     # ESLint (no errors, no warnings)
```

## Code Style

- TypeScript strict mode enabled
- ESLint with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Prefer named exports for components
- Use `"use client"` only when hooks or browser APIs are needed
- Import UI components from `@/components/ui/`
- Use `cn()` utility from `@/lib/utils` for conditional classes

## Next.js 16 Notes

This project uses Next.js 16 with the App Router. Key differences from earlier versions:

- Tailwind CSS v4 with `@tailwindcss/postcss` plugin (not `tailwind.config.js`)
- React 19 with automatic JSX transform
- No `pages/` directory — all routes in `src/app/`
