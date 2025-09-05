# Manager Simulator

A football manager simulator game where two teams compete against each other using a game engine. Built with Next.js, Express, Prisma, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm 8+

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Skallerup/manager-simulator.git
   cd manager-simulator
   ```

2. **Install all dependencies**

   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   ```bash
   # Backend
   cp backend/env.example backend/.env
   # Edit backend/.env with your database URL and secrets

   # Frontend (optional)
   cp frontend/env.example frontend/.env.local
   ```

4. **Set up the database**

   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start both servers**
   ```bash
   npm run dev
   ```

## 📋 Available Scripts

### Development

- `npm run dev` - Start both backend and frontend in development mode
- `npm run dev:backend` - Start only the backend server
- `npm run dev:frontend` - Start only the frontend server

### Building

- `npm run build` - Build both backend and frontend for production
- `npm run build:backend` - Build only the backend
- `npm run build:frontend` - Build only the frontend

### Production

- `npm start` - Start both servers in production mode
- `npm run start:backend` - Start only the backend in production
- `npm run start:frontend` - Start only the frontend in production

### Testing

- `npm test` - Run all tests (backend + frontend)
- `npm run test:backend` - Run only backend tests
- `npm run test:frontend` - Run only frontend tests
- `npm run test:watch` - Run tests in watch mode for both
- `npm run test:coverage` - Run tests with coverage for both

### Database

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database (⚠️ destructive)

### Utilities

- `npm run install:all` - Install dependencies for all packages
- `npm run clean` - Clean all node_modules and build artifacts
- `npm run lint` - Lint both backend and frontend code

## 🏗️ Project Structure

```
manager-simulator/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── auth/           # Authentication logic
│   │   ├── prisma/         # Database client
│   │   └── server.ts       # Main server file
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── tests/              # Backend tests
├── frontend/               # Next.js React application
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   └── src/__tests__/     # Frontend tests
└── package.json           # Root package.json with scripts
```

## 🔧 Technology Stack

### Backend

- **Express.js** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Argon2** - Password hashing
- **JWT** - Authentication tokens
- **Jest** - Testing framework

### Frontend

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **Jest** - Testing framework
- **React Testing Library** - Component testing

## 🔐 Authentication

The app includes a complete authentication system with:

- User registration and login
- JWT access tokens and refresh tokens
- Secure cookie-based session management
- Password hashing with Argon2
- Protected routes and API endpoints

## 🧪 Testing

Both backend and frontend have comprehensive test suites:

- **Backend**: 11 tests covering authentication endpoints
- **Frontend**: 14 tests covering components and user interactions
- **Total**: 25 tests with 100% pass rate

Run tests with:

```bash
npm test
```

## 🌐 API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user info

### Health

- `GET /health` - Health check
- `GET /api/hello` - Welcome message

## 🚀 Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Set production environment variables**

   - Configure database URL
   - Set secure JWT secrets
   - Configure CORS origins

3. **Start the application**
   ```bash
   npm start
   ```

## 📝 Development Notes

- The backend runs on port 5000 by default
- The frontend runs on port 3001 by default
- Both servers support hot reloading in development
- Database migrations are handled by Prisma
- All authentication is handled server-side with secure cookies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

