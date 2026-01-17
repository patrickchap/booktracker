# BookTracker

A full-stack book tracking application similar to Goodreads, built with Angular 19 and ASP.NET Core 9.

## Features

- **Google OAuth Authentication**: Secure sign-in with Google accounts
- **Book Search**: Search millions of books via Google Books API
- **Personal Library**: Track books you want to read, are currently reading, or have finished
- **Reading Progress**: Update status, add ratings, and write notes for your books
- **Redis Caching**: Fast search results with intelligent caching
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

### Backend
- ASP.NET Core 9 Web API
- Entity Framework Core 9 with PostgreSQL
- Redis for distributed caching
- JWT authentication
- Clean Architecture pattern

### Frontend
- Angular 19 with standalone components
- Tailwind CSS for styling
- Angular Signals for state management
- Lazy-loaded routes

### Infrastructure
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7

## Project Structure

```
/
├── docker-compose.yml
├── .env.example
├── README.md
│
├── backend/
│   ├── BookTracker.sln
│   ├── Dockerfile
│   └── src/
│       ├── BookTracker.Api/           # Web API layer
│       ├── BookTracker.Application/   # Business logic
│       ├── BookTracker.Domain/        # Entities & enums
│       └── BookTracker.Infrastructure/# Data access & services
│
└── frontend/
    ├── Dockerfile
    ├── angular.json
    └── src/
        └── app/
            ├── core/                  # Services, guards, interceptors
            ├── features/              # Feature components
            └── shared/                # Shared components
```

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/products/docker-desktop) (optional)
- Google Cloud Console account for OAuth credentials

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd booktracker
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- `GOOGLE_BOOKS_API_KEY`: Get from [Google Cloud Console](https://console.cloud.google.com/)
- `GOOGLE_CLIENT_ID`: OAuth 2.0 Client ID from Google Cloud Console
- `GOOGLE_CLIENT_SECRET`: OAuth 2.0 Client Secret
- `JWT_SECRET`: A secure random string (minimum 32 characters)

### 3. Start Infrastructure (Docker)

```bash
docker-compose up -d postgres redis
```

### 4. Run the Backend

```bash
cd backend
dotnet restore
dotnet run --project src/BookTracker.Api
```

The API will be available at `http://localhost:5000`

### 5. Run the Frontend

```bash
cd frontend
npm install
npm start
```

The app will be available at `http://localhost:4200`

## API Endpoints

### Authentication
- `POST /api/auth/google` - Authenticate with Google token
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Search
- `GET /api/search?q={query}` - Search books

### Books
- `GET /api/books/{googleBooksId}` - Get book details

### Library
- `GET /api/library` - Get user's library
- `GET /api/library/{id}` - Get specific book
- `POST /api/library` - Add book to library
- `PUT /api/library/{id}` - Update book
- `DELETE /api/library/{id}` - Remove book

## Development

### Running with Docker Compose (Full Stack)

```bash
docker-compose up
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- API on port 5000
- Frontend on port 4200

### Running Tests

Backend:
```bash
cd backend
dotnet test
```

Frontend:
```bash
cd frontend
npm test
```

## Configuration

### Backend (appsettings.json)

```json
{
  "ConnectionStrings": {
    "PostgreSQL": "Host=localhost;Database=booktracker;Username=postgres;Password=...",
    "Redis": "localhost:6379"
  },
  "GoogleBooks": {
    "ApiKey": "your-api-key",
    "BaseUrl": "https://www.googleapis.com/books/v1"
  },
  "Authentication": {
    "Google": {
      "ClientId": "your-client-id",
      "ClientSecret": "your-client-secret"
    },
    "Jwt": {
      "Secret": "your-jwt-secret",
      "Issuer": "BookTracker",
      "Audience": "BookTracker",
      "ExpirationMinutes": 60
    }
  }
}
```

### Frontend (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  googleClientId: 'your-client-id.apps.googleusercontent.com'
};
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google Books API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Add authorized JavaScript origins: `http://localhost:4200`
6. Add authorized redirect URIs: `http://localhost:4200`
7. Copy the Client ID to both backend and frontend configs

## License

MIT
