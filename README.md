# Astinel Frontend

Next.js web application for the Astinel security scanning platform.

[![CI](https://github.com/Astinel-Org/Astinel-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/Astinel-Org/Astinel-frontend/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)

## Pages

| Route | Type | Description |
|---|---|---|
| `/` | Server | Landing page |
| `/login` | Client | Email/password authentication |
| `/dashboard` | Client | Org overview with severity breakdown and recent scans |
| `/projects` | Client | CRUD project list |
| `/projects/[id]` | Client | Project detail with scan history and triggers |
| `/scans` | Client | Scan list with cancel and retry |
| `/scans/[id]` | Client | Scan detail with results and findings |
| `/findings` | Client | Findings list with filter and suppress/unsuppress |
| `/reports` | Client | Downloadable scan reports |
| `/notifications` | Client | System notifications with read tracking |
| `/settings` | Client | API keys, organization, and integration settings |

## Components

### Layout
- **Sidebar**: Fixed left sidebar with 7-section navigation and active route highlighting
- **Header**: Sticky top bar with theme toggle, notification bell, avatar, and logout

### UI Primitives
Built on Radix UI primitives with Tailwind CSS v4 and class-variance-authority:

| Component | Radix Dependency |
|---|---|
| Button | `@radix-ui/react-slot` |
| Card | None (plain divs) |
| Badge | None (CVA variants) |
| Input | None |
| Progress | `@radix-ui/react-progress` |
| Avatar | `@radix-ui/react-avatar` |
| Separator | `@radix-ui/react-separator` |
| Skeleton | None (CSS pulse animation) |

### Theme
- Dark mode by default, toggleable via `ThemeProvider` React context
- CSS custom properties in `globals.css` mapped to Tailwind v4 utilities
- Fonts: Geist Sans and Geist Mono via `next/font/google`

## API Client

Singleton `ApiClient` in `src/lib/api.ts`:

- Base URL from `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`)
- JWT Bearer token in `localStorage` under key `"token"`
- Methods: `get<T>`, `post<T>`, `put<T>`, `patch<T>`, `delete<T>`
- Parses JSON error bodies, throws `Error` with message
- No auto-redirect on 401, no retry logic, no refresh token handling

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Backend API base URL |

## Scripts

```bash
npm run dev      # next dev
npm run build    # next build
npm run start    # next start
npm run lint     # ESLint (flat config)
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| UI primitives | @radix-ui (10 packages) |

## Known Limitations

- JWT tokens stored in `localStorage` (XSS-accessible) rather than HTTP-only cookies
- No automatic redirect to login on token expiry
- No refresh token rotation mechanism
- No middleware-based route protection
- No Content Security Policy headers configured
- `NEXT_PUBLIC_API_URL` is used without validation

## Related Repositories

| Repository | Description |
|---|---|
| [Astinel-backend](https://github.com/Astinel-Org/Astinel-backend) | Rust API server |
| [Astinel-contracts](https://github.com/Astinel-Org/Astinel-contracts) | Soroban smart contracts |
