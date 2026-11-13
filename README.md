# RxConnect

RxConnect is a prescription-management platform connecting doctors, patients, and pharmacies.

## Project structure

- `frontend` — Next.js, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form
- `backend` — NestJS, TypeScript, Prisma, PostgreSQL/Supabase

## Local setup

1. Install each project separately with `cd frontend && npm install`, then `cd ../backend && npm install`.
2. Copy `frontend/.env.example` to `frontend/.env.local` and `backend/.env.example` to `backend/.env`.
3. Run `npm run dev` inside `frontend` and `npm run start:dev` inside `backend`, using separate terminals.

The frontend runs at `http://localhost:3000`. The API runs at `http://localhost:3001/api`.
