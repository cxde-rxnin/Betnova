# Betnovo

Betnovo is a scalable, feature-driven Next.js platform designed for robustness, security, and high performance.

## Architecture

This project strictly adheres to a **feature-driven** architecture. Instead of organizing by file type (e.g., placing all hooks together, all components together), code is grouped by domain area inside the `features/` directory where appropriate.

### Folder Structure
- **`app/`**: Next.js App Router mapping. Contains route groups (e.g. `(auth)`, `(app)`) and Next.js route handlers `api/`.
- **`features/`**: Encapsulated business domains (`auth`, `wallet`, `betting`, etc.). Each feature should export its public API via an `index.ts` barrel file.
- **`components/`**: Global reusable UI components (e.g., shadcn components in `components/ui`).
- **`lib/`**: Global utilities, configuration, and shared tools.
  - `lib/constants/`: Centralized application constants (routes, roles, configuration).
  - `lib/db/`: Database connection logic.
  - `lib/errors.ts`: Centralized custom error classes.
  - `lib/logger.ts`: Application logger wrapper.
  - `lib/utils/api-response.ts`: Standardized API response wrappers.
- **`types/`**: Global TypeScript definitions.
- **`actions/`**: Next.js Server Actions grouped by domain.

## Conventions

### Logging
Always use the centralized logger from `lib/logger.ts` instead of `console.log`.
```ts
import { logger } from "@/lib/logger";
logger.info("User logged in", { userId });
```

### Error Handling
Throw structured errors from `lib/errors.ts` for consistent error catching.
```ts
import { NotFoundError } from "@/lib/errors";
if (!user) throw new NotFoundError("User not found");
```

### API Responses
Return standardized responses from `lib/utils/api-response.ts`.
```ts
import { successResponse, badRequest } from "@/lib/utils/api-response";
return successResponse({ data: user });
```

## Setup & Development

1. Ensure environment variables are configured. Copy `.env.example` to `.env`.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the development server.

## Health Check
You can verify the API and Database connectivity by visiting `/api/health`.
