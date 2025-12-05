# MovieDay Backend Documentation

This document explains how to run, extend, and integrate with the MovieDay backend service.  
The API powers authentication, catalog management, show scheduling, and ticket bookings for the MovieDay web client.

---

## 1. Tech Stack

| Layer              | Details                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| Runtime            | Node.js 20+                                                             |
| Framework          | Express 5 (ESM)                                                         |
| ORM / DB Toolkit   | Prisma Client                                                           |
| Database           | MongoDB (connection string via `DATABASE_URL`)                          |
| Auth               | JWT (signed with HS256 + 7-day expiry)                                  |
| Other Libraries    | `bcryptjs`, `cors`, `dotenv`, `mysql2` (only needed during Prisma build) |

---

## 2. Repository Layout

```
backend/
├── prisma/
│   ├── migrations/              # Prisma migration history
│   └── schema.prisma            # Source of truth for MongoDB models
├── src/
│   ├── controllers/             # Route handlers (auth, movies, theaters, shows, bookings)
│   ├── middleware/              # JWT + admin guards
│   ├── routes/                  # Express routers mounted under /api/*
│   ├── utils/                   # Token helper + seed scripts
│   └── server.js                # App bootstrap, middleware, CORS, error handling
├── package.json
└── README.md (this file)
```

---

## 3. Environment Variables

Create `backend/.env` with the following keys:

```
PORT=5050                       # optional (defaults to 5050)
DATABASE_URL="mongodb+srv://..."# MongoDB connection string
JWT_SECRET="super-secret-key"   # HS256 signing secret for JWTs
```

> **Note:** CORS is pre-configured to permit `http://localhost:5173`, `https://movie-ticket-app-drab.vercel.app`, and `https://movie-ticket-backend-d25t.onrender.com`.  
> Update the `origin` array in `src/server.js` if additional clients need access.

---

## 4. Installation & Local Development

```bash
cd backend
npm install               # installs dependencies
npx prisma generate       # (optional, runs automatically on postinstall)

# start development server with hot reload
npm run dev
# or run once without nodemon
npm start
```

The API will listen on `http://localhost:5050` (or `PORT` value). Prisma automatically manages the MongoDB schema via the models defined in `schema.prisma`.

---

## 5. Database Schema (Prisma Models)

| Model   | Key Fields                                                                                                       | Relationships                                        |
| ------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `User`  | `id`, `name`, `email`, `password`, `role` (`user` or `admin`), `createdAt`                                       | `bookings` (1:N with `Booking`)                      |
| `Movie` | Metadata for movies/events: `title`, `description`, `genre[]`, `language`, `poster_url`, `director`, `cast` JSON | `shows` (1:N with `Show`)                            |
| `Theater` | `name`, `city`, `address`, `total_screens`                                                                     | `shows` (1:N with `Show`)                            |
| `Show`  | `movie_id`, `theater_id`, `screen_number`, `show_date`, `show_time`, `total_seats`, `price`, `booked_seats` JSON | Belongs to `Movie` & `Theater`; `bookings` (1:N)     |
| `Booking` | `user_id`, `show_id`, `seats` JSON, `total_amount`, `payment_method`, `booking_status`, `createdAt`            | Belongs to `User` & `Show`                           |

MongoDB ObjectIds are represented as Prisma `String` fields with `@db.ObjectId`.

---

## 6. Authentication & Authorization

- **JWT issuance** happens during `POST /api/auth/signup` and `POST /api/auth/login`.  
- Tokens embed `id`, `email`, and `role`. They expire after 7 days.
- **`authMiddleware`** validates the `Authorization: Bearer <token>` header and attaches `req.user`.
- **`adminMiddleware`** gates routes that mutate movies, theaters, or shows. Admin role is currently assigned automatically if a user signs up with `a@gmail.com`.

When calling protected endpoints from other services or integration tests, include the JWT:

```
Authorization: Bearer <token-from-login>
```

---

## 7. API Reference

### 7.1 Auth (`/api/auth`)

| Method & Route | Auth | Body | Description |
| -------------- | ---- | ---- | ----------- |
| `POST /signup` | No   | `{ name?, username?, email, password }` | Creates a user, returns `{ token, user }`. Role defaults to `user` unless email is `a@gmail.com`. |
| `POST /login`  | No   | `{ email, password }` | Returns `{ token, user }` if credentials match. |
| `GET /me`      | JWT  | —    | Returns `{ user }` for the authenticated account. |

### 7.2 Movies (`/api/movies`)

