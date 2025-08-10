# CaBE Arena - Architecture Documentation

## 🏗️ System Overview

CaBE Arena is a full-stack competitive coding and learning platform built with modern web technologies. The system is designed for scalability, security, and maintainability with enterprise-grade architecture patterns.

### Technology Stack

**Frontend:**

- React 18 with TypeScript
- Vite for build tooling and optimization
- Tailwind CSS for styling
- Recharts for data visualization
- React Router for navigation
- PWA capabilities with service workers
- Framer Motion for animations
- React Hook Form with Zod validation

**Backend:**

- Node.js with Express 5
- TypeScript for type safety
- Supabase for database and auth
- OpenAI for AI-powered features
- Redis for caching (optional)
- Prometheus for metrics
- Socket.io for real-time features

**Infrastructure:**

- Docker for containerization
- GitHub Actions for CI/CD
- Prometheus + Grafana for monitoring
- Sentry for error tracking
- OWASP ZAP for security scanning

## 🏛️ Architecture Patterns

### 1. Modular Architecture

The codebase follows a modular architecture with clear separation of concerns:

```
src/
├── modules/           # Feature modules
│   ├── analytics/     # Analytics features
│   ├── cabot/         # AI assistant
│   ├── dashboard/     # User dashboard
│   ├── feed/          # Task feed
│   ├── learning/      # Learning content
│   ├── moderation/    # Content moderation
│   ├── penalty/       # Penalty system
│   ├── skills/        # Skill tracking
│   └── opportunities/ # Job opportunities
├── components/        # Shared components
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
└── types/            # TypeScript definitions
```

### 2. API-First Design

All frontend features communicate through well-defined REST APIs:

- `/api/arena/*` - Core arena functionality
- `/api/admin/*` - Admin operations
- `/api/analytics/*` - Analytics data
- `/api/cabot/*` - AI assistant endpoints

### 3. Security-First Approach

- Input validation with Zod schemas
- Rate limiting and DDoS protection
- CORS configuration
- Security headers with Helmet
- JWT authentication
- Role-based access control (RBAC)

## 🔐 Security Architecture

### Authentication & Authorization

```typescript
// JWT-based authentication
interface User {
  id: string;
  email: string;
  rank: string;
  permissions: string[];
}

// Role-based access control
const RANK_TIERS = {
  bronze: 0,
  silver: 100,
  gold: 500,
  platinum: 1000,
  diamond: 5000,
} as const;
```

### Security Middleware Stack

1. **Helmet** - Security headers
2. **CORS** - Cross-origin resource sharing
3. **Rate Limiting** - Request throttling
4. **Input Validation** - Zod schema validation
5. **XSS Protection** - Cross-site scripting prevention
6. **SQL Injection Protection** - Query sanitization
7. **Parameter Pollution Protection** - HPP prevention

### Data Protection

- All sensitive data encrypted at rest
- HTTPS enforced in production
- API keys stored in environment variables
- Database connections use SSL/TLS
- Regular security audits

## 📊 Data Architecture

### Database Schema

```sql
-- Core tables
users (id, email, name, rank, points, created_at)
tasks (id, title, description, skill_area, difficulty, points, is_active)
submissions (id, user_id, task_id, code, score, status, submitted_at)
skills (id, user_id, skill_name, level, xp, updated_at)

-- Analytics tables
user_analytics (id, user_id, date, submissions, points, streak)
task_analytics (id, task_id, submissions, avg_score, completion_rate)

-- Audit tables
audit_logs (id, user_id, action, details, timestamp)
deviation_analysis (id, submission_id, original_score, ai_score, deviation)
```

### Data Flow

1. **User Actions** → API Endpoints → Business Logic → Database
2. **AI Processing** → OpenAI API → Score Calculation → Database
3. **Analytics** → Data Aggregation → Metrics Collection → Dashboard

## 🤖 AI Integration

### AI Services Architecture

```typescript
// AI Service Interface
interface AIService {
  scoreSubmission(task: Task, code: string): Promise<ScoreResult>;
  generateFeedback(submission: Submission): Promise<FeedbackResult>;
  validateCode(code: string): Promise<ValidationResult>;
  recommendTasks(user: User): Promise<Task[]>;
}
```

### AI Pipeline

