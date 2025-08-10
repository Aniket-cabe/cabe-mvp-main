#!/bin/bash

echo "🚀 Starting CaBE Arena Microservices..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your actual values before starting services."
fi

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
services=("auth:4000" "tasks:4001" "ai:4002" "nginx:80")

for service in "${services[@]}"; do
    host=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    echo "Checking $host service..."
    if curl -f http://localhost:$port/health > /dev/null 2>&1; then
        echo "✅ $host service is healthy"
    else
        echo "❌ $host service is not responding"
    fi
done

echo ""
echo "🎉 Microservices are starting up!"
echo ""
echo "📊 Service URLs:"
echo "   Auth Service: http://localhost:4000"
echo "   Tasks Service: http://localhost:4001"
echo "   AI Service: http://localhost:4002"
echo "   Nginx Proxy: http://localhost:80"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Check status: docker-compose ps"
