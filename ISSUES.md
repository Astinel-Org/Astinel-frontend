# Astinel Frontend — Engineering Issues

> Generated from full-source audit

## Contents

1. [Auth & State Management](#1-frontend-auth--state-management)
2. [Pages & Components](#2-frontend-pages--components)
3. [Hooks, Services & Data Layer](#3-frontend-hooks-services--data-layer)
4. [Testing & Quality](#4-frontend-testing--quality)
5. [Accessibility](#5-frontend-accessibility)
6. [Code Quality & Dead Code](#6-frontend-code-quality--dead-code)
7. [Performance](#7-frontend-performance)
8. [Developer Experience](#8-frontend-developer-experience)

---

# 1. Frontend: Auth & State Management

## Issue #1 — Implement refresh token handling

**Labels:** frontend, feature, security

**Summary:**
The API client has no mechanism to refresh expired tokens. Users must log in again when the 15-minute access token expires. No silent background refresh is implemented.

**Acceptance Criteria:**

- [ ] Store refresh token alongside access token
- [ ] Add interceptor to detect 401 responses
- [ ] Call `/v1/auth/refresh` on 401
- [ ] Retry the original request with new token
- [ ] On refresh failure, redirect to login

**Difficulty:** Advanced

## Issue #2 — Add auto-redirect to login on token expiry

**Labels:** frontend, feature, security

**Summary:**
When the API returns a 401, the client throws an error but does not redirect to login. Users see broken pages with no path to re-authenticate.

**Acceptance Criteria:**

- [ ] Add response interceptor in `ApiClient`
- [ ] On 401: clear token, redirect to `/login`
- [ ] Preserve the current URL as a `?redirect=` parameter

**Difficulty:** Intermediate

## Issue #3 — Migrate JWT storage from localStorage to HTTP-only cookie

**Labels:** frontend, security, high

**Summary:**
JWT tokens are stored in `localStorage` via `src/lib/api.ts:8,15-16`. Any XSS vulnerability exposes the token to attackers. HTTP-only cookies prevent JavaScript access.

**Acceptance Criteria:**

- [ ] Change backend to set auth cookies with `HttpOnly`, `Secure`, `SameSite=Strict`
- [ ] Update frontend to read token from cookie instead of localStorage
- [ ] Or, if API-based auth is preferred, implement a BFF (backend-for-frontend) pattern

**Difficulty:** Advanced

## Issue #4 — Add middleware-based route protection

**Labels:** frontend, security, high

**Summary:**
No `src/middleware.ts` exists. All routes except `/login` and `/` require authentication, but there is no server-side redirect for unauthenticated users. The API rejects requests, but the UI renders broken pages.

**Acceptance Criteria:**

- [ ] Create `src/middleware.ts`
- [ ] Check for token cookie or authorization header
- [ ] Redirect to `/login` with return URL for unauthenticated requests to protected routes
- [ ] Allow `/login` and `/` without auth
- [ ] Allow static assets and API routes

**Difficulty:** Intermediate

## Issue #5 — Add logout confirmation

**Labels:** frontend, security

**Summary:**
`src/components/layout/header.tsx:14-17`: Logout has no confirmation. A single click immediately logs the user out and clears the token.

**Acceptance Criteria:**

- [ ] Add a confirmation dialog before logout
- [ ] Or add a dropdown menu with "Logout" as a clear action

**Difficulty:** Beginner

---

# 2. Frontend: Pages & Components

## Issue #6 — Reports page uses hardcoded zero UUID

**Labels:** frontend, bug, high

**Summary:**
`src/app/reports/page.tsx:19` hardcodes `project_id=00000000-0000-0000-0000-000000000000` as the filter. The page will never return real reports.

**Acceptance Criteria:**

- [ ] Add project selection UI (dropdown or text input)
- [ ] Pass the selected project ID to the API
- [ ] Default to empty state if no project selected

**Difficulty:** Intermediate

## Issue #7 — Cancel/retry in scan detail missing error handling

**Labels:** frontend, bug

**Summary:**
`src/app/scans/[id]/page.tsx:46-54`: `cancel` and `retry` are async functions with no `try/catch`. If the API call fails, the promise rejection is unhandled (uncaught promise rejection).

**Acceptance Criteria:**

- [ ] Wrap both functions in `try/catch`
- [ ] Show error feedback on failure

**Difficulty:** Beginner

## Issue #8 — Reports page silently swallows all errors

**Labels:** frontend, bug

**Summary:**
`src/app/reports/page.tsx:19-23`: `.catch(() => [])` converts any API error into an empty array. The user sees "No reports yet" even when the API is down, token expired, or server error.

**Acceptance Criteria:**

- [ ] Remove `.catch(() => [])`
- [ ] Add error state with retry button
- [ ] Show error message to user

**Difficulty:** Beginner

## Issue #9 — Scan detail silently swallows result/finding errors

**Labels:** frontend, bug

**Summary:**
`src/app/scans/[id]/page.tsx:32-33`: `.catch(() => null)` and `.catch(() => [])` silently convert API errors into null/empty. The page renders without results and provides no indication of failure.

**Acceptance Criteria:**

- [ ] Show individual error states for results and findings
- [ ] Add retry capability per section

**Difficulty:** Beginner

## Issue #10 — e.preventDefault on div inside Link is fragile

**Labels:** frontend, bug

**Summary:**
`src/app/scans/page.tsx:91`: Cancel/Retry buttons inside a `<Link>` use `onClick={(e) => e.preventDefault()}` on a wrapping `<div>`. This relies on event propagation ordering and breaks if DOM structure changes.

**Acceptance Criteria:**

- [ ] Use `e.stopPropagation()` on the button `onClick` instead
- [ ] Or restructure to avoid nested interactive elements

**Difficulty:** Beginner

## Issue #11 — Implement settings page (API keys, org, GitHub)

**Labels:** frontend, feature

**Summary:**
The settings page (`src/app/settings/page.tsx`) shows three cards all saying "coming soon":
- API key management
- Organization settings
- GitHub integration settings

These are core features for a security platform.

**Acceptance Criteria:**

- [ ] API keys: list existing keys, generate new key (show once), revoke key
- [ ] Organization: name, slug, members list, member roles
- [ ] GitHub: connect/disconnect GitHub App installation
- [ ] Add corresponding backend API endpoints if missing

**Difficulty:** Advanced

## Issue #12 — Add real-time scan progress updates

**Labels:** frontend, feature

**Summary:**
Progress bars on the scans page are static. Users must manually refresh to see updated progress. No WebSocket, SSE, or polling is implemented.

**Acceptance Criteria:**

- [ ] Add polling interval (e.g., 3s) for running scans on the scans list page
- [ ] Add polling for scan detail page while scan is running
- [ ] Show live progress bar animation
- [ ] Stop polling when scan completes or fails

**Difficulty:** Intermediate

## Issue #13 — Add pagination to list pages

**Labels:** frontend, feature

**Summary:**
All list pages (projects, scans, findings, notifications) fetch and render all items at once. With large datasets, this will fail.

**Acceptance Criteria:**

- [ ] Add `page` and `per_page` query params to API calls
- [ ] Add pagination UI component (page numbers, prev/next)
- [ ] Add page state management to each list page

**Difficulty:** Intermediate

## Issue #14 — Implement notification bell navigation and unread badge

**Labels:** frontend, feature

**Summary:**
The header notification bell has no `onClick` handler and no unread badge. Users cannot navigate to notifications from the header or see unread count at a glance.

**Acceptance Criteria:**

- [ ] Add `onClick` to navigate to `/notifications`
- [ ] Fetch unread count from `/v1/notifications/unread-count`
- [ ] Show unread badge on the bell icon
- [ ] Poll or update on notification changes

**Difficulty:** Intermediate

## Issue #15 — Add toast notification system

**Labels:** frontend, enhancement, ux

**Summary:**
`@radix-ui/react-toast` is installed at `^1.2.19` but never used. All CRUD operations (create project, delete project, suppress finding, etc.) provide no success/error feedback.

**Acceptance Criteria:**

- [ ] Create a `useToast` hook wrapping Radix Toast
- [ ] Add toast calls to all mutation handlers
- [ ] Show success toasts on: project created, scan triggered, finding suppressed
- [ ] Show error toasts on: any API failure

**Difficulty:** Intermediate

## Issue #16 — Add confirmation dialog for destructive actions

**Labels:** frontend, enhancement, ux

**Summary:**
`@radix-ui/react-dialog` is installed but unused. The delete project flow uses the native browser `confirm()` dialog which cannot be styled and blocks the main thread.

**Acceptance Criteria:**

- [ ] Create a `ConfirmDialog` component wrapping Radix Dialog
- [ ] Replace `confirm("Delete this project?")` with the dialog

**Difficulty:** Beginner

## Issue #17 — Replace text "Loading..." with Skeleton components

**Labels:** frontend, enhancement, ux

**Summary:**
7 of 9 pages use plain text "Loading..." during data fetching. The `Skeleton` component exists at `src/components/ui/skeleton.tsx` but only the dashboard uses it.

**Acceptance Criteria:**

- [ ] Replace all `<p>Loading...</p>` with skeleton layouts matching page structure
- [ ] Create skeleton variants for cards, tables, and detail pages

**Difficulty:** Beginner

## Issue #18 — Add error states with retry buttons to all pages

**Labels:** frontend, enhancement, ux

**Summary:**
No page has a dedicated error state. When API calls fail, errors are logged to the console and pages show empty states. Users cannot distinguish between "no data" and "API is down."

**Acceptance Criteria:**

- [ ] Add `error` state variable to each page
- [ ] Set error on API failure
- [ ] Show error message with retry button in place of data
- [ ] Add retry handler that resets error and re-fetches

**Difficulty:** Intermediate

## Issue #19 — Add button loading states during API mutations

**Labels:** frontend, enhancement, ux

**Summary:**
Buttons for create project, trigger scan, suppress finding, etc., have no loading state. Users can click multiple times, triggering duplicate API calls.

**Acceptance Criteria:**

- [ ] Add `submitting` state to forms with mutations
- [ ] Disable buttons and show spinner during submission

**Difficulty:** Beginner

---

# 3. Frontend: Hooks, Services & Data Layer

## Issue #20 — Inconsistent API response type usage across pages

**Labels:** frontend, bug

**Summary:**
Some pages access `.data` on `ApiResponse<T>` while others use `T` directly:

| Pattern | Files |
|---|---|
| `api.get<ApiResponse<T>>().then(r => r.data)` | dashboard, projects/[id], scans/[id] |
| `api.get<T>()` (no `.data`) | projects, scans, findings, notifications |

If the API consistently returns `{success, data}`, the four unwrapped pages will receive the wrapper object as data and silently break.

**Acceptance Criteria:**

- [ ] Audit the actual API response format for each endpoint
- [ ] Unify to a single pattern across all pages
- [ ] Type the `ApiClient` response generics to enforce the wrapper

**Difficulty:** Intermediate

## Issue #21 — Unify API response type handling

**Labels:** frontend, refactor

**Summary:**
The inconsistency in `ApiResponse<T>` vs raw `T` usage across pages should be fixed with a single approach. (See Issue #20 for bug details.)

**Acceptance Criteria:**

- [ ] Determine the actual API response format
- [ ] Either update `ApiClient` to unwrap automatically, or update all pages to use `.data`
- [ ] Add type safety to enforce the chosen pattern

**Difficulty:** Intermediate

## Issue #22 — Create shared data fetching hook

**Labels:** frontend, refactor

**Summary:**
Every page duplicates the `useState` + `useEffect` + `useCallback` + error handling pattern for data fetching. A shared `useFetch` or `useQuery` hook would reduce boilerplate and enforce consistent patterns.

**Acceptance Criteria:**

- [ ] Create `useFetch<T>(url)` hook with loading, data, error, and retry
- [ ] Create `useMutation<T>(url, method)` hook for mutations
- [ ] Migrate all pages to use these hooks

**Difficulty:** Intermediate

---

# 4. Frontend: Testing & Quality

## Issue #23 — Set up testing infrastructure

**Labels:** frontend, testing

**Summary:**
No test framework is installed. No `test` script exists in `package.json`. The CI workflow has no test job.

**Acceptance Criteria:**

- [ ] Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
- [ ] Add `test` script to `package.json`
- [ ] Create a basic test setup file with Vitest config
- [ ] Configure `tsconfig` for test files

**Difficulty:** Beginner

## Issue #24 — Add component tests for UI primitives

**Labels:** frontend, testing

**Summary:**
All 10 UI components (Button, Card, Badge, Input, Progress, Avatar, Skeleton, Separator, plus layout components) are untested.

**Acceptance Criteria:**

- [ ] Write tests for each variant of Button (7 variants × sizes)
- [ ] Write tests for each Badge variant (10 variants)
- [ ] Write tests for Card composition
- [ ] Write tests for Input states (disabled, focused, with value)

**Difficulty:** Intermediate

## Issue #25 — Add page-level integration tests

**Labels:** frontend, testing

**Summary:**
No page has integration tests with mocked API responses.

**Acceptance Criteria:**

- [ ] Mock `src/lib/api.ts` for each page
- [ ] Test loading state renders
- [ ] Test data state renders (with mock response)
- [ ] Test empty state renders
- [ ] Test error state renders
- [ ] Test mutation actions (create, delete, suppress)

**Difficulty:** Intermediate

## Issue #26 — Add API client tests

**Labels:** frontend, testing

**Summary:**
The `ApiClient` class has zero tests despite handling auth, tokens, and all HTTP communication.

**Acceptance Criteria:**

- [ ] Test token storage and retrieval
- [ ] Test `Authorization` header is set when token exists
- [ ] Test `Authorization` header is absent when token is null
- [ ] Test error response parsing
- [ ] Test 401 handling

**Difficulty:** Intermediate

## Issue #27 — Add accessibility tests

**Labels:** frontend, testing, accessibility

**Summary:**
No accessibility testing infrastructure exists. The app has known a11y violations (missing aria-labels, missing label associations).

**Acceptance Criteria:**

- [ ] Install `@axe-core/playwright` or `jest-axe`
- [ ] Add a11y tests for critical pages (login, dashboard, projects)
- [ ] Fail CI on a11y violations

**Difficulty:** Intermediate

## Issue #28 — Add E2E tests with Playwright

**Labels:** frontend, testing, ci

**Summary:**
No end-to-end tests exist.

**Acceptance Criteria:**

- [ ] Install `@playwright/test`
- [ ] Add E2E test for login flow
- [ ] Add E2E test for project CRUD
- [ ] Add E2E test for scan lifecycle
- [ ] Add E2E test for findings filter/suppress
- [ ] Add to CI workflow

**Difficulty:** Intermediate

## Issue #29 — Add test job to CI workflow

**Labels:** frontend, ci

**Summary:**
The CI workflow at `.github/workflows/ci.yml` has only `build` and `lint` jobs. No tests are run.

**Acceptance Criteria:**

- [ ] Add a `test` job that runs `vitest run`
- [ ] Add coverage reporting

**Difficulty:** Beginner

## Issue #30 — Add tsc --noEmit type check step

**Labels:** frontend, ci

**Summary:**
TypeScript type checking is only done during `next build`. Adding an explicit `tsc --noEmit` step catches type errors faster.

**Acceptance Criteria:**

- [ ] Add `tsc --noEmit` step to CI workflow

**Difficulty:** Beginner

## Issue #31 — Cache .next build cache between CI runs

**Labels:** frontend, ci, performance

**Summary:**
Every CI run rebuilds from scratch. Caching the `.next/cache` directory would significantly speed up builds.

**Acceptance Criteria:**

- [ ] Add `.next/cache` caching to CI workflow

**Difficulty:** Beginner

## Issue #32 — Add npm audit or equivalent security scanning

**Labels:** frontend, ci, security

**Summary:**
No dependency vulnerability scanning is performed in CI.

**Acceptance Criteria:**

- [ ] Add `npm audit` or equivalent security scanning to CI workflow

**Difficulty:** Beginner

---

# 5. Frontend: Accessibility

## Issue #33 — Add aria-labels to icon-only buttons

**Labels:** frontend, accessibility

**Summary:**
Icon-only buttons (theme toggle, notification bell, logout, refresh, back, delete) lack aria-labels, making them inaccessible to screen readers.

**Acceptance Criteria:**

- [ ] Add descriptive aria-labels to all icon-only buttons
- [ ] Verify with screen reader testing

**Difficulty:** Beginner

## Issue #34 — Add htmlFor associations on login form labels

**Labels:** frontend, accessibility

**Summary:**
Login form labels at `src/app/login/page.tsx:47,56` lack proper `htmlFor` associations with their input elements.

**Acceptance Criteria:**

- [ ] Add `htmlFor` attributes to all label elements
- [ ] Ensure `id` attributes on inputs match

**Difficulty:** Beginner

## Issue #35 — Improve keyboard navigation for card actions

**Labels:** frontend, accessibility

**Summary:**
Card action buttons in projects page (`src/app/projects/page.tsx:77-93`) and scans page (`src/app/scans/page.tsx:67-102`) have poor keyboard navigation support.

**Acceptance Criteria:**

- [ ] Ensure all card actions are reachable via Tab
- [ ] Add visible focus indicators
- [ ] Test full keyboard workflow

**Difficulty:** Intermediate

## Issue #36 — Add skip-to-content link

**Labels:** frontend, accessibility

**Summary:**
The layout (`src/app/layout.tsx`) has no skip-to-content link, forcing keyboard users to tab through navigation on every page.

**Acceptance Criteria:**

- [ ] Add a skip-to-content link as first focusable element in layout
- [ ] Link to `main` content area `id`

**Difficulty:** Beginner

## Issue #37 — Add focus management on new project form

**Labels:** frontend, accessibility

**Summary:**
The new project form (`src/app/projects/page.tsx:52-64`) lacks focus management after opening/closing, causing confusion for keyboard users.

**Acceptance Criteria:**

- [ ] Focus first input when form opens
- [ ] Return focus to trigger element when form closes

**Difficulty:** Beginner

## Issue #38 — Conduct color contrast audit

**Labels:** frontend, accessibility

**Summary:**
No systematic color contrast verification has been performed. The dark theme may have contrast issues on some elements.

**Acceptance Criteria:**

- [ ] Audit all text/background color combinations
- [ ] Fix any failing WCAG AA contrast ratios
- [ ] Document color palette with contrast ratios

**Difficulty:** Intermediate

---

# 6. Frontend: Code Quality & Dead Code

## Issue #39 — Remove suppressHydrationWarning

**Labels:** frontend, security

**Summary:**
`src/app/layout.tsx:29` uses `suppressHydrationWarning` on the `<html>` element. This suppresses ALL hydration warnings, potentially hiding real SSR/CSR mismatches.

**Acceptance Criteria:**

- [ ] Fix the root cause of the dark class mismatch
- [ ] Remove `suppressHydrationWarning`
- [ ] Verify no hydration warnings appear in development

**Difficulty:** Intermediate

## Issue #40 — Remove 10 unused Radix packages

**Labels:** frontend, refactor, chore

**Summary:**
10 of 15 installed Radix packages are imported nowhere in the source code:

- `@radix-ui/react-checkbox`, `react-dialog`, `react-dropdown-menu`, `react-label`, `react-popover`, `react-scroll-area`, `react-select`, `react-switch`, `react-tabs`, `react-tooltip`

These add `node_modules` bloat, CI install time, and security surface area. Notably `react-dialog` and `react-toast` are critically needed by the application.

**Acceptance Criteria:**

- [ ] Audit each package for actual usage in `src/`
- [ ] Remove unused packages from `package.json`
- [ ] Verify build and lint still pass

**Difficulty:** Beginner

## Issue #41 — Fix MetricCard unused variant prop

**Labels:** frontend, refactor

**Summary:**
`src/app/dashboard/page.tsx:132`: `MetricCard` accepts a `variant` prop but never uses it. Call sites pass `variant="critical"`, `variant="high"`, etc., which have no visual effect.

**Acceptance Criteria:**

- [ ] Either remove the `variant` prop
- [ ] Or implement themed borders/colors using the variant

**Difficulty:** Beginner

## Issue #42 — Unify error typing in catch blocks

**Labels:** frontend, refactor

**Summary:**
Only `login/page.tsx` uses `err: unknown`. Other pages use bare `catch (err)` which defaults to `any`. TypeScript strict mode should flag this.

**Acceptance Criteria:**

- [ ] Add `: unknown` to all catch clauses
- [ ] Use `err instanceof Error` checks before accessing `.message`

**Difficulty:** Beginner

## Issue #43 — Add .env.example file

**Labels:** frontend, configuration, devx

**Summary:**
No `.env.example` exists. Developers must discover `NEXT_PUBLIC_API_URL` by reading source code.

**Acceptance Criteria:**

- [ ] Create `.env.example` with `NEXT_PUBLIC_API_URL=http://localhost:8080`

**Difficulty:** Beginner

## Issue #44 — Add NEXT_PUBLIC_API_URL validation

**Labels:** frontend, configuration

**Summary:**
If `NEXT_PUBLIC_API_URL` is not set in production, it silently defaults to `localhost:8080`.

**Acceptance Criteria:**

- [ ] Add build-time or runtime validation
- [ ] Show clear error message if not configured

**Difficulty:** Beginner

## Issue #45 — Add Content Security Policy headers

**Labels:** frontend, security, high

**Summary:**
`next.config.ts` is empty. No CSP, X-Frame-Options, X-Content-Type-Options, or Referrer-Policy headers are configured.

**Acceptance Criteria:**

- [ ] Add `headers()` to `next.config.ts` with strict CSP
- [ ] Allow only same-origin scripts, styles, and fonts
- [ ] Add `X-Frame-Options: DENY`
- [ ] Add `X-Content-Type-Options: nosniff`
- [ ] Add `Referrer-Policy: strict-origin-when-cross-origin`

**Difficulty:** Intermediate

## Issue #46 — Configure next.config.ts with security headers

**Labels:** frontend, configuration, security, high

**Summary:**
Covered by Issue #45. The `next.config.ts` file needs to be configured with security headers including CSP, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy.

**Acceptance Criteria:**

- [ ] Reference Issue #45 for full implementation details
- [ ] Ensure `next.config.ts` is no longer empty after configuration

**Difficulty:** Intermediate

---

# 7. Frontend: Performance

## Issue #47 — Add findings filter debouncing

**Labels:** frontend, enhancement, performance

**Summary:**
`src/app/findings/page.tsx:38-39`: The filter runs on every keystroke, re-filtering the entire findings array. No debouncing is used. For large datasets, this causes UI jank.

**Acceptance Criteria:**

- [ ] Add a debounce hook (300ms delay)
- [ ] Apply debounced filter value to the filter operation

**Difficulty:** Beginner

## Issue #48 — Add React.memo to StatCard and sidebar navigation

**Labels:** frontend, performance

**Summary:**
StatCard and sidebar navigation components re-render on every parent state change with no memoization, causing unnecessary re-renders.

**Acceptance Criteria:**

- [ ] Wrap StatCard in `React.memo`
- [ ] Wrap sidebar navigation in `React.memo`
- [ ] Verify reduced re-renders with React DevTools

**Difficulty:** Beginner

## Issue #49 — Implement code splitting with next/dynamic

**Labels:** frontend, performance

**Summary:**
All components are eagerly loaded. Pages that contain heavy components (charts, tables, scan results) would benefit from dynamic imports via `next/dynamic`.

**Acceptance Criteria:**

- [ ] Identify heavy components suitable for dynamic import
- [ ] Replace static imports with `next/dynamic`
- [ ] Add loading fallback skeletons
- [ ] Verify reduced initial bundle size

**Difficulty:** Intermediate

## Issue #50 — Debounce findings filter input

**Labels:** frontend, performance

**Summary:**
Performance aspect of the findings filter. The filter re-runs on every keystroke with no debouncing. (See Issue #47 for full implementation details.)

**Acceptance Criteria:**

- [ ] Reference Issue #47 for implementation
- [ ] Verify no UI jank during rapid typing on large datasets

**Difficulty:** Beginner

## Issue #51 — Add pagination to list pages

**Labels:** frontend, performance

**Summary:**
Performance aspect of list page pagination. All list pages fetch and render all items at once, causing performance issues with large datasets. (See Issue #13 for full implementation details.)

**Acceptance Criteria:**

- [ ] Reference Issue #13 for implementation
- [ ] Verify performance improvement with large datasets

**Difficulty:** Intermediate

## Issue #52 — Add bundle analysis and optimization

**Labels:** frontend, performance

**Summary:**
No bundle analysis has been performed. Initial bundle size is unknown. Large dependencies like `lucide-react` may be importing unused icons.

**Acceptance Criteria:**

- [ ] Add `@next/bundle-analyzer`
- [ ] Run analysis on production build
- [ ] Optimize largest chunks (dynamic imports, tree-shaking)

**Difficulty:** Intermediate

---

# 8. Frontend: Developer Experience

## Issue #53 — Add pre-commit hooks

**Labels:** frontend, devx

**Summary:**
No pre-commit hooks are configured. Lint and type errors may be committed.

**Acceptance Criteria:**

- [ ] Install `husky` and `lint-staged`
- [ ] Configure to run `eslint` and `tsc --noEmit` on staged files

**Difficulty:** Intermediate

## Issue #54 — Add Storybook for UI component development

**Labels:** frontend, devx

**Summary:**
No component documentation or visual testing exists. Developers cannot browse or test UI components in isolation.

**Acceptance Criteria:**

- [ ] Install and configure Storybook
- [ ] Create stories for all UI components
- [ ] Integrate with CI for visual regression testing

**Difficulty:** Intermediate

## Issue #55 — Add API mocking for development

**Labels:** frontend, devx

**Summary:**
Frontend development requires a running backend. Adding `msw` (Mock Service Worker) would enable offline development without backend dependency.

**Acceptance Criteria:**

- [ ] Install `msw`
- [ ] Set up request handlers for all API endpoints
- [ ] Document how to run dev server with MSW

**Difficulty:** Intermediate
