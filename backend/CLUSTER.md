# Cluster Mode Setup

This backend supports running in cluster mode for production deployments, utilizing all available CPU cores for maximum performance.

## How it Works

The cluster setup:

- **Master Process**: Manages worker processes and handles graceful shutdown
- **Worker Processes**: Run HTTP servers on the same port (load balanced by OS)
- **CPU Utilization**: Uses all available CPU cores except one (reserved for OS)

## File Structure

```
backend/src/
├── cluster.ts          # Cluster entry point
├── index.ts            # Worker entry point (HTTP server)
├── app.ts              # Express application
├── utils/
│   └── logger.ts       # Pino logger configuration (TypeScript)
└── utils/
    └── logger.js       # Pino logger configuration (JavaScript)
```

## Logger Configuration

The logger (`utils/logger.ts`) provides:

- **Default Level**: 'info'
- **Development Transport**: Uses 'pino-pretty' with colorized output
- **Production**: Standard JSON logging
- **Time Formatting**: 'yyyy-mm-dd HH:MM:ss' in development
- **Environment Detection**: Automatic based on NODE_ENV

## Usage

### Development

```bash
# Start in cluster mode
yarn dev:cluster

# Or from root
yarn dev:cluster
```

### Production

```bash
# Build first
yarn build

# Start in cluster mode
yarn start:cluster
```

## Features

### ✅ CPU Optimization

- Automatically detects available CPU cores
- Reserves one core for OS operations
- Scales to utilize all remaining cores

### ✅ Process Management

- Master process forks worker processes
- Automatic worker restart on crashes
- Graceful shutdown handling

### ✅ Logging

- Each process logs with its PID
- Master process logs worker lifecycle events
- Structured logging with Pino
- Colorized output in development
- JSON format in production

### ✅ Graceful Shutdown

- SIGTERM: Graceful disconnect of all workers
- SIGINT: Immediate shutdown (development)
- Individual worker graceful shutdown

### ✅ Load Balancing

- OS-level load balancing across workers
- All workers listen on the same port
- Automatic request distribution

## Monitoring

### Health Check

```bash
curl http://localhost:3001/health
```

Response includes worker PID:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "worker": 12345
}
```

### API Status

```bash
curl http://localhost:3001/api/status
```

Response includes worker information:

```json
{
  "message": "Cabe Arena API is running",
  "version": "1.0.0",
  "environment": "production",
  "worker": 12345
}
```

## Logs

The cluster provides detailed logging:

### Development Mode (Colorized)

```
[INFO] Master process 1234 is running
[INFO] Forking 7 workers (8 total CPUs, reserving 1 for OS)
[INFO] Forking worker 1/7
[INFO] Forking worker 2/7
...
[INFO] Worker 5678 is online
[INFO] Worker 5678 starting
[INFO] Worker 5678 HTTP server started successfully
...
[INFO] Master process received SIGTERM, shutting down all workers gracefully
[INFO] Disconnecting worker 5678
[INFO] Worker 5678 disconnected
[INFO] All workers disconnected, master process exiting
```

### Production Mode (JSON)

```json
{"level":30,"time":1640995200000,"pid":1234,"hostname":"server","env":"production","msg":"Master process 1234 is running"}
{"level":30,"time":1640995200001,"pid":1234,"hostname":"server","env":"production","msg":"Forking 7 workers (8 total CPUs, reserving 1 for OS)"}
```

## Configuration

### Environment Variables

```env
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
```

### Logger Configuration

- **LOG_LEVEL**: Set logging level (default: 'info')
- **NODE_ENV**: Controls transport and formatting
  - 'development': Colorized pretty output
  - 'production': JSON structured logging

### Performance Tuning

- Adjust `numWorkers` in `cluster.ts` if needed
- Monitor CPU usage and adjust accordingly
- Consider using PM2 for additional process management

## Troubleshooting

### Worker Crashes

- Workers automatically restart on crashes
- Check logs for crash reasons
- Monitor memory usage

### Port Conflicts

- Ensure only one cluster instance runs per port
- Check for existing processes on the port

### Memory Issues

- Monitor memory usage per worker
- Consider reducing worker count if needed
- Implement memory monitoring

### Logger Issues

- Ensure `pino` and `pino-pretty` are installed
- Check NODE_ENV is set correctly
- Verify LOG_LEVEL is valid
