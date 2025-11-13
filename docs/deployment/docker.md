# Docker Deployment Guide

Deploy TaskMaster Dashboard using Docker for consistent, reproducible deployments across any environment.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Dockerfile Configuration](#dockerfile-configuration)
- [Docker Compose Setup](#docker-compose-setup)
- [Building the Image](#building-the-image)
- [Running the Container](#running-the-container)
- [Volume Management](#volume-management)
- [Environment Variables](#environment-variables)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Overview

Docker provides:

- **Consistency**: Same environment everywhere (dev, staging, prod)
- **Isolation**: Dependencies bundled with application
- **Portability**: Deploy to any Docker host
- **Scalability**: Easy horizontal scaling
- **CI/CD Ready**: Perfect for automated deployments

**Time to Deploy:** 15-30 minutes

## Prerequisites

### Required Software

1. **Docker**: v20.0 or higher
   ```bash
   docker --version
   ```
   [Install Docker](https://docs.docker.com/get-docker/)

2. **Docker Compose**: v2.0 or higher
   ```bash
   docker-compose --version
   ```
   (Usually included with Docker Desktop)

### Required Files

- `Dockerfile` (we'll create this)
- `docker-compose.yml` (we'll create this)
- `.dockerignore` (we'll create this)
- `.taskmaster/` directory with tasks

## Quick Start

### 1. Create Docker Files

Create `Dockerfile` in project root:

```dockerfile
# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "run", "start"]
```

Create `.dockerignore`:

```
node_modules
dist
.git
.env
.DS_Store
*.log
npm-debug.log*
.vscode
.idea
coverage
.taskmaster/state.json
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  taskmaster-dashboard:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: taskmaster-dashboard
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - PROJECT_ROOT=/app
    volumes:
      # Mount your .taskmaster directory (IMPORTANT!)
      - ./path/to/your/.taskmaster:/app/.taskmaster:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

# Optional: Add nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: taskmaster-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - taskmaster-dashboard
    restart: unless-stopped
```

### 2. Build and Run

```bash
# Build the image
docker-compose build

# Start the containers
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Verify Deployment

```bash
# Check health
curl http://localhost:5000/api/health

# View dashboard
# Open browser to http://localhost:5000
```

## Dockerfile Configuration

### Multi-Stage Build (Optimized)

For smaller images and faster builds:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/index.js"]
```

**Benefits:**
- 50-70% smaller image size
- Faster startup times
- Only production dependencies in final image
- Better security (no dev tools)

### Development Dockerfile

Create `Dockerfile.dev` for local development:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
```

## Docker Compose Setup

### Development Configuration

Create `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  taskmaster-dashboard:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: taskmaster-dashboard-dev
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - PORT=5000
      - PROJECT_ROOT=/app
    volumes:
      # Mount source code for hot reload
      - .:/app
      - /app/node_modules
      # Mount .taskmaster directory
      - ./path/to/your/.taskmaster:/app/.taskmaster
    restart: unless-stopped
```

Run with:
```bash
docker-compose -f docker-compose.dev.yml up
```

### Production Configuration

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  taskmaster-dashboard:
    image: taskmaster-dashboard:latest
    container_name: taskmaster-dashboard-prod
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - PROJECT_ROOT=/app
      - LOG_LEVEL=info
    volumes:
      - ./path/to/your/.taskmaster:/app/.taskmaster:ro
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    container_name: taskmaster-nginx-prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - nginx-cache:/var/cache/nginx
    depends_on:
      taskmaster-dashboard:
        condition: service_healthy
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  nginx-cache:
```

## Building the Image

### Local Build

```bash
# Build with default name
docker build -t taskmaster-dashboard:latest .

# Build with tag
docker build -t taskmaster-dashboard:v1.0.0 .

# Build with build args
docker build \
  --build-arg NODE_VERSION=20 \
  -t taskmaster-dashboard:latest .

# Build without cache
docker build --no-cache -t taskmaster-dashboard:latest .
```

### Multi-Platform Build

For ARM and x86 compatibility:

```bash
# Enable buildx
docker buildx create --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t taskmaster-dashboard:latest \
  --push .
```

### Build with Docker Compose

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build taskmaster-dashboard

# Build with no cache
docker-compose build --no-cache

# Pull latest base images before building
docker-compose build --pull
```

## Running the Container

### Using Docker Run

```bash
# Basic run
docker run -d \
  --name taskmaster-dashboard \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PROJECT_ROOT=/app \
  -v $(pwd)/.taskmaster:/app/.taskmaster:ro \
  taskmaster-dashboard:latest

# With all options
docker run -d \
  --name taskmaster-dashboard \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PROJECT_ROOT=/app \
  -e LOG_LEVEL=info \
  -v $(pwd)/.taskmaster:/app/.taskmaster:ro \
  --restart unless-stopped \
  --health-cmd="wget --quiet --tries=1 --spider http://localhost:5000/api/health || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  taskmaster-dashboard:latest
```

### Using Docker Compose

```bash
# Start services
docker-compose up -d

# Start with rebuild
docker-compose up -d --build

# Start specific service
docker-compose up -d taskmaster-dashboard

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Volume Management

### Mounting .taskmaster Directory

**Critical:** Your `.taskmaster/` directory must be accessible to the container.

#### Option 1: Absolute Path

```yaml
volumes:
  - /home/user/projects/myproject/.taskmaster:/app/.taskmaster:ro
```

#### Option 2: Relative Path

```yaml
volumes:
  - ../myproject/.taskmaster:/app/.taskmaster:ro
```

#### Option 3: Named Volume (Advanced)

```yaml
volumes:
  - taskmaster-data:/app/.taskmaster:ro

volumes:
  taskmaster-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /path/to/.taskmaster
```

### Read-Only vs Read-Write

**Phase 1 (MVP):** Use read-only (`:ro`)
```yaml
volumes:
  - ./.taskmaster:/app/.taskmaster:ro
```

**Phase 3+ (Editing):** Use read-write
```yaml
volumes:
  - ./.taskmaster:/app/.taskmaster:rw
```

### Verifying Volume Mounts

```bash
# Inspect container
docker inspect taskmaster-dashboard | grep -A 10 Mounts

# Access container shell
docker exec -it taskmaster-dashboard sh

# Inside container: check mount
ls -la /app/.taskmaster/
cat /app/.taskmaster/tasks/tasks.json
```

## Environment Variables

### Using .env File

Create `.env`:

```bash
NODE_ENV=production
PORT=5000
PROJECT_ROOT=/app
LOG_LEVEL=info
TASKMASTER_PATH=.taskmaster
ISSUES_PATH=.taskmaster/issues
```

Reference in `docker-compose.yml`:

```yaml
services:
  taskmaster-dashboard:
    env_file:
      - .env
```

### Using Environment Variables

```yaml
services:
  taskmaster-dashboard:
    environment:
      NODE_ENV: production
      PORT: 5000
      PROJECT_ROOT: /app
      LOG_LEVEL: ${LOG_LEVEL:-info}  # Default to 'info'
```

### Passing from Host

```bash
# Single variable
docker run -e NODE_ENV=production ...

# From host environment
docker run -e NODE_ENV ...

# Multiple variables
docker run \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e LOG_LEVEL=info \
  ...
```

## Production Deployment

### Complete Production Setup

```bash
# 1. Clone repository
git clone https://github.com/yourname/taskmaster-dashboard.git
cd taskmaster-dashboard

# 2. Create production config
cat > .env.production << EOF
NODE_ENV=production
PORT=5000
PROJECT_ROOT=/app
LOG_LEVEL=info
EOF

# 3. Build image
docker-compose -f docker-compose.prod.yml build

# 4. Start services
docker-compose -f docker-compose.prod.yml up -d

# 5. Verify
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f

# 6. Health check
curl http://localhost:5000/api/health
```

### Nginx Reverse Proxy

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream taskmaster {
        server taskmaster-dashboard:5000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        # Redirect to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-Content-Type-Options "nosniff";
        add_header X-XSS-Protection "1; mode=block";

        # Proxy settings
        location / {
            proxy_pass http://taskmaster;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket support (Phase 2+)
        location /ws {
            proxy_pass http://taskmaster;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $host;
        }

        # Static files caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://taskmaster;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### SSL Certificate Setup

Using Let's Encrypt:

```bash
# Install certbot
docker run -it --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/lib/letsencrypt:/var/lib/letsencrypt \
  certbot/certbot certonly \
  --standalone \
  -d your-domain.com

# Copy certificates
mkdir -p ./ssl
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem
```

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
docker-compose logs taskmaster-dashboard
```

**Common issues:**
1. Port already in use
   ```bash
   # Find process using port 5000
   lsof -i :5000
   # Kill process or change port in docker-compose.yml
   ```

2. Volume mount path incorrect
   ```bash
   # Verify path exists on host
   ls -la /path/to/.taskmaster
   ```

3. Environment variables missing
   ```bash
   # Check environment inside container
   docker exec taskmaster-dashboard env
   ```

### Build Failures

**Problem:** npm install fails

**Solution:**
```bash
# Clear Docker cache
docker builder prune -a

# Build with no cache
docker-compose build --no-cache

# Check network connectivity
docker run --rm node:20-alpine npm install express
```

### Application Errors

**Problem:** Tasks not loading

**Solution:**
```bash
# Check volume mount
docker exec -it taskmaster-dashboard sh
ls -la /app/.taskmaster/
cat /app/.taskmaster/tasks/tasks.json

# Verify PROJECT_ROOT
docker exec taskmaster-dashboard printenv PROJECT_ROOT

# Check logs
docker-compose logs -f taskmaster-dashboard
```

### Performance Issues

**Problem:** Slow response times

**Solutions:**
1. Increase resources:
   ```bash
   docker update --cpus="2" --memory="2g" taskmaster-dashboard
   ```

2. Check resource usage:
   ```bash
   docker stats taskmaster-dashboard
   ```

3. Optimize image:
   - Use multi-stage build
   - Remove unused dependencies
   - Use Alpine base image

### Network Issues

**Problem:** Can't access dashboard from host

**Solutions:**
```bash
# Check port binding
docker port taskmaster-dashboard

# Check if container is running
docker ps | grep taskmaster

# Test from inside container
docker exec taskmaster-dashboard wget -O- http://localhost:5000/api/health

# Check firewall
sudo ufw status
sudo ufw allow 5000
```

## Docker Hub Deployment

### Push to Registry

```bash
# Login to Docker Hub
docker login

# Tag image
docker tag taskmaster-dashboard:latest yourusername/taskmaster-dashboard:latest
docker tag taskmaster-dashboard:latest yourusername/taskmaster-dashboard:v1.0.0

# Push image
docker push yourusername/taskmaster-dashboard:latest
docker push yourusername/taskmaster-dashboard:v1.0.0
```

### Pull and Run

```bash
# Pull image
docker pull yourusername/taskmaster-dashboard:latest

# Run
docker run -d \
  --name taskmaster-dashboard \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PROJECT_ROOT=/app \
  -v $(pwd)/.taskmaster:/app/.taskmaster:ro \
  yourusername/taskmaster-dashboard:latest
```

## Useful Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View logs
docker logs taskmaster-dashboard
docker logs -f taskmaster-dashboard  # Follow logs

# Execute command in container
docker exec taskmaster-dashboard ls -la /app

# Interactive shell
docker exec -it taskmaster-dashboard sh

# Restart container
docker restart taskmaster-dashboard

# Stop container
docker stop taskmaster-dashboard

# Remove container
docker rm taskmaster-dashboard

# View images
docker images

# Remove image
docker rmi taskmaster-dashboard:latest

# Clean up
docker system prune -a  # Remove all unused containers, networks, images
```

## Best Practices

1. **Use Multi-Stage Builds** - Smaller, more secure images
2. **Run as Non-Root User** - Better security
3. **Use Health Checks** - Automatic restarts on failure
4. **Mount .taskmaster as Read-Only** - Prevent accidental modifications (Phase 1)
5. **Set Resource Limits** - Prevent container from consuming all resources
6. **Use .dockerignore** - Faster builds, smaller images
7. **Version Your Images** - Tag with version numbers, not just `latest`
8. **Enable Logging** - Configure log rotation
9. **Use Environment Variables** - Never hardcode configuration
10. **Test Locally First** - Always test Docker setup locally before production

## Next Steps

- [Troubleshooting Guide](./troubleshooting.md)
- [Updates and Maintenance](./updates.md)
- [Environment Variables Reference](./environment-variables.md)
- [VPS Deployment Guide](./vps.md)

---

**Need Help?**
- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Project Troubleshooting](./troubleshooting.md)
