# 🏆 CaBE Arena - Skill-Based Learning Platform

> **Prove Skill. Earn Points. Unlock Possibilities.**

[![CI/CD Pipeline](https://github.com/your-username/cabe-arena/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/your-username/cabe-arena/actions/workflows/ci-cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)

## 🎯 Overview

CaBE Arena is a comprehensive skill-based learning platform that gamifies skill development through task completion, proof submission, and point-based progression. The platform supports four core skill areas and provides a complete ecosystem for skill validation and recognition.

## ✨ Features

### 🎮 Core Functionality

- **Task Generation & Rotation**: Automated task creation with 14-day rotation cycles
- **Proof Submission**: Multiple proof types (screenshots, PDFs, links, text descriptions)
- **Point System**: Service Points Formula v5 with skill-specific weightings
- **Rank Progression**: Bronze → Silver → Gold → Platinum with feature unlocks
- **Leaderboards**: Real-time skill-based leaderboards
- **Achievement System**: Badges and milestones for skill development

### 🛠️ Supported Skills

1. **AI / Machine Learning** - ML models, data analysis, AI applications
2. **Cloud Computing & DevOps** - Infrastructure, CI/CD, cloud services
3. **Data Science & Analytics** - Statistical analysis, data visualization, insights
4. **Full-Stack Software Development** - Frontend, backend, database development

### 🔧 Technical Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript, Supabase (PostgreSQL)
- **Testing**: Cypress (E2E), Vitest (Unit), Jest (Integration)
- **Deployment**: Docker, Kubernetes, GitHub Actions CI/CD
- **Monitoring**: Prometheus, Grafana, Alerting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 15+
- Docker (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/cabe-arena.git
   cd cabe-arena
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies
   pnpm install

   # Install backend dependencies
   cd backend
   pnpm install

   # Install frontend dependencies
   cd ../frontend
   pnpm install
   ```

3. **Environment Setup**

   ```bash
   # Copy environment files
   cp backend/env.example backend/.env
   cp frontend/env.example frontend/.env

   # Configure your environment variables
   # See backend/env.example for required variables
   ```

4. **Database Setup**

   ```bash
   # Run database migrations
   cd backend
   pnpm run db:migrate

   # Seed initial data
   pnpm run db:seed
   ```

5. **Start Development Servers**

   ```bash
   # Start backend (from backend directory)
   pnpm run dev

   # Start frontend (from frontend directory)
   pnpm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api/docs

## 📁 Project Structure

```
cabe-arena/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── services/       # Business logic services
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── lib/           # Utility libraries
│   │   └── utils/         # Helper utilities
│   ├── db/                # Database migrations & scripts
│   └── tests/             # Backend tests
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Frontend utilities
│   └── tests/             # Frontend tests
├── src/modules/           # Feature modules
│   ├── achievements/      # Achievement system
│   ├── analytics/         # Analytics & reporting
│   ├── cabot/            # AI assistant
│   ├── dashboard/        # User dashboard
│   ├── feed/             # Task feed
│   ├── learning/         # Learning management
│   ├── moderation/       # Content moderation
│   ├── opportunities/    # Job opportunities
│   ├── penalty/          # Point decay system
│   └── skills/           # Skill management
├── cypress/              # E2E tests
├── k8s/                  # Kubernetes manifests
├── monitoring/           # Monitoring configuration
├── nginx/                # Nginx configuration
└── scripts/              # Deployment scripts
```

## 🧪 Testing

### Run All Tests

```bash
# Backend tests
cd backend
pnpm test

# Frontend tests
cd frontend
pnpm test

# E2E tests
pnpm run test:e2e

# All tests
pnpm run test:all
```

### Test Coverage

```bash
# Backend coverage
cd backend
pnpm run test:coverage

# Frontend coverage
cd frontend
pnpm run test:coverage
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n cabe-arena
```

### Manual Deployment

```bash
# Build production assets
pnpm run build:prod

# Start production server
pnpm run start:prod
```

## 📊 API Documentation

### Core Endpoints

#### Tasks

- `GET /api/tasks` - Get available tasks
- `POST /api/tasks/submit` - Submit task proof
- `GET /api/tasks/:id` - Get specific task details

#### Points & Ranks

- `GET /api/points/calculate` - Calculate points for submission
- `GET /api/ranks/current` - Get current user rank
- `GET /api/ranks/leaderboard` - Get leaderboard

#### Skills

- `GET /api/skills` - Get available skills
- `GET /api/skills/:skill/tasks` - Get tasks for specific skill

#### Achievements

- `GET /api/achievements` - Get user achievements
- `POST /api/achievements/unlock` - Unlock achievement

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cabe_arena

# Authentication
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# External Services
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key

# AI Services
OPENAI_API_KEY=your-openai-key

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_APP_NAME=CaBE Arena
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   pnpm run test:all
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure all tests pass before submitting

## 📈 Performance

### Benchmarks

- **API Response Time**: <200ms average
- **Frontend Load Time**: <2s initial load
- **Database Queries**: <100ms average
- **Concurrent Users**: 1000+ supported

### Monitoring

- Real-time performance metrics
- Error tracking and alerting
- User behavior analytics
- System health monitoring

## 🔒 Security

### Security Features

- JWT-based authentication
- CSRF protection
- Rate limiting
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- File upload security

### Security Best Practices

- Regular dependency updates
- Security audits
- Penetration testing
- Compliance monitoring

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- 📖 [Documentation](https://docs.cabe-arena.com)
- 💬 [Discord Community](https://discord.gg/cabe-arena)
- 🐛 [Issue Tracker](https://github.com/your-username/cabe-arena/issues)
- 📧 [Email Support](mailto:support@cabe-arena.com)

### Community

- 🌟 Star the repository
- 🔄 Share with others
- 💡 Suggest new features
- 🐛 Report bugs

## 🏆 Acknowledgments

- Built with ❤️ by the CaBE Arena team
- Powered by modern web technologies
- Inspired by gamification best practices
- Supported by the open-source community

---

**🎉 Ready to prove your skills? Join CaBE Arena today!**