| Method & Route     | Auth           | Description |
| ------------------ | -------------- | ----------- |
| `GET /`            | Public         | Returns `{ movies }` ordered by newest first. Query params like `search`, `genre`, etc., are filtered on the frontend today. |
| `GET /:id`         | Public         | Returns a single movie including its shows. |
| `POST /`           | Admin JWT      | Creates a movie/event. `genre` and `cast` can be arrays or comma-separated strings. |
| `PUT /:id`         | Admin JWT      | Updates movie fields. Numeric and date fields are normalized server-side. |
| `DELETE /:id`      | Admin JWT      | Removes a movie. Responds with `{ message: "Movie deleted" }`. |

### 7.3 Theaters (`/api/theaters`)

| Method & Route | Auth      | Description |
| -------------- | --------- | ----------- |
| `GET /`        | Public    | List all theaters. |
| `POST /`       | Admin JWT | Create a theater `{ name, city, address, total_screens }`. |
| `PUT /:id`     | Admin JWT | Update a theater. |
| `DELETE /:id`  | Admin JWT | Delete a theater. |

### 7.4 Shows (`/api/shows`)

| Method & Route | Auth      | Description |
| -------------- | --------- | ----------- |
| `GET /`        | Public    | Optionally filter by `movie_id`. Includes related movie + theater. |
| `GET /:id`     | Public    | Fetch a single show. |
| `POST /`       | Admin JWT | Create a show. Server stores `booked_seats` as JSON. |
| `PUT /:id`     | Admin JWT | Update show details (date, price, seats, etc.). |
| `DELETE /:id`  | Admin JWT | Remove a show. |

### 7.5 Bookings (`/api/bookings`)

| Method & Route        | Auth | Description |
| --------------------- | ---- | ----------- |
| `POST /`              | JWT  | Body: `{ show_id, seats: string[], payment_method, total_amount? }`. Generates booking, extends `show.booked_seats`, calculates amount if not provided, and returns the created record. |
| `GET /`               | JWT  | Returns all bookings for the logged-in user, including linked movie & theater. |
| `GET /:id`            | JWT  | Fetch a single booking (used in confirmation view). |
| `POST /:id/cancel`    | JWT  | Marks booking status as `cancelled`. (Does not currently release seats.) |

Common error codes:  
- `400` – missing/invalid input.  
- `401` – missing or invalid token.  
- `403` – admin-only routes.  
- `404` – resource not found (Prisma `P2025`).  
- `409` – conflict (e.g., duplicate user).  
- `500` – unhandled server errors.

---

## 8. Seed Scripts

| Script | Purpose | Usage |
| ------ | ------- | ----- |
| `src/utils/seedData.js`  | Bulk-imports popular theaters and movies to bootstrap the catalog. | `node src/utils/seedData.js` |
| `src/utils/seedEvent.js` | Ensures the “Sunburn Arena Ft. Alan Walker” event movie, venue, and show exist. | `node src/utils/seedEvent.js` |

Both scripts are idempotent—they check for existing documents before creating new ones. Run them after `npm install` and before testing the frontend.

---

## 9. Middleware & Error Handling

- `express.json({ limit: "10mb" })` allows poster/trailer payloads.
- CORS allows credentials (cookies or Authorization headers).  
- A catch-all `404` returns `{ message: "Route not found" }`.  
- Global error handler logs the stack trace and returns `{ message: "Internal server error" }`.  
- Prisma clients are gracefully disconnected on `SIGINT` to avoid MongoDB connection leaks.

---

## 10. Deployment Notes

1. Provision MongoDB (Atlas or self-hosted) and update `DATABASE_URL`.
2. Set `PORT`, `JWT_SECRET`, and allowed CORS origins.
3. Run `npx prisma generate` during build.
4. Use `npm start` (not `dev`) in production containers.
5. Monitor logs for `PrismaClientInitializationError`—usually indicates invalid credentials or missing IP allow-list entries.

---

## 11. Extending the API

- **Adding new resources**: create a Prisma model, run `npx prisma migrate dev --name add_<resource>`, then build controller + route modules.
- **Role-based logic**: add new roles to the JWT payload and extend `adminMiddleware` or create additional guards.
- **Seat release on cancel**: modify `cancelBooking` to remove seats from `show.booked_seats` if you need to re-open inventory.
- **Search/filters**: move filtering logic from the frontend into `movieRoutes` by parsing query params and passing conditions to Prisma.

---

For questions or contributions, open an issue or PR with clear reproduction steps. Happy hacking! 🎬

