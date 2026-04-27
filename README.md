# UOme

Next.js + TypeScript modular monolith for a collaborative finance tracker.

## Stack

- Next.js (App Router)
- TypeScript
- MongoDB
- Mongoose + Typegoose
- JWT (HTTP-only cookie)
- Tailwind CSS
- MSC (Model-Service-Controller) backend architecture

## Project Architecture

### Backend (modular monolith)

- `src/backend/common`: shared backend building blocks (`env`, `db`, `metadata.entity`, auth, errors, validation)
- `src/backend/modules/*`: feature modules in MSC form
- `src/backend/container.ts`: dependency wiring and controller exposure
- API entrypoints in `src/app/api/**/route.ts`

### Frontend (shared + modules)

- `src/frontend/shared`: reusable UI components and shared client utils
- `src/frontend/modules/*`: page-focused feature modules
- App routes in `src/app/**/page.tsx` render module pages

## Auth Flow

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- JWT stored in HTTP-only cookie (`JWT_COOKIE_NAME`)
- `src/middleware.ts` guards `/dashboard`

## Start

1. Copy `.env.example` to `.env` and fill values.
2. Start MongoDB:
   - `docker compose up -d`
3. Run app:
   - `npm install`
   - `npm run dev`

## Next Steps

- Add tenant/workspace model for true multi-collab mode.
- Add refresh tokens and token rotation.
- Add tests (unit + integration).
