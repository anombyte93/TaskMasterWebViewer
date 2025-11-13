# Deployment Troubleshooting Guide

Common deployment issues and their solutions for TaskMaster Dashboard.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Build and Installation Issues](#build-and-installation-issues)
- [Runtime Errors](#runtime-errors)
- [Network and Port Issues](#network-and-port-issues)
- [Data Loading Problems](#data-loading-problems)
- [Performance Issues](#performance-issues)
- [Platform-Specific Issues](#platform-specific-issues)
- [Debug Mode](#debug-mode)

## Quick Diagnostics

Run these commands first to identify the issue:

```bash
# 1. Check if application is running
curl http://localhost:5000/api/health

# 2. Check Node.js version (requires v20+)
node --version

# 3. Check if port is in use
lsof -i :5000  # Linux/Mac
netstat -ano | findstr :5000  # Windows

# 4. Check environment variables
printenv | grep PROJECT_ROOT

# 5. Verify .taskmaster directory
ls -la .taskmaster/tasks/tasks.json

# 6. Check logs (platform-specific)
# Replit: Console tab
# Docker: docker-compose logs -f
# VPS with PM2: pm2 logs
# VPS with systemd: sudo journalctl -u taskmaster-dashboard -n 50
```

## Build and Installation Issues

### npm install Fails

#### Problem: "EACCES: permission denied"

**Solution 1:** Fix npm permissions
```bash
# Create directory for global packages
mkdir ~/.npm-global

# Configure npm to use new directory
npm config set prefix '~/.npm-global'

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH=~/.npm-global/bin:$PATH

# Reload shell
source ~/.bashrc  # or source ~/.zshrc

# Retry installation
npm install
```

**Solution 2:** Use sudo (not recommended)
```bash
sudo npm install
```

---

#### Problem: "Cannot find module" during install

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

#### Problem: "ERESOLVE unable to resolve dependency tree"

**Solution:**
```bash
# Use legacy peer deps
npm install --legacy-peer-deps

# Or force installation
npm install --force
```

---

### npm run build Fails

#### Problem: "TypeScript compilation errors"

**Solution:**
```bash
# Check TypeScript version
npm list typescript

# Update TypeScript
npm install typescript@latest

# Check for type errors
npm run check

# Build with verbose output
npm run build -- --verbose
```

---

#### Problem: "Out of memory" during build

**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Or add to package.json scripts:
# "build": "NODE_OPTIONS='--max-old-space-size=4096' vite build && esbuild ..."
```

---

#### Problem: Vite build fails with "ENOENT: no such file or directory"

**Solution:**
```bash
# Ensure all dependencies are installed
npm install

# Check if source files exist
ls -la client/src/
ls -la server/

# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run build
```

---

## Runtime Errors

### Application Crashes on Startup

#### Problem: "Error: Cannot find module 'express'"

**Cause:** Missing dependencies

**Solution:**
```bash
# Install dependencies
npm install

# Or production dependencies only
npm ci --only=production
```

---

#### Problem: "PROJECT_ROOT is not defined"

**Cause:** Missing environment variable

**Solution:**

**Replit:**
```bash
# Add to Secrets tab
PROJECT_ROOT=/home/runner/YourReplName
```

**Docker:**
```yaml
# docker-compose.yml
environment:
  - PROJECT_ROOT=/app
```

**VPS:**
```bash
# .env file
echo "PROJECT_ROOT=/home/taskmaster/taskmaster-dashboard" >> .env
```

---

#### Problem: "EADDRINUSE: address already in use :::5000"

**Cause:** Port 5000 is already taken

**Solution 1:** Kill process using port
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

**Solution 2:** Change port
```bash
# .env file
PORT=3000

# Or
export PORT=3000
npm run start
```

---

#### Problem: "ENOENT: no such file or directory, open '.taskmaster/tasks/tasks.json'"

**Cause:** .taskmaster directory not found or PROJECT_ROOT incorrect

**Solution:**
```bash
# 1. Verify PROJECT_ROOT
echo $PROJECT_ROOT

# 2. Check if .taskmaster exists
ls -la $PROJECT_ROOT/.taskmaster/

# 3. Verify tasks.json exists
cat $PROJECT_ROOT/.taskmaster/tasks/tasks.json

# 4. Check file permissions
ls -l $PROJECT_ROOT/.taskmaster/tasks/tasks.json

# 5. Fix permissions if needed
chmod 644 $PROJECT_ROOT/.taskmaster/tasks/tasks.json
```

---

### Application Starts but Crashes Immediately

#### Problem: Unhandled promise rejection

**Cause:** Missing error handling or async initialization issue

**Solution:**
```bash
# 1. Check logs for stack trace
# 2. Enable debug mode
NODE_ENV=development npm run dev

# 3. Add error handlers
# Edit server/index.ts to add:
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

---

## Network and Port Issues

### Cannot Access Dashboard from Browser

#### Problem: "This site can't be reached"

**Possible Causes:**

1. **Application not running**
   ```bash
   # Check if running
   curl http://localhost:5000/api/health

   # If fails, start application
   npm run start
   ```

2. **Firewall blocking port**
   ```bash
   # VPS: Allow port in firewall
   sudo ufw allow 5000/tcp

   # Docker: Check port mapping
   docker-compose ps
   ```

3. **Listening on wrong interface**
   ```bash
   # Ensure server listens on 0.0.0.0, not localhost
   # Check server/index.ts:
   server.listen({
     port,
     host: "0.0.0.0",  # Must be 0.0.0.0 for external access
   });
   ```

4. **Wrong URL or port**
   ```bash
   # Check PORT environment variable
   echo $PORT

   # Try with explicit port
   curl http://localhost:5000
   ```

---

### WebSocket Connection Failed

(Phase 2+ feature)

#### Problem: "WebSocket connection failed"

**Solution:**
```bash
# 1. Check WebSocket endpoint
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:5000/ws

# 2. Nginx: Ensure WebSocket support
# Add to nginx.conf:
location /ws {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
}

# 3. Check firewall allows WebSocket
sudo ufw status
```

---

### CORS Errors

#### Problem: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:**
```bash
# This shouldn't happen in production (same origin)
# If using separate frontend domain, add CORS middleware

# Install cors
npm install cors

# Add to server/index.ts:
import cors from 'cors';
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
```

---

## Data Loading Problems

### Tasks Not Displaying

#### Problem: Dashboard loads but shows no tasks

**Diagnostic Steps:**

1. **Check API response**
   ```bash
   curl http://localhost:5000/api/tasks | python -m json.tool
   ```

2. **Verify tasks.json**
   ```bash
   cat .taskmaster/tasks/tasks.json | python -m json.tool

   # Check if valid JSON
   ```

3. **Check file permissions**
   ```bash
   ls -l .taskmaster/tasks/tasks.json

   # Should be readable
   chmod 644 .taskmaster/tasks/tasks.json
   ```

4. **Check PROJECT_ROOT**
   ```bash
   # Verify PROJECT_ROOT points to correct location
   echo $PROJECT_ROOT
   ls -la $PROJECT_ROOT/.taskmaster/
   ```

5. **Check browser console**
   ```
   Open browser DevTools (F12)
   Check Console tab for errors
   Check Network tab for API request failures
   ```

---

### Issues Not Loading

#### Problem: Issues page is empty

**Solution:**
```bash
# 1. Check issues directory exists
ls -la .taskmaster/issues/

# 2. Check if any issue files exist
ls -la .taskmaster/issues/*.json

# 3. Verify file format
cat .taskmaster/issues/*.json | python -m json.tool

# 4. Check API endpoint
curl http://localhost:5000/api/issues | python -m json.tool
```

---

### Data Shows as "undefined" or "null"

#### Problem: API returns data but frontend shows undefined

**Cause:** API response format mismatch

**Solution:**
```bash
# 1. Check actual API response
curl http://localhost:5000/api/tasks | python -m json.tool

# 2. Compare with frontend expectations
# Open browser DevTools → Network tab
# Click on API request
# Check Response tab

# 3. Verify data structure matches
# Frontend expects: { tasks: [...] }
# API returns: { data: { tasks: [...] } }
# ^ Mismatch!

# 4. Fix API response format or frontend code
```

---

## Performance Issues

### Slow Page Load Times

#### Problem: Dashboard takes long to load

**Diagnostic Steps:**

1. **Check bundle size**
   ```bash
   npm run build
   ls -lh dist/
   ls -lh client/dist/
   ```

2. **Check network speed**
   ```bash
   # Test API response time
   curl -w "@-" -o /dev/null -s http://localhost:5000/api/tasks << 'EOF'
   time_total: %{time_total}s
   EOF
   ```

3. **Check server resources**
   ```bash
   # CPU and memory usage
   top
   # or
   htop

   # Docker
   docker stats taskmaster-dashboard
   ```

**Solutions:**

1. **Enable compression**
   ```javascript
   // server/index.ts
   import compression from 'compression';
   app.use(compression());
   ```

2. **Enable caching**
   ```nginx
   # nginx.conf
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **Optimize build**
   ```bash
   # Check for large dependencies
   npm ls --depth=0

   # Remove unused dependencies
   npm prune
   ```

---

### High Memory Usage

#### Problem: Application uses too much memory

**Diagnostic:**
```bash
# Check memory usage
# PM2
pm2 info taskmaster-dashboard

# systemd
sudo systemctl status taskmaster-dashboard

# Docker
docker stats taskmaster-dashboard
```

**Solutions:**

1. **Set memory limit (PM2)**
   ```javascript
   // ecosystem.config.js
   max_memory_restart: '1G'
   ```

2. **Set memory limit (Docker)**
   ```yaml
   # docker-compose.yml
   services:
     taskmaster-dashboard:
       deploy:
         resources:
           limits:
             memory: 1G
   ```

3. **Optimize Node.js**
   ```bash
   # Increase heap size
   node --max-old-space-size=2048 dist/index.js
   ```

---

### High CPU Usage

#### Problem: CPU usage consistently high

**Diagnostic:**
```bash
# Find CPU-intensive process
top
# Press '1' to see all cores
# Press 'Shift+P' to sort by CPU

# Or use htop
htop
```

**Solutions:**

1. **Check for infinite loops in code**
2. **Optimize database queries** (Phase 2+)
3. **Use clustering** (PM2)
   ```javascript
   // ecosystem.config.js
   instances: 'max',  // Use all CPU cores
   exec_mode: 'cluster'
   ```

---

## Platform-Specific Issues

### Replit Issues

#### Problem: "Repl is sleeping" or cold starts

**Solution:**
```bash
# Upgrade to Hacker plan for Always On feature
# Or
# Use an uptime monitor to ping your Repl
# Example: UptimeRobot (free)
```

---

#### Problem: Auto-deploy not working from GitHub

**Solution:**
```bash
# 1. Check GitHub webhook
# Repository → Settings → Webhooks
# Look for Replit webhook
# Check Recent Deliveries for errors

# 2. Reconnect GitHub
# In Repl: Version Control → Disconnect → Reconnect

# 3. Manually trigger deployment
# Deployment tab → Deploy now
```

---

### Docker Issues

#### Problem: "Cannot connect to Docker daemon"

**Solution:**
```bash
# Start Docker daemon
sudo systemctl start docker

# Check Docker status
sudo systemctl status docker

# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

---

#### Problem: Volume mount not working

**Solution:**
```bash
# 1. Check volume in docker-compose.yml
# Verify path exists on host
ls -la /path/to/.taskmaster

# 2. Use absolute path
volumes:
  - /absolute/path/to/.taskmaster:/app/.taskmaster:ro

# 3. Check container mount
docker exec taskmaster-dashboard ls -la /app/.taskmaster/

# 4. Restart container
docker-compose down
docker-compose up -d
```

---

### VPS Issues

#### Problem: PM2 not starting on reboot

**Solution:**
```bash
# 1. Check PM2 startup script exists
pm2 startup

# 2. Save PM2 process list
pm2 save

# 3. Test reboot
sudo reboot

# After reboot:
pm2 status
```

---

#### Problem: Nginx 502 Bad Gateway

**Cause:** Upstream (Node.js app) not running

**Solution:**
```bash
# 1. Check if app is running
pm2 status
# or
sudo systemctl status taskmaster-dashboard

# 2. Check if listening on correct port
sudo lsof -i :5000

# 3. Check Nginx upstream config
sudo nano /etc/nginx/sites-available/taskmaster-dashboard
# Verify: proxy_pass http://localhost:5000;

# 4. Test upstream directly
curl http://localhost:5000/api/health

# 5. Restart services
pm2 restart taskmaster-dashboard
sudo systemctl reload nginx
```

---

## Debug Mode

### Enable Debug Logging

```bash
# Development mode
NODE_ENV=development npm run dev

# Or set log level
LOG_LEVEL=debug npm run start
```

### Debug Specific Issues

#### Network Issues

```bash
# Verbose curl
curl -v http://localhost:5000/api/health

# Check all listening ports
sudo netstat -tuln

# Check process on specific port
sudo lsof -i :5000
```

#### File System Issues

```bash
# Check file access
strace -e open,openat npm run start 2>&1 | grep taskmaster

# Check file permissions
ls -la .taskmaster/
ls -la .taskmaster/tasks/
```

#### Docker Issues

```bash
# View container logs
docker-compose logs -f taskmaster-dashboard

# Exec into container
docker exec -it taskmaster-dashboard sh

# Inside container: check environment
env | grep PROJECT_ROOT
ls -la /app/.taskmaster/
```

## Getting More Help

If you're still stuck:

1. **Collect diagnostic information:**
   ```bash
   # System info
   uname -a
   node --version
   npm --version

   # Application logs (last 100 lines)
   # Adjust based on your setup

   # Environment variables (redact sensitive data)
   env | grep -E "NODE_ENV|PORT|PROJECT_ROOT"

   # File structure
   ls -la .taskmaster/
   ```

2. **Check these resources:**
   - [Environment Variables Reference](./environment-variables.md)
   - [Updates Guide](./updates.md)
   - Platform-specific guides: [Replit](./replit.md), [Docker](./docker.md), [VPS](./vps.md)

3. **Common patterns:**
   - 90% of issues are environment variable or path problems
   - Check PROJECT_ROOT first
   - Verify .taskmaster directory exists and is readable
   - Ensure Node.js version is 20+

---

**Last Resort Debug Checklist:**

- [ ] Node.js v20+ installed: `node --version`
- [ ] All dependencies installed: `npm install`
- [ ] Built successfully: `npm run build`
- [ ] PROJECT_ROOT set: `echo $PROJECT_ROOT`
- [ ] .taskmaster exists: `ls $PROJECT_ROOT/.taskmaster/`
- [ ] tasks.json exists: `cat $PROJECT_ROOT/.taskmaster/tasks/tasks.json`
- [ ] tasks.json is valid JSON: `cat tasks.json | python -m json.tool`
- [ ] Port not in use: `lsof -i :5000`
- [ ] Application starts: `npm run start`
- [ ] Health check passes: `curl http://localhost:5000/api/health`
- [ ] Firewall allows port: `sudo ufw status`
- [ ] Logs show no errors: check platform-specific logs

If all checks pass but issue persists, review your specific deployment platform guide for advanced troubleshooting.
