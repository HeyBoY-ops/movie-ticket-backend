# Movie Ticket Booking System - Backend API

A robust and scalable RESTful API backend for a movie ticket booking platform. This service handles everything from user authentication to movie management, show scheduling, and ticket bookings with real-time seat availability tracking.

## 🚀 Overview

This backend powers a full-featured movie ticket booking application, providing secure endpoints for managing movies, theaters, shows, and bookings. Built with modern technologies, it ensures high performance, reliability, and maintainability.

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database ORM**: Prisma 6.x
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment Management**: dotenv

## ✨ Key Features

- **User Authentication & Authorization**: Secure signup/login with JWT tokens and role-based access control (Admin/User)
- **Movie Management**: CRUD operations for movies with advanced filtering, search, and pagination
- **Theater Management**: Manage theater locations and details
- **Show Scheduling**: Create and manage movie showtimes across different theaters
- **Booking System**: Real-time seat reservation with conflict detection
- **Pagination & Filtering**: Server-side pagination (10 items per page) with filtering by genre, language, and search queries
- **Error Handling**: Comprehensive error handling with meaningful error messages

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/      # Business logic and request handlers
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── movieController.js
│   │   ├── showController.js
│   │   └── theaterController.js
│   ├── middleware/       # Custom middleware functions
│   │   ├── authMiddleware.js
│   │   └── adminMiddleware.js
│   ├── routes/           # API route definitions
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── movieRoutes.js
│   │   ├── showRoutes.js
│   │   └── theaterRoutes.js
│   ├── utils/            # Utility functions
│   │   ├── generateToken.js
│   │   ├── seedData.js
│   │   └── seedEvent.js
│   └── server.js         # Application entry point
├── prisma/
│   ├── schema.prisma     # Database schema definition
│   └── migrations/       # Database migration files
├── package.json
└── README.md
```

## 🔧 Setup & Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB database (local or cloud instance like MongoDB Atlas)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd movie-ticket-app/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the backend root directory:
   ```env
   DATABASE_URL="mongodb://localhost:27017/movie-ticket-app"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=5050
   ```
   
   For MongoDB Atlas, use:
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/movie-ticket-app?retryWrites=true&w=majority"
   ```

4. **Database Setup**:
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   
   The server will start on `http://localhost:5050` (or the PORT specified in your `.env` file).

6. **Production Build**:
   ```bash
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5050/api
```

### Authentication Endpoints

#### `POST /api/auth/signup`
Register a new user account.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response**:
```json
{
  "message": "Signup successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### `POST /api/auth/login`
Authenticate user and receive JWT token.

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response**: Same as signup response.

#### `GET /api/auth/me`
Get current authenticated user details.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Movie Endpoints

#### `GET /api/movies`
Retrieve paginated list of movies with filtering and sorting.

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search movies by title
- `genre` (optional): Filter by genre
- `language` (optional): Filter by language
- `sort_by` (optional): Sort by `release_date`, `rating`, or `title` (default: `release_date`)

**Example**:
```
GET /api/movies?page=1&limit=10&genre=Action&language=English&sort_by=rating
```

**Response**:
```json
{
  "movies": [...],
  "total": 50,
  "page": 1,
  "totalPages": 5
}
```

#### `GET /api/movies/:id`
Get detailed information about a specific movie including associated shows.

**Response**: Movie object with shows array.

#### `POST /api/movies` (Admin Only)
Create a new movie.

**Headers**: `Authorization: Bearer <admin_token>`

**Request Body**:
```json
{
  "title": "Inception",
  "description": "A mind-bending thriller",
  "genre": ["Action", "Sci-Fi"],
  "language": "English",
  "duration": 148,
  "rating": 8.8,
  "poster_url": "https://example.com/poster.jpg",
  "trailer_url": "https://example.com/trailer.mp4",
  "release_date": "2010-07-16",
  "director": "Christopher Nolan",
  "cast": ["Leonardo DiCaprio", "Marion Cotillard"]
}
```

#### `PUT /api/movies/:id` (Admin Only)
Update an existing movie.

#### `DELETE /api/movies/:id` (Admin Only)
Delete a movie.

### Show Endpoints

#### `GET /api/shows`
List all available shows. Can be filtered by `movie_id` query parameter.

**Query Parameters**:
- `movie_id` (optional): Filter shows by movie ID

**Response**: Array of show objects with movie and theater details.

#### `GET /api/shows/:id`
Get details of a specific show.

#### `POST /api/shows` (Admin Only)
Create a new show schedule.

**Request Body**:
```json
{
  "movie_id": "movie_id",
  "theater_id": "theater_id",
  "screen_number": 1,
  "show_date": "2024-12-25T18:00:00Z",
  "show_time": "6:00 PM",
  "total_seats": 100,
  "price": 500
}
```

### Theater Endpoints

#### `GET /api/theaters`
Get all theaters.

#### `POST /api/theaters` (Admin Only)
Create a new theater.

**Request Body**:
```json
{
  "name": "PVR Cinemas",
  "city": "Mumbai",
  "address": "123 Main Street",
  "total_screens": 5
}
```

### Booking Endpoints

#### `POST /api/bookings` (Authenticated)
Create a new booking.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "show_id": "show_id",
  "seats": ["A1", "A2", "A3"],
  "payment_method": "mock",
  "total_amount": 1500
}
```

**Response**: Booking object with show, movie, and theater details.

#### `GET /api/bookings` (Authenticated)
Get all bookings for the authenticated user.

**Response**: Array of booking objects.

#### `GET /api/bookings/:id` (Authenticated)
Get details of a specific booking.

#### `POST /api/bookings/:id/cancel` (Authenticated)
Cancel a booking.

## 🔐 Authentication & Authorization

### JWT Token Usage
Include the JWT token in the Authorization header for protected routes:
```
Authorization: Bearer <your-jwt-token>
```

### Role-Based Access Control
- **User Role**: Can view movies, create bookings, and manage their own bookings
- **Admin Role**: Full access including creating/updating/deleting movies, theaters, and shows
- Admin email is automatically assigned: `a@gmail.com` (can be modified in `authController.js`)

## 🗄️ Database Schema

The application uses MongoDB with Prisma ORM. Key models include:

- **User**: User accounts with authentication
- **Movie**: Movie information and metadata
- **Theater**: Theater locations and details
- **Show**: Show schedules linking movies and theaters
- **Booking**: User bookings with seat information

See `prisma/schema.prisma` for complete schema definition.

## 🐛 Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message here"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

## 🧪 Testing

To test the API endpoints, you can use tools like:
- Postman
- cURL
- Thunder Client (VS Code extension)
- The frontend application

## 🚦 CORS Configuration

The server is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- Production frontend URLs (configured in `server.js`)

## 📝 Notes

- Pagination defaults to 10 items per page for optimal performance
- All filtering and sorting happens on the server side for better scalability
- Booked seats are stored as JSON arrays in the Show model
- The booking system includes conflict detection to prevent double-booking
- Mock payment method is used for development/testing purposes

## 🤝 Contributing

Contributions are welcome! Please ensure:
1. Code follows existing patterns and style
2. Error handling is comprehensive
3. API responses are consistent
4. Database migrations are included for schema changes

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

Built with ❤️ for movie enthusiasts everywhere.

---

For questions or issues, please open an issue on the repository or contact the development team.
