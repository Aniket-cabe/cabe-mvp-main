# CaBE Arena MVP

A modern full-stack platform for skill validation and gamified learning built with React, Express, TypeScript, and npm workspaces.

## 🚀 Features

- **Frontend**: React 18 + Vite 5 + TypeScript + Tailwind CSS
- **Backend**: Express 5 + TypeScript + Pino Logger + Cluster Mode
- **Shared**: ESLint + TypeScript configurations
- **Development**: npm workspaces, Husky pre-commit hooks, Commitlint
- **Testing**: Vitest + Jest + Supertest
- **Package Management**: npm workspaces

## 📁 Project Structure

```
cabe-arena/
├── frontend/          # React 18 + Vite 5 + TypeScript + Tailwind
├── backend/           # Express 5 + TypeScript + Pino + Cluster
├── shared/            # Shared configurations
│   ├── eslint-config/ # ESLint configurations
│   └── ts-config-base/ # TypeScript base config
├── .husky/            # Git hooks
├── package.json       # Root workspace configuration
├── package-lock.json  # npm lock file
├── pnpm-workspace.yaml # Workspace configuration (legacy)
└── README.md          # This file
```

## 🛠️ Prerequisites

- Node.js 20+
- npm 10+

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd cabe-arena

# Install dependencies
npm install

# Set up environment variables
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
# Edit the .env files with your actual API keys and secrets
```

## 🚀 Development

### Start all services

```bash
# Start both backend and frontend concurrently
npm run dev

# Start individual services
npm run dev:backend
npm run dev:frontend

# Start backend in cluster mode
npm run dev:cluster
```

### Build

```bash
# Build all packages
npm run build

# Build specific packages
npm run build:backend
npm run build:frontend
```

### Testing

```bash
# Run all tests
npm run test

# Run tests for specific packages
npm run test:backend
npm run test:frontend
```

### Code Quality

```bash
# Lint all packages
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type checking
npm run type-check
```

### Cleanup

```bash
# Clean all packages
npm run clean
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in the respective packages:

**Backend** (`backend/.env`):

```env
NODE_ENV=development
PORT=3001
LOG_LEVEL=info
```

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:3001
```

## 📝 Scripts Reference

### Root Scripts

- `npm run dev` - Start both backend and frontend concurrently
- `npm run dev:backend` - Start backend in development mode
- `npm run dev:frontend` - Start frontend in development mode
- `npm run dev:cluster` - Start backend in cluster mode
- `npm run build` - Build all packages
- `npm run build:backend` - Build backend only
- `npm run build:frontend` - Build frontend only
- `npm run test` - Run all tests
- `npm run test:backend` - Run backend tests
- `npm run test:frontend` - Run frontend tests
- `npm run lint` - Lint all packages
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean all packages

### Backend Scripts

- `npm run dev` - Start development server with tsx
- `npm run dev:cluster` - Start cluster mode
- `npm run build` - Build TypeScript
- `npm run start` - Start production server
- `npm run start:cluster` - Start production cluster mode
- `npm run test` - Run tests with Vitest
- `npm run test:watch` - Run tests in watch mode

### Frontend Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests with Vitest
- `npm run test:watch` - Run tests in watch mode

## 🏗️ Architecture

### Backend

- **Express 5**: Modern web framework
- **Pino**: High-performance logger
- **Cluster Mode**: Multi-process support for production
- **TypeScript**: Type safety and better DX
- **Vitest**: Fast unit testing
- **Supertest**: API testing

### Frontend

- **React 18**: Latest React features
- **Vite 5**: Fast build tool and dev server
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint**: Code quality

### Shared

- **ESLint Configs**: Consistent code style across packages
- **TypeScript Configs**: Shared TypeScript settings

## 🔒 Git Hooks

The project uses Husky for Git hooks:

- **Pre-commit**: Runs lint-staged to check and format code
- **Commitlint**: Ensures conventional commit messages

## 📊 Testing

- **Backend**: Vitest + Supertest for API testing
- **Frontend**: Vitest for component testing
- **Coverage**: Built-in coverage reporting

## 🚀 Deployment

### Backend

```bash
# Build
npm run build:backend

# Start production
npm run start --workspace=backend

# Or use cluster mode
npm run start:cluster --workspace=backend
```

### Frontend

```bash
# Build
npm run build:frontend

# Serve static files
npm run preview --workspace=frontend
```

## 📦 Package Management

This monorepo uses:

- **npm Workspaces**: For package management and linking
- **npm Lock**: For deterministic dependency resolution
- **Workspace Management**: For reliable dependency versions

## 🤝 Contributing

1. Follow conventional commit messages
2. Run tests before committing
3. Ensure code passes linting
4. Use TypeScript for all new code
5. Run `npm run type-check` before submitting PRs

## 📄 License

MIT