1. **Code Submission** → Preprocessing → AI Analysis → Score Calculation
2. **Feedback Generation** → Context Analysis → AI Response → User Display
3. **Task Recommendations** → User Profile → AI Matching → Personalized List

## 🚀 Performance Architecture

### Frontend Optimization

- **Code Splitting** - Route-based and feature-based
- **Lazy Loading** - Components loaded on demand
- **Bundle Optimization** - Tree shaking and minification
- **Caching Strategy** - Service worker for offline support
- **Image Optimization** - WebP format and lazy loading
- **Virtual Scrolling** - For large lists and tables

### Backend Optimization

- **Database Indexing** - Optimized queries
- **Connection Pooling** - Efficient database connections
- **Caching Layer** - Redis for frequently accessed data
- **Load Balancing** - Horizontal scaling support
- **CDN Integration** - Static asset delivery

### Monitoring & Metrics

```typescript
// Prometheus metrics
const metrics = {
  httpRequestDuration: Histogram,
  apiRequestTotal: Counter,
  dbQueryDuration: Histogram,
  aiRequestDuration: Histogram,
  errorTotal: Counter,
  activeUsersGauge: Gauge,
};
```

## 🔄 CI/CD Pipeline

### Pipeline Stages

1. **Security Scan** - Dependency audit and vulnerability scanning
2. **Lint & Type Check** - Code quality and type safety
3. **Unit Tests** - Component and function testing
4. **E2E Tests** - Full application testing
5. **Build & Analyze** - Bundle size analysis
6. **Performance Testing** - Lighthouse CI
7. **Accessibility Testing** - Axe-core integration
8. **Deployment** - Staging and production deployment

### Deployment Strategy

- **Blue-Green Deployment** - Zero-downtime updates
- **Feature Flags** - Gradual feature rollouts
- **Rollback Strategy** - Quick recovery from issues
- **Health Checks** - Automated monitoring

## 📈 Scalability Design

### Horizontal Scaling

- **Stateless Backend** - No session storage
- **Database Sharding** - Partitioned data storage
- **Load Balancing** - Traffic distribution
- **Microservices Ready** - Modular service architecture

### Vertical Scaling

- **Resource Optimization** - Memory and CPU efficiency
- **Database Optimization** - Query performance tuning
- **Caching Strategy** - Multi-layer caching
- **CDN Integration** - Global content delivery

## 🔧 Development Workflow

### Local Development

```bash
# Frontend development
cd frontend
pnpm dev

# Backend development
cd backend
pnpm dev

# Database setup
pnpm db:migrate
pnpm db:seed
```

### Testing Strategy

- **Unit Tests** - Vitest for fast feedback
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Cypress for user workflows
- **Performance Tests** - Lighthouse CI
- **Security Tests** - Automated vulnerability scanning
- **Accessibility Tests** - Axe-core integration

### Code Quality

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type safety
- **Husky** - Git hooks
- **Commitlint** - Commit message standards

## 🛠️ Configuration Management

### Environment Variables

```bash
# Backend (.env)
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://...
OPENAI_API_KEY=sk-...
JWT_SECRET=...

# Frontend (.env)
VITE_API_BASE_URL=https://api.cabe-arena.com
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_ANALYTICS=true
```

### Feature Flags

```typescript
const features = {
  aiScoring: process.env.ENABLE_AI_SCORING === 'true',
  auditLogging: process.env.ENABLE_AUDIT_LOGGING === 'true',
  slackNotifications: process.env.ENABLE_SLACK_NOTIFICATIONS === 'true',
};
```

## 🔮 Future Architecture

### Planned Enhancements

1. **Microservices Migration** - Service decomposition
2. **Event-Driven Architecture** - Message queues and event sourcing
3. **GraphQL API** - Flexible data fetching
4. **Real-time Features** - WebSocket integration
5. **Mobile App** - React Native implementation
6. **Machine Learning Pipeline** - Custom ML models

### Technology Evolution

- **Database** - PostgreSQL → Distributed database
- **Caching** - Redis → Multi-region caching
- **Monitoring** - Prometheus → Distributed tracing
- **Deployment** - Docker → Kubernetes orchestration

## 📚 Additional Resources

- [API Documentation](./API.md)
- [Security Guidelines](./SECURITY.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
