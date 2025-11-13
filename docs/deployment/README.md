# TaskMaster Dashboard - Deployment Guide

Welcome to the TaskMaster Dashboard deployment documentation. This guide covers deployment options, prerequisites, and step-by-step instructions for getting your TaskMaster Dashboard running in production.

## Table of Contents

- [Quick Start](#quick-start)
- [Deployment Options](#deployment-options)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Platform-Specific Guides](#platform-specific-guides)
- [Production Checklist](#production-checklist)
- [Next Steps](#next-steps)

## Quick Start

Choose your deployment platform:

1. **[Replit](./replit.md)** - Fastest deployment, zero configuration (recommended for MVP)
2. **[Docker](./docker.md)** - Containerized deployment for any host
3. **[VPS/Linux Server](./vps.md)** - Full control on dedicated server

## Deployment Options

### Replit (Recommended for MVP)

**Best for:** Quick deployment, prototyping, small teams

**Pros:**
- Zero infrastructure management
- Auto-deployment from GitHub
- Built-in PostgreSQL database
- Free tier available
- HTTPS out of the box

**Cons:**
- Limited resources on free tier
- Less control over infrastructure
- Potential cold starts

[→ Replit Deployment Guide](./replit.md)

---

### Docker

**Best for:** Consistent environments, scalability, CI/CD pipelines

**Pros:**
- Reproducible builds
- Easy local testing
- Deploy anywhere Docker runs
- Version control for entire stack

**Cons:**
- Requires Docker knowledge
- Additional layer of complexity
- Resource overhead

[→ Docker Deployment Guide](./docker.md)

---

### VPS/Linux Server

**Best for:** Full control, custom configurations, production at scale

**Pros:**
- Complete control over infrastructure
- Cost-effective for high traffic
- Custom security configurations
- No vendor lock-in

**Cons:**
- Requires server administration skills
- Manual updates and maintenance
- Security is your responsibility

[→ VPS Deployment Guide](./vps.md)

---

## Prerequisites

### System Requirements

- **Node.js**: v20.x or higher (LTS recommended)
- **npm**: v10.x or higher (comes with Node.js)
- **Memory**: Minimum 512MB RAM (2GB recommended)
- **Disk**: 500MB free space minimum
- **OS**: Linux, macOS, or Windows (Linux recommended for production)

### Required Knowledge

- Basic command line usage
- Environment variable configuration
- Git basics (for deployments from repository)
- Understanding of your chosen deployment platform

### Required Files

Your project must have:
- `.taskmaster/` directory with TaskMaster data
- `tasks.json` file inside `.taskmaster/tasks/`
- `package.json` with all dependencies
- `.env.example` (copy to `.env` and configure)

## Environment Configuration

The TaskMaster Dashboard requires environment variables to function. All platforms need these configured.

### Required Variables

```bash
# Path to project containing .taskmaster/ directory
PROJECT_ROOT=/path/to/your/project
```

### Optional Variables

```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# TaskMaster Paths (relative to PROJECT_ROOT)
TASKMASTER_PATH=.taskmaster
ISSUES_PATH=.taskmaster/issues

# Feature Flags (Phase 1: all disabled)
ENABLE_EDITING=false
ENABLE_GIT_ACTIONS=false
ENABLE_MCP_MANAGEMENT=false

# Logging
LOG_LEVEL=info
```

[→ Complete Environment Variables Reference](./environment-variables.md)

## Platform-Specific Guides

### 1. Replit Deployment

Perfect for getting started quickly with zero infrastructure setup.

**Time to deploy:** 5-10 minutes

[→ Read Replit Guide](./replit.md)

---

### 2. Docker Deployment

Best for reproducible deployments and containerized environments.

**Time to deploy:** 15-30 minutes

[→ Read Docker Guide](./docker.md)

---

### 3. VPS Deployment

For production-grade deployments with full control.

**Time to deploy:** 30-60 minutes

[→ Read VPS Guide](./vps.md)

---

## Production Checklist

Before deploying to production, ensure:

### Security

- [ ] Environment variables are secured (not in version control)
- [ ] `NODE_ENV=production` is set
- [ ] HTTPS is enabled (SSL/TLS certificate installed)
- [ ] File permissions are restricted (read-only where possible)
- [ ] Default ports are not exposed (use reverse proxy)

### Performance

- [ ] Application is built for production (`npm run build`)
- [ ] Static assets are optimized
- [ ] Database connections are pooled (if using database)
- [ ] Logs are configured for production (info level, not debug)

### Reliability

- [ ] Process manager is configured (PM2, systemd, or platform equivalent)
- [ ] Auto-restart on failure is enabled
- [ ] Health checks are configured
- [ ] Monitoring/alerting is set up (optional but recommended)

### Data

- [ ] `.taskmaster/` directory is accessible
- [ ] File permissions allow read access
- [ ] Backup strategy is in place (recommended)
- [ ] Data location is documented

### Testing

- [ ] Application starts successfully
- [ ] All API endpoints respond correctly
- [ ] WebSocket connections work (if using Phase 2+ features)
- [ ] Dashboard loads and displays data
- [ ] Mobile/responsive layout works

## Next Steps

After successful deployment:

1. **[Configure Updates](./updates.md)** - Learn how to deploy updates safely
2. **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions
3. **[User Guide](../user-guide/README.md)** - Guide for end users
4. **Monitor** - Set up monitoring and logging (platform-specific)

## Need Help?

- **Troubleshooting:** [Common Issues & Solutions](./troubleshooting.md)
- **Updates:** [Deployment & Maintenance](./updates.md)
- **Environment:** [Environment Variables Reference](./environment-variables.md)

## Architecture Overview

```
┌─────────────────────────────────────────┐
│          TaskMaster Dashboard           │
│                                         │
│  ┌─────────────┐      ┌──────────────┐ │
│  │   React     │◄────►│   Express    │ │
│  │  Frontend   │      │   Backend    │ │
│  └─────────────┘      └──────────────┘ │
│                              │          │
│                              ▼          │
│                    ┌─────────────────┐  │
│                    │  TaskMaster     │  │
│                    │  FileSystem API │  │
│                    └─────────────────┘  │
│                              │          │
└──────────────────────────────┼──────────┘
                               ▼
                    ┌─────────────────┐
                    │  .taskmaster/   │
                    │   tasks.json    │
                    │   issues/       │
                    └─────────────────┘
```

**Key Points:**
- Single Node.js process serves both frontend and API
- Direct filesystem access to `.taskmaster/` data
- No database required (Phase 1)
- Port 5000 default (configurable)
- WebSocket support built-in (for Phase 2+)

---

**Version:** 1.0.0 (Phase 1 - MVP)
**Last Updated:** November 2025
**Project:** TaskMasterWebIntegration
