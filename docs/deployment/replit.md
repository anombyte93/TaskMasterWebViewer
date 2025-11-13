# Replit Deployment Guide

Deploy TaskMaster Dashboard to Replit in minutes with zero infrastructure management.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Step-by-Step Deployment](#step-by-step-deployment)
- [Configuration](#configuration)
- [Auto-Deployment from GitHub](#auto-deployment-from-github)
- [Troubleshooting](#troubleshooting)
- [Updating Your Deployment](#updating-your-deployment)

## Overview

Replit provides a complete development and hosting environment with:

- **Zero Configuration**: Works out of the box
- **Free Tier**: Generous limits for small projects
- **HTTPS**: Automatic SSL certificates
- **Autoscale**: Handles traffic spikes automatically
- **PostgreSQL**: Built-in database (not used in Phase 1)

**Time to Deploy:** 5-10 minutes

## Prerequisites

1. **Replit Account**: Sign up at [replit.com](https://replit.com)
2. **GitHub Account**: (Optional, for auto-deployment)
3. **TaskMaster Project**: Repository with `.taskmaster/` directory

## Step-by-Step Deployment

### Method 1: Import from GitHub (Recommended)

1. **Navigate to Replit**
   - Go to [replit.com](https://replit.com)
   - Click "Create Repl"

2. **Import from GitHub**
   - Select "Import from GitHub"
   - Paste your repository URL
   - Click "Import from GitHub"

3. **Replit Auto-Detection**
   - Replit will detect Node.js project automatically
   - It will read `.replit` configuration file
   - Dependencies will be installed automatically

4. **Configure Environment Variables**
   - Click "Secrets" tab (lock icon) in left sidebar
   - Add required variables:
     ```
     PROJECT_ROOT=/home/runner/YourReplName
     NODE_ENV=production
     ```

5. **Run the Project**
   - Click the green "Run" button
   - Wait for build to complete
   - Dashboard opens in webview

### Method 2: Upload Project Files

1. **Create New Repl**
   - Go to [replit.com](https://replit.com)
   - Click "Create Repl"
   - Select "Node.js" template
   - Name your Repl

2. **Upload Files**
   - Click the three-dot menu next to "Files"
   - Select "Upload folder"
   - Upload your entire project directory
   - **Important:** Include `.taskmaster/` directory

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Configure Environment Variables**
   - Add secrets (see Method 1, step 4)

5. **Run the Project**
   - Click "Run"
   - Dashboard opens in webview

## Configuration

### .replit Configuration File

Your project includes a `.replit` file that Replit uses for configuration:

```toml
modules = ["nodejs-20", "web", "postgresql-16"]
run = "npm run dev"
hidden = [".config", ".git", "node_modules", "dist"]

[nix]
channel = "stable-24_05"

[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]

[[ports]]
localPort = 5000
externalPort = 80

[env]
PORT = "5000"
```

**Key Settings:**
- `modules`: Node.js 20, web server, PostgreSQL (future use)
- `run`: Development command
- `deployment.build`: Production build command
- `deployment.run`: Production start command
- `ports`: Maps internal port 5000 to external port 80

### Environment Variables (Secrets)

Configure these in the Replit Secrets tab:

#### Required

```bash
# Path to your project (Replit auto-sets this structure)
PROJECT_ROOT=/home/runner/YOUR_REPL_NAME
```

Replace `YOUR_REPL_NAME` with your actual Repl name.

#### Optional

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# TaskMaster Paths (usually don't need to change)
TASKMASTER_PATH=.taskmaster
ISSUES_PATH=.taskmaster/issues

# Logging
LOG_LEVEL=info
```

### Verifying PROJECT_ROOT

To find your exact PROJECT_ROOT:

1. Open Replit Shell
2. Run:
   ```bash
   pwd
   ```
3. Copy the output (should be `/home/runner/YourReplName`)
4. Use this as your `PROJECT_ROOT` in Secrets

## Auto-Deployment from GitHub

Enable automatic deployments when you push to GitHub:

### Setup GitHub Integration

1. **Connect GitHub to Replit**
   - In your Repl, click the "Version Control" tab (Git icon)
   - Click "Connect to GitHub"
   - Authorize Replit to access your repository

2. **Configure Auto-Deploy**
   - Go to your Repl's "Deployment" tab
   - Enable "Deploy from GitHub"
   - Select branch (usually `main` or `master`)
   - Enable "Auto-deploy on push"

3. **Test the Integration**
   ```bash
   # On your local machine
   git commit -m "Test auto-deploy"
   git push origin main
   ```
   - Replit will automatically detect the push
   - Build and deploy will start automatically
   - Check the Deployment logs for status

### Deployment Workflow

```
Local Changes → Git Push → GitHub → Replit Webhook → Build → Deploy
     ↓             ↓          ↓           ↓            ↓        ↓
   Code        Commit     Repo      Detected      npm run   Live
   Edits      Message   Updated    by Replit      build     Site
```

**Time:** 2-5 minutes from push to live

## Troubleshooting

### Build Failures

**Problem:** Build fails with "npm install" errors

**Solutions:**
1. Check `package.json` is valid JSON
2. Ensure all dependencies are listed
3. Clear Replit cache:
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

---

**Problem:** "Module not found" errors

**Solutions:**
1. Check if module is in `dependencies` (not `devDependencies`)
2. Run `npm install --production=false` in Shell
3. Verify `.replit` file has correct Node.js version

---

### Runtime Errors

**Problem:** "PROJECT_ROOT not found" or tasks not loading

**Solutions:**
1. Verify `PROJECT_ROOT` in Secrets:
   ```bash
   echo $PROJECT_ROOT
   ```
2. Check `.taskmaster/` directory exists:
   ```bash
   ls -la .taskmaster/
   ```
3. Verify file permissions:
   ```bash
   ls -l .taskmaster/tasks/tasks.json
   ```

---

**Problem:** Application crashes on startup

**Solutions:**
1. Check logs in Console tab
2. Verify environment variables are set
3. Test locally first:
   ```bash
   npm run dev
   ```
4. Check for port conflicts (should use PORT=5000)

---

### Deployment Issues

**Problem:** Auto-deploy not triggering

**Solutions:**
1. Check GitHub webhook status:
   - Repository Settings → Webhooks
   - Look for Replit webhook
   - Check recent delivery logs
2. Verify branch name matches configuration
3. Try manual deployment:
   - Deployment tab → "Deploy now"

---

**Problem:** Deployment succeeds but site shows old version

**Solutions:**
1. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
2. Clear Replit cache:
   ```bash
   rm -rf dist
   npm run build
   ```
3. Check deployment logs for actual deploy time

---

### Performance Issues

**Problem:** Slow response times or cold starts

**Solutions:**
1. Upgrade to paid Replit plan (removes cold starts)
2. Optimize build:
   - Remove unused dependencies
   - Check bundle size
3. Enable caching in Express
4. Consider upgrading to "Always On" feature

---

**Problem:** Out of memory errors

**Solutions:**
1. Upgrade Replit plan for more RAM
2. Optimize build configuration in `vite.config.ts`
3. Reduce concurrent operations
4. Monitor memory usage:
   ```bash
   node --expose-gc --max-old-space-size=512 dist/index.js
   ```

---

### Data Issues

**Problem:** Tasks or issues not showing in dashboard

**Solutions:**
1. Verify `.taskmaster/` directory structure:
   ```bash
   tree .taskmaster/
   ```
   Expected:
   ```
   .taskmaster/
   ├── tasks/
   │   └── tasks.json
   └── issues/
       └── *.json
   ```

2. Check file permissions:
   ```bash
   chmod 644 .taskmaster/tasks/tasks.json
   chmod 644 .taskmaster/issues/*.json
   ```

3. Verify JSON is valid:
   ```bash
   cat .taskmaster/tasks/tasks.json | python -m json.tool
   ```

4. Check logs for errors:
   - Console tab in Replit
   - Look for filesystem errors

---

## Updating Your Deployment

### Method 1: Auto-Deploy (GitHub Integration)

Simply push to your repository:

```bash
git add .
git commit -m "Update dashboard features"
git push origin main
```

Replit will automatically:
1. Detect the push
2. Pull latest code
3. Run `npm run build`
4. Restart with `npm run start`

**Downtime:** ~30 seconds during deployment

### Method 2: Manual Deployment

1. **Edit Files in Replit**
   - Make changes directly in Replit editor
   - Click "Run" to test

2. **Deploy Changes**
   - Go to "Deployment" tab
   - Click "Deploy now"
   - Wait for build to complete

### Method 3: Upload New Files

1. **Stop the Repl**
   - Click "Stop" button

2. **Upload Files**
   - Three-dot menu → "Upload file" or "Upload folder"
   - Overwrite existing files

3. **Restart**
   - Click "Run"

### Zero-Downtime Deployments

Replit's autoscale deployment provides near-zero downtime:

1. New version is built in background
2. Health checks verify new version
3. Traffic switches to new version
4. Old version is terminated

**Note:** Only available on paid plans with autoscale enabled

## Best Practices

### 1. Use Environment Secrets

Never hardcode sensitive data:

```javascript
// ❌ Bad
const projectRoot = "/home/runner/MyRepl";

// ✅ Good
const projectRoot = process.env.PROJECT_ROOT;
```

### 2. Enable HTTPS Only

Replit provides HTTPS by default. Never disable it.

### 3. Monitor Resource Usage

Check Replit's resource monitor:
- CPU usage should be < 80%
- Memory usage should be < 90%
- Consider upgrading if consistently high

### 4. Use .gitignore

Prevent uploading unnecessary files:

```gitignore
node_modules/
dist/
.env
.DS_Store
*.log
```

### 5. Enable Logging

Configure appropriate log level:

```bash
# Development
LOG_LEVEL=debug

# Production
LOG_LEVEL=info
```

### 6. Test Before Deploying

Always test locally first:

```bash
npm run build
npm run start
```

## Replit-Specific Features

### Always On

Keep your Repl running 24/7:
- Navigate to Repl settings
- Enable "Always On"
- Prevents cold starts

**Cost:** Requires paid plan

### Custom Domain

Use your own domain:
1. Deployment tab → "Add custom domain"
2. Enter your domain
3. Update DNS records (provided by Replit)
4. Wait for SSL certificate (automatic)

### Boosts

Allocate more resources:
- Memory boost (up to 8GB)
- CPU boost (faster processing)

**Cost:** Based on usage

## Monitoring and Logs

### View Logs

1. **Console Tab**
   - Real-time logs
   - Stderr and stdout
   - Colored output

2. **Deployment Logs**
   - Build logs
   - Deploy logs
   - Historical logs

### Log Commands

In Replit Shell:

```bash
# Follow logs in real-time
tail -f /tmp/repl-logs/*.log

# Search logs
grep "error" /tmp/repl-logs/*.log

# View last 100 lines
tail -n 100 /tmp/repl-logs/*.log
```

## Security Considerations

### 1. Secrets Management

- Use Replit Secrets for all sensitive data
- Never commit secrets to Git
- Rotate secrets regularly

### 2. File Permissions

Replit sets appropriate permissions, but verify:

```bash
chmod 600 .env  # If using local .env
chmod 644 .taskmaster/tasks/tasks.json
```

### 3. Network Security

- Replit provides HTTPS automatically
- All external ports are secure by default
- No need for firewall configuration

### 4. Dependency Security

Check for vulnerabilities:

```bash
npm audit
npm audit fix
```

## Pricing

### Free Tier

- Unlimited public Repls
- 0.5 vCPU, 512MB RAM
- Cold starts after inactivity
- Community support

**Good for:** MVP, prototypes, personal projects

### Hacker Plan ($7/month)

- Always On (no cold starts)
- 2 vCPU, 2GB RAM
- Private Repls
- Custom domains
- Email support

**Good for:** Production apps, small teams

### Pro Plan ($20/month)

- 4 vCPU, 8GB RAM
- Advanced analytics
- Priority support
- Autoscale deployment

**Good for:** High-traffic apps, businesses

[→ Replit Pricing](https://replit.com/pricing)

## Next Steps

After successful deployment:

1. **Test the Deployment**
   - Visit your Repl URL
   - Verify tasks load correctly
   - Test all features

2. **Set Up Monitoring**
   - Enable Always On (paid plans)
   - Configure alerts (if available)

3. **Configure Updates**
   - Enable GitHub auto-deploy
   - Set up CI/CD pipeline

4. **Share Your Dashboard**
   - Repl URL is publicly accessible
   - Consider custom domain for production

## Additional Resources

- [Replit Documentation](https://docs.replit.com)
- [Replit Community](https://replit.com/community)
- [Deployment Guide](https://docs.replit.com/hosting/deployments/about-deployments)
- [Troubleshooting Common Issues](./troubleshooting.md)

---

**Need Help?**
- [Troubleshooting Guide](./troubleshooting.md)
- [Environment Variables Reference](./environment-variables.md)
- [Updates and Maintenance](./updates.md)
