# Updates and Maintenance Guide

Learn how to safely deploy updates, perform maintenance, and handle rollbacks for TaskMaster Dashboard.

## Table of Contents

- [Update Strategy](#update-strategy)
- [Pre-Update Checklist](#pre-update-checklist)
- [Updating by Platform](#updating-by-platform)
- [Zero-Downtime Deployments](#zero-downtime-deployments)
- [Rollback Procedures](#rollback-procedures)
- [Maintenance Tasks](#maintenance-tasks)
- [Backup and Restore](#backup-and-restore)

## Update Strategy

### Types of Updates

1. **Patch Updates** (v1.0.x → v1.0.y)
   - Bug fixes
   - Security patches
   - Minor improvements
   - **Downtime:** Minimal (< 1 minute)
   - **Risk:** Low

2. **Minor Updates** (v1.x.0 → v1.y.0)
   - New features (backward compatible)
   - Dependency updates
   - Performance improvements
   - **Downtime:** 1-5 minutes
   - **Risk:** Low to Medium

3. **Major Updates** (v1.0.0 → v2.0.0)
   - Breaking changes
   - Architecture changes
   - Database migrations
   - **Downtime:** 5-30 minutes
   - **Risk:** Medium to High

### Update Frequency

- **Security patches:** Immediately
- **Bug fixes:** Weekly or as needed
- **Feature updates:** Monthly
- **Major versions:** Quarterly (with testing period)

## Pre-Update Checklist

Before deploying any update:

### 1. Review Changes

```bash
# View changes since last deployment
git log --oneline HEAD..origin/main

# View detailed changes
git diff HEAD..origin/main

# Check release notes
# Read CHANGELOG.md or GitHub releases
```

### 2. Backup Data

```bash
# Backup .taskmaster directory
tar -czf taskmaster-backup-$(date +%Y%m%d-%H%M%S).tar.gz .taskmaster/

# Store backup safely
mv taskmaster-backup-*.tar.gz ~/backups/
```

### 3. Test Update Locally

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Test locally
npm run start

# Verify in browser
curl http://localhost:5000/api/health
```

### 4. Check Dependencies

```bash
# Check for dependency vulnerabilities
npm audit

# Fix vulnerabilities (if any)
npm audit fix

# Check for outdated dependencies
npm outdated
```

### 5. Plan Maintenance Window

- **Choose low-traffic time** (e.g., 2-4 AM local time)
- **Notify users** (if applicable)
- **Estimate downtime** (usually < 5 minutes)
- **Have rollback plan ready**

## Updating by Platform

### Replit

#### Automatic Updates (GitHub Integration)

If you've set up GitHub auto-deploy:

```bash
# On local machine:
git add .
git commit -m "Update to v1.2.0"
git push origin main

# Replit automatically:
# 1. Detects push
# 2. Pulls latest code
# 3. Runs npm run build
# 4. Restarts with npm run start
# 5. Live in 2-5 minutes
```

**Monitor deployment:**
- Open Replit Deployment tab
- Watch build logs
- Verify deployment status

#### Manual Updates in Replit

1. **Open Replit Editor**
   - Navigate to your Repl

2. **Pull Latest Code**
   - Version Control tab → Pull changes
   - Or Shell:
     ```bash
     git pull origin main
     ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Build Application**
   ```bash
   npm run build
   ```

5. **Restart Repl**
   - Click "Run" button
   - Or:
     ```bash
     kill -9 $(pgrep node)
     npm run start
     ```

6. **Verify Update**
   ```bash
   curl https://your-repl-url/api/health
   ```

**Rollback:**
```bash
# Revert to previous commit
git log --oneline  # Find commit hash
git revert <commit-hash>
git push origin main
```

---

### Docker

#### Update with Docker Compose

**Standard Update (brief downtime):**

```bash
# 1. Pull latest code
cd ~/taskmaster-dashboard
git pull origin main

# 2. Stop containers
docker-compose down

# 3. Rebuild image
docker-compose build --no-cache

# 4. Start containers
docker-compose up -d

# 5. Verify
docker-compose ps
docker-compose logs -f

# 6. Test
curl http://localhost:5000/api/health
```

**Quick Update (cached build):**

```bash
# If only code changes (no dependency updates)
git pull origin main
docker-compose up -d --build

# Docker Compose will:
# 1. Build new image (using cache)
# 2. Replace containers
# 3. Start new containers
```

#### Update Docker Image from Registry

```bash
# Pull latest image
docker pull yourusername/taskmaster-dashboard:latest

# Update containers
docker-compose up -d

# Or with docker run
docker stop taskmaster-dashboard
docker rm taskmaster-dashboard
docker run -d \
  --name taskmaster-dashboard \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PROJECT_ROOT=/app \
  -v $(pwd)/.taskmaster:/app/.taskmaster:ro \
  yourusername/taskmaster-dashboard:latest
```

#### Zero-Downtime Update (Advanced)

```bash
# 1. Pull latest code
git pull origin main

# 2. Build new image with version tag
docker-compose build
docker tag taskmaster-dashboard:latest taskmaster-dashboard:v1.2.0

# 3. Create new container (different port temporarily)
docker run -d \
  --name taskmaster-dashboard-new \
  -p 5001:5000 \
  -e NODE_ENV=production \
  -e PROJECT_ROOT=/app \
  -v $(pwd)/.taskmaster:/app/.taskmaster:ro \
  taskmaster-dashboard:v1.2.0

# 4. Verify new version works
curl http://localhost:5001/api/health

# 5. Update Nginx to point to new container
# Edit nginx.conf: proxy_pass http://localhost:5001;
sudo systemctl reload nginx

# 6. Stop old container
docker stop taskmaster-dashboard
docker rm taskmaster-dashboard

# 7. Rename new container
docker rename taskmaster-dashboard-new taskmaster-dashboard

# 8. Update Nginx back to 5000
# Edit nginx.conf: proxy_pass http://localhost:5000;
sudo systemctl reload nginx
```

**Rollback:**
```bash
# Keep old image tagged
docker tag taskmaster-dashboard:latest taskmaster-dashboard:v1.1.0

# To rollback:
docker-compose down
docker tag taskmaster-dashboard:v1.1.0 taskmaster-dashboard:latest
docker-compose up -d
```

---

### VPS (PM2)

#### Standard Update

```bash
# 1. Navigate to project
cd ~/taskmaster-dashboard

# 2. Stop application
pm2 stop taskmaster-dashboard

# 3. Pull latest code
git pull origin main

# 4. Install dependencies
npm install

# 5. Build application
npm run build

# 6. Start application
pm2 start taskmaster-dashboard

# 7. Save PM2 state
pm2 save

# 8. Verify
pm2 status
curl http://localhost:5000/api/health
```

#### Zero-Downtime Update (PM2 Reload)

```bash
# 1. Pull latest code
cd ~/taskmaster-dashboard
git pull origin main

# 2. Install dependencies
npm install

# 3. Build application
npm run build

# 4. Reload application (zero-downtime)
pm2 reload taskmaster-dashboard

# PM2 will:
# 1. Start new instance
# 2. Wait for it to be ready
# 3. Stop old instance
# 4. Seamless transition

# 5. Verify
pm2 status
pm2 logs taskmaster-dashboard --lines 50
```

#### Update with Cluster Mode

```bash
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'taskmaster-dashboard',
    script: './dist/index.js',
    instances: 2,  # Multiple instances
    exec_mode: 'cluster',
    // ... rest of config
  }]
};

# Update with rolling restart
pm2 reload ecosystem.config.js

# PM2 will:
# 1. Update instances one by one
# 2. Keep at least one instance running
# 3. Zero downtime
```

**Rollback:**
```bash
# Revert to previous commit
git log --oneline  # Find commit hash
git checkout <previous-commit-hash>

# Rebuild and restart
npm install
npm run build
pm2 restart taskmaster-dashboard
```

---

### VPS (systemd)

#### Standard Update

```bash
# 1. Stop service
sudo systemctl stop taskmaster-dashboard

# 2. Pull latest code
cd /home/taskmaster/taskmaster-dashboard
sudo -u taskmaster git pull origin main

# 3. Install dependencies
sudo -u taskmaster npm install

# 4. Build application
sudo -u taskmaster npm run build

# 5. Start service
sudo systemctl start taskmaster-dashboard

# 6. Verify
sudo systemctl status taskmaster-dashboard
curl http://localhost:5000/api/health
```

#### Update with Backup Instance

```bash
# 1. Create backup of current version
cp -r ~/taskmaster-dashboard ~/taskmaster-dashboard-backup

# 2. Update main instance
cd ~/taskmaster-dashboard
git pull origin main
npm install
npm run build

# 3. Test before restarting
npm run start  # Test in foreground

# 4. If successful, restart service
sudo systemctl restart taskmaster-dashboard

# 5. If failed, restore backup
sudo systemctl stop taskmaster-dashboard
rm -rf ~/taskmaster-dashboard
mv ~/taskmaster-dashboard-backup ~/taskmaster-dashboard
sudo systemctl start taskmaster-dashboard
```

**Rollback:**
```bash
# Stop service
sudo systemctl stop taskmaster-dashboard

# Revert code
cd /home/taskmaster/taskmaster-dashboard
git log --oneline
git checkout <previous-commit-hash>

# Rebuild
npm install
npm run build

# Start service
sudo systemctl start taskmaster-dashboard
```

---

## Zero-Downtime Deployments

### Strategy 1: Blue-Green Deployment

Run two identical environments (blue and green), switch traffic between them.

**Setup:**

```bash
# Blue environment (current)
# Port 5000, container name: taskmaster-blue

# Green environment (new)
# Port 5001, container name: taskmaster-green
```

**Deployment:**

```bash
# 1. Deploy to green (port 5001)
docker run -d \
  --name taskmaster-green \
  -p 5001:5000 \
  -e NODE_ENV=production \
  -e PROJECT_ROOT=/app \
  -v $(pwd)/.taskmaster:/app/.taskmaster:ro \
  taskmaster-dashboard:v1.2.0

# 2. Test green
curl http://localhost:5001/api/health

# 3. Switch Nginx to green
# Update nginx.conf: proxy_pass http://localhost:5001;
sudo systemctl reload nginx

# 4. Verify traffic on green
# Monitor logs, test application

# 5. Stop blue
docker stop taskmaster-blue

# 6. Switch ports (optional)
docker stop taskmaster-green
docker rename taskmaster-green taskmaster-blue
docker update --publish-rm 5001:5000 taskmaster-blue
docker update --publish-add 5000:5000 taskmaster-blue
```

**Rollback:**
```bash
# Simply switch Nginx back to blue
# Update nginx.conf: proxy_pass http://localhost:5000;
sudo systemctl reload nginx
```

---

### Strategy 2: Rolling Update (PM2 Cluster)

Update instances gradually, always keeping some running.

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'taskmaster-dashboard',
    script: './dist/index.js',
    instances: 4,  # 4 instances
    exec_mode: 'cluster',
    // ...
  }]
};
```

**Update:**
```bash
# PM2 automatically does rolling updates
pm2 reload taskmaster-dashboard

# Process:
# 1. Update instance 1 → wait for ready
# 2. Update instance 2 → wait for ready
# 3. Update instance 3 → wait for ready
# 4. Update instance 4 → wait for ready
# Always 3/4 instances running
```

---

### Strategy 3: Load Balancer Switch

Use Nginx to switch between multiple backends.

**nginx.conf:**
```nginx
upstream taskmaster {
    server localhost:5000;  # Current version
    server localhost:5001 backup;  # New version (backup)
}

server {
    location / {
        proxy_pass http://taskmaster;
    }
}
```

**Update:**
```bash
# 1. Start new version on 5001
npm run start -- --port=5001 &

# 2. Test new version
curl http://localhost:5001/api/health

# 3. Switch in nginx.conf
upstream taskmaster {
    server localhost:5001;  # New version (primary)
    server localhost:5000 backup;  # Old version (backup)
}

# 4. Reload Nginx
sudo systemctl reload nginx

# 5. Stop old version
kill <old-process-pid>
```

---

## Rollback Procedures

### Git-Based Rollback

```bash
# 1. View commit history
git log --oneline -n 10

# 2. Revert to specific commit
git checkout <commit-hash>

# Or revert last commit
git revert HEAD

# 3. Rebuild and restart
npm install
npm run build

# Platform-specific restart:
pm2 restart taskmaster-dashboard  # PM2
sudo systemctl restart taskmaster-dashboard  # systemd
docker-compose restart  # Docker
```

---

### Docker Image Rollback

```bash
# 1. List available images
docker images | grep taskmaster

# 2. Tag old version as latest
docker tag taskmaster-dashboard:v1.1.0 taskmaster-dashboard:latest

# 3. Restart containers
docker-compose down
docker-compose up -d
```

---

### PM2 Rollback

```bash
# 1. Navigate to project
cd ~/taskmaster-dashboard

# 2. Revert code
git checkout <previous-commit-hash>

# 3. Rebuild
npm install
npm run build

# 4. Restart
pm2 restart taskmaster-dashboard
```

---

### Emergency Rollback

If application won't start after update:

```bash
# 1. Stop application
pm2 stop all  # or sudo systemctl stop taskmaster-dashboard

# 2. Restore from backup
rm -rf ~/taskmaster-dashboard
cp -r ~/taskmaster-dashboard-backup ~/taskmaster-dashboard

# 3. Start application
cd ~/taskmaster-dashboard
pm2 start ecosystem.config.js
# or sudo systemctl start taskmaster-dashboard

# 4. Verify
curl http://localhost:5000/api/health
```

---

## Maintenance Tasks

### Weekly Maintenance

```bash
# 1. Check application health
pm2 status  # or systemctl status

# 2. Check disk space
df -h

# 3. Check logs for errors
pm2 logs --lines 100 | grep -i error
# or sudo journalctl -u taskmaster-dashboard --since "1 week ago" | grep -i error

# 4. Update dependencies (if needed)
npm outdated
```

---

### Monthly Maintenance

```bash
# 1. Security audit
npm audit

# 2. Update dependencies
npm update

# 3. Clean old logs
pm2 flush  # Clear PM2 logs
# or configure log rotation

# 4. Check resource usage
htop
df -h

# 5. Test backup restore (critical!)
# Restore backup to test environment
# Verify functionality
```

---

### Quarterly Maintenance

```bash
# 1. Major dependency updates
npm outdated
npm update

# 2. Node.js version update (if needed)
node --version
# Update Node.js if new LTS available

# 3. Review and optimize
# Check performance metrics
# Review error logs
# Optimize slow queries (if using database)

# 4. Security hardening review
# Update SSL certificates
# Review firewall rules
# Check for security advisories
```

---

## Backup and Restore

### Automated Backup Script

Create `backup.sh`:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/home/taskmaster/backups"
PROJECT_DIR="/home/taskmaster/taskmaster-dashboard"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="taskmaster-backup-$TIMESTAMP.tar.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup .taskmaster directory
echo "Creating backup..."
tar -czf $BACKUP_DIR/$BACKUP_NAME \
    -C $PROJECT_DIR \
    .taskmaster

# Verify backup
if [ -f "$BACKUP_DIR/$BACKUP_NAME" ]; then
    echo "✓ Backup created: $BACKUP_NAME"
    ls -lh $BACKUP_DIR/$BACKUP_NAME
else
    echo "✗ Backup failed!"
    exit 1
fi

# Keep only last 30 days of backups
echo "Cleaning old backups..."
find $BACKUP_DIR -name "taskmaster-backup-*.tar.gz" -mtime +30 -delete

echo "Backup complete!"
```

**Make executable:**
```bash
chmod +x backup.sh
```

**Schedule with cron:**
```bash
# Edit crontab
crontab -e

# Add line: Daily backup at 2 AM
0 2 * * * /home/taskmaster/taskmaster-dashboard/backup.sh >> /home/taskmaster/backup.log 2>&1
```

---

### Restore from Backup

```bash
# 1. Stop application
pm2 stop taskmaster-dashboard

# 2. List available backups
ls -lh ~/backups/

# 3. Extract backup
cd ~/taskmaster-dashboard
tar -xzf ~/backups/taskmaster-backup-20250113_020000.tar.gz

# 4. Verify restoration
ls -la .taskmaster/
cat .taskmaster/tasks/tasks.json | python -m json.tool

# 5. Restart application
pm2 start taskmaster-dashboard

# 6. Verify
curl http://localhost:5000/api/tasks
```

---

## Update Notification Template

When notifying users of updates:

```
Subject: TaskMaster Dashboard Update - v1.2.0

Dear Users,

We will be performing a scheduled update to the TaskMaster Dashboard:

Date: [DATE]
Time: [TIME] (estimated 5 minutes downtime)
Version: v1.2.0

What's New:
- [Feature 1]
- [Bug Fix 1]
- [Improvement 1]

During the update:
- Dashboard will be briefly unavailable
- Your data is safe and backed up
- No action required from you

Thank you for your patience!

- TaskMaster Team
```

---

## Best Practices

1. **Always backup before updates** - Can't stress this enough
2. **Test updates locally first** - Catch issues before production
3. **Update during low-traffic hours** - Minimize impact
4. **Monitor logs after updates** - Catch issues quickly
5. **Keep old versions tagged** - Enable quick rollbacks
6. **Document changes** - Keep changelog updated
7. **Automate when possible** - Reduce human error
8. **Have rollback plan ready** - Know how to revert
9. **Notify users** - Communicate maintenance windows
10. **Test rollback procedure** - Don't wait for emergency

---

## Next Steps

- [Troubleshooting Guide](./troubleshooting.md)
- [Environment Variables Reference](./environment-variables.md)
- [Platform-Specific Guides](./README.md#platform-specific-guides)

---

**Update Checklist:**

Before any update:
- [ ] Review changes
- [ ] Backup .taskmaster directory
- [ ] Test locally
- [ ] Check dependencies
- [ ] Plan maintenance window
- [ ] Notify users (if applicable)
- [ ] Have rollback plan ready

After update:
- [ ] Verify application starts
- [ ] Check health endpoint
- [ ] Review logs for errors
- [ ] Test critical features
- [ ] Monitor for issues
- [ ] Document any problems

**Emergency Contacts:**
- Document who to contact if issues occur
- Keep rollback commands ready
- Have backup restoration procedure handy
