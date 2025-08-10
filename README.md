# Cabe Arena Monorepo

A modern full-stack monorepo built with React, Express, TypeScript, and Yarn workspaces.

## 🚀 Features

- **Frontend**: React 18 + Vite 5 + TypeScript + Tailwind CSS
- **Backend**: Express 5 + TypeScript + Pino Logger + Cluster Mode
- **Shared**: ESLint + TypeScript configurations
- **Development**: Yarn workspaces, Husky pre-commit hooks, Commitlint
- **Testing**: Vitest + Jest + Supertest
- **Package Management**: Yarn with pnpm lock (pessimistic mode)

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
├── .yarnrc.yml        # Yarn configuration
├── pnpm-workspace.yaml # PNPM workspace configuration
└── README.md          # This file
```

## 🛠️ Prerequisites

- Node.js 20+
- Yarn 4+

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd cabe-arena

# Install dependencies
yarn install
```

## 🚀 Development

### Start all services

```bash
# Start both backend and frontend concurrently
yarn dev

# Start individual services
yarn dev:backend
yarn dev:frontend

# Start backend in cluster mode
yarn dev:cluster
```

### Build

```bash
# Build all packages
yarn build

# Build specific packages
yarn build:backend
yarn build:frontend
```

### Testing

```bash
# Run all tests
yarn test

# Run tests for specific packages
yarn test:backend
yarn test:frontend
```

### Code Quality

```bash
# Lint all packages
yarn lint

# Fix linting issues
yarn lint:fix

# Format code
yarn format

# Check formatting
yarn format:check

# Type checking
yarn type-check
```

### Cleanup

```bash
# Clean all packages
yarn clean
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

- `yarn dev` - Start both backend and frontend concurrently
- `yarn dev:backend` - Start backend in development mode
- `yarn dev:frontend` - Start frontend in development mode
- `yarn dev:cluster` - Start backend in cluster mode
- `yarn build` - Build all packages
- `yarn build:backend` - Build backend only
- `yarn build:frontend` - Build frontend only
- `yarn test` - Run all tests
- `yarn test:backend` - Run backend tests
- `yarn test:frontend` - Run frontend tests
- `yarn lint` - Lint all packages
- `yarn lint:fix` - Fix linting issues
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check code formatting
- `yarn type-check` - Run TypeScript type checking
- `yarn clean` - Clean all packages

### Backend Scripts

- `yarn dev` - Start development server with tsx
- `yarn dev:cluster` - Start cluster mode
- `yarn build` - Build TypeScript
- `yarn start` - Start production server
- `yarn start:cluster` - Start production cluster mode
- `yarn test` - Run tests with Vitest
- `yarn test:watch` - Run tests in watch mode

### Frontend Scripts

- `yarn dev` - Start Vite dev server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn test` - Run tests with Vitest
- `yarn test:watch` - Run tests in watch mode

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
yarn build:backend

# Start production
yarn workspace @cabe-arena/backend start

# Or use cluster mode
yarn workspace @cabe-arena/backend start:cluster
```

### Frontend

```bash
# Build
yarn build:frontend

# Serve static files
yarn workspace @cabe-arena/frontend preview
```

## 📦 Package Management

This monorepo uses:

- **Yarn Workspaces**: For package management and linking
- **PNPM Lock**: For deterministic dependency resolution
- **Pessimistic Mode**: For more reliable dependency versions

## 🤝 Contributing

1. Follow conventional commit messages
2. Run tests before committing
3. Ensure code passes linting
4. Use TypeScript for all new code
5. Run `yarn type-check` before submitting PRs

## 📄 License

MIT
