# CaBE Arena Microservices Architecture

## Overview

CaBE Arena has been restructured from a monolithic application into a microservices architecture for better scalability, maintainability, and modularity.

## Services

### 1. Auth Service (Port: 4000)

- **Purpose**: User management, authentication, sessions, OAuth
- **Endpoints**: `/api/auth/*`
- **Dependencies**: PostgreSQL, Redis
- **Key Features**:
  - User registration and login
  - JWT token management
  - Password reset and email verification
  - OAuth integration (Google, GitHub)
  - Session management with Redis

### 2. Tasks Service (Port: 4001)

- **Purpose**: Gigs, tasks, Arena scoring
- **Endpoints**: `/api/tasks/*`
- **Dependencies**: PostgreSQL, Redis, Auth Service
- **Key Features**:
  - Task creation and management
  - Arena scoring algorithms
  - Gig marketplace functionality
  - Submission handling
  - Points and rewards system

### 3. AI Service (Port: 4002)

- **Purpose**: AI/ML models, plagiarism detection
- **Endpoints**: `/api/ai/*`
- **Dependencies**: PostgreSQL, Redis, Auth Service, Tasks Service
- **Key Features**:
  - Plagiarism detection
  - Code suggestions
  - Personalized learning paths
  - Model training pipelines
  - AI-powered analytics

## Infrastructure

### Docker Compose Services

- **db**: PostgreSQL 15 (Database)
- **redis**: Redis 7 (Caching & Sessions)
- **auth**: Auth Service
- **tasks**: Tasks Service
- **ai**: AI Service
- **nginx**: Reverse Proxy

### Nginx Reverse Proxy

- Routes `/api/auth/*` → Auth Service
- Routes `/api/tasks/*` → Tasks Service
- Routes `/api/ai/*` → AI Service
- Load balancing and error handling
- SSL termination (when configured)

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- PostgreSQL (for local development)

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DB_PASSWORD=your_secure_password
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT
JWT_SECRET=your_super_secret_jwt_key

# AI
OPENAI_API_KEY=your_openai_api_key

# Environment
NODE_ENV=development
```

### Running the Services

1. **Start all services**:

   ```bash
   docker-compose up -d
   ```

2. **Check service health**:

   ```bash
   curl http://localhost:4000/health  # Auth Service
   curl http://localhost:4001/health  # Tasks Service
   curl http://localhost:4002/health  # AI Service
   curl http://localhost/health       # Nginx Proxy
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f auth
   docker-compose logs -f tasks
   docker-compose logs -f ai
   ```

### Development

#### Individual Service Development

Each service can be developed independently:

```bash
# Auth Service
cd services/auth
npm install
npm run dev

# Tasks Service
cd services/tasks
npm install
npm run dev

# AI Service
cd services/ai
npm install
npm run dev
```

#### Testing

```bash
# Run all tests
npm test

# Run smoke tests
npm run test:smoke

# Run specific service tests
cd services/auth && npm test
cd services/tasks && npm test
cd services/ai && npm test
```

## API Documentation

### Auth Service Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-request` - Password reset request
- `POST /api/auth/reset` - Password reset
- `POST /api/auth/verify-email` - Email verification
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Tasks Service Endpoints

- `GET /api/tasks/` - List tasks
- `POST /api/tasks/` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/submit` - Submit task
- `GET /api/tasks/gigs` - List gigs
- `POST /api/tasks/gigs` - Create gig

### AI Service Endpoints

- `POST /api/ai/plagiarism` - Detect plagiarism
- `POST /api/ai/suggest` - Get code suggestions
- `GET /api/ai/learning-paths` - Get learning paths
- `POST /api/ai/train` - Train AI model
- `GET /api/ai/models` - List available models

## Monitoring & Health Checks

All services provide health check endpoints:

- `GET /health` - Returns service status
- Response format: `{ status: "healthy", service: "service-name", timestamp: "..." }`

## Security

### Authentication

- JWT tokens for service-to-service communication
- Rate limiting on all endpoints
- CORS configuration
- Helmet.js for security headers

### Network Security

- Services communicate over internal Docker network
- Nginx handles external traffic
- SSL/TLS termination at Nginx level

## Deployment

### Production Deployment

1. Build Docker images:

   ```bash
   docker-compose build
   ```

2. Deploy with environment variables:

   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. Run health checks:
   ```bash
   ./scripts/health-check.sh
   ```

### CI/CD Pipeline

The GitHub Actions workflow:

1. Runs tests on all services
2. Builds Docker images
3. Runs smoke tests
4. Performs security scans
5. Deploys to production (if on main branch)

## Troubleshooting

### Common Issues

1. **Service won't start**:
   - Check Docker logs: `docker-compose logs service-name`
   - Verify environment variables
   - Check port conflicts

2. **Database connection issues**:
   - Ensure PostgreSQL is running
   - Check database credentials
   - Verify network connectivity

3. **Service communication failures**:
   - Check service health endpoints
   - Verify JWT tokens
   - Check network configuration

### Debug Commands

```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs -f

# Access service shell
docker-compose exec auth sh
docker-compose exec tasks sh
docker-compose exec ai sh

# Check network connectivity
docker-compose exec auth ping tasks
docker-compose exec tasks ping ai
```

## Performance

### Optimization Tips

- Use Redis for caching frequently accessed data
- Implement connection pooling for database connections
- Use compression middleware
- Monitor service metrics and logs
- Implement circuit breakers for service communication

### Scaling

- Scale individual services independently
- Use load balancers for high availability
- Implement horizontal scaling with multiple instances
- Use database read replicas for read-heavy workloads
