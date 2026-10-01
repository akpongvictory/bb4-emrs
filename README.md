## Structure
- `client/` React + Vite + TypeScript + Tailwind frontend
- `server/` Node.js + Express + TypeScript backend with Prisma/PostgreSQL
- `docs/` architecture, decisions and daily progress files

## Database
    cd server
    npm run db:migrate     # apply migrations (creates tables)
    npm run db:generate    # generate the Prisma client (required after cloning)
Requires PostgreSQL and DATABASE_URL in server/.env.