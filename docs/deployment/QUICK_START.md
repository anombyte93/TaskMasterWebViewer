# Quick Start Guide

Get TaskMaster Dashboard running in 5 minutes.

## Choose Your Platform

### [Replit](./replit.md) - Fastest (5 minutes)

```bash
# 1. Import from GitHub to Replit
# 2. Add Secret: PROJECT_ROOT=/home/runner/YourReplName
# 3. Click Run
```

**Best for:** MVP, personal use, zero infrastructure

---

### [Docker](./docker.md) - Portable (15 minutes)

```bash
# 1. Clone repository
git clone https://github.com/yourname/taskmaster-dashboard.git
cd taskmaster-dashboard

# 2. Create docker-compose.yml (see Docker guide)

# 3. Start
docker-compose up -d
```

**Best for:** Consistent environments, any host

---

### [VPS/Linux](./vps.md) - Full Control (30 minutes)

```bash
# 1. SSH to server
ssh user@your-server

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Clone and setup
git clone https://github.com/yourname/taskmaster-dashboard.git
cd taskmaster-dashboard
npm install
npm run build

# 4. Start with PM2
npm install -g pm2
pm2 start dist/index.js --name taskmaster-dashboard
```

**Best for:** Production, custom configs, scalability

---

## Minimal Configuration

All platforms need:

```bash
PROJECT_ROOT=/path/to/your/project
```

That's it! Everything else has sensible defaults.

---

## Verify Deployment

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Expected response:
# { "status": "ok", "timestamp": "...", "version": "1.0.0" }
```

---

## Common Issues

**"PROJECT_ROOT not found"**
- Set environment variable correctly
- Verify `.taskmaster/` directory exists

**"Port already in use"**
- Change PORT environment variable
- Or kill process using port: `lsof -i :5000`

**"Tasks not loading"**
- Check `.taskmaster/tasks/tasks.json` exists
- Verify file is readable

---

## Next Steps

1. Read platform-specific guide
2. Configure environment variables (optional)
3. Set up auto-deployment (optional)
4. Configure monitoring (optional)

---

## Full Guides

- [Complete Overview](./README.md)
- [Replit Deployment](./replit.md)
- [Docker Deployment](./docker.md)
- [VPS Deployment](./vps.md)
- [Troubleshooting](./troubleshooting.md)
- [Updates Guide](./updates.md)
- [Environment Variables](./environment-variables.md)
