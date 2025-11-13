# VPS/Linux Server Deployment Guide

Deploy TaskMaster Dashboard to a VPS or dedicated Linux server with full control over your infrastructure.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Server Setup](#server-setup)
- [Application Installation](#application-installation)
- [Process Manager Setup](#process-manager-setup)
- [Nginx Configuration](#nginx-configuration)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring and Logging](#monitoring-and-logging)
- [Security Hardening](#security-hardening)
- [Troubleshooting](#troubleshooting)

## Overview

VPS deployment provides:

- **Full Control**: Complete access to server configuration
- **Scalability**: Upgrade resources as needed
- **Cost Effective**: More economical for high-traffic applications
- **Custom Configuration**: Fine-tune every aspect
- **No Vendor Lock-in**: Move providers easily

**Time to Deploy:** 30-60 minutes

## Prerequisites

### VPS Requirements

- **OS**: Ubuntu 22.04 LTS or Debian 12 (recommended)
- **CPU**: 1 vCPU minimum (2 vCPU recommended)
- **RAM**: 1GB minimum (2GB recommended)
- **Storage**: 10GB minimum (20GB recommended)
- **Network**: Public IP address

### Local Requirements

- SSH client
- SSH key pair (recommended over password)
- Domain name (optional, for HTTPS)

### Recommended VPS Providers

- **DigitalOcean**: Easy setup, good documentation
- **Linode**: Affordable, reliable
- **Vultr**: Good performance, competitive pricing
- **Hetzner**: Budget-friendly, European data centers
- **AWS Lightsail**: AWS ecosystem, scalable

## Server Setup

### 1. Initial Server Access

```bash
# Connect to server
ssh root@your-server-ip

# Or with key
ssh -i ~/.ssh/your-key root@your-server-ip
```

### 2. Create Non-Root User

```bash
# Create user
adduser taskmaster

# Add to sudo group
usermod -aG sudo taskmaster

# Switch to new user
su - taskmaster
```

### 3. Set Up SSH Key Authentication

```bash
# On your local machine
ssh-copy-id taskmaster@your-server-ip

# Test connection
ssh taskmaster@your-server-ip
```

### 4. Update System

```bash
# Update package lists
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git build-essential
```

### 5. Install Node.js

```bash
# Install Node.js 20 LTS using NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x
```

### 6. Configure Firewall

```bash
# Install UFW (if not installed)
sudo apt install -y ufw

# Allow SSH (IMPORTANT: Do this first!)
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Application Installation

### 1. Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone repository
git clone https://github.com/yourname/taskmaster-dashboard.git
cd taskmaster-dashboard

# Or upload files via SCP
# On local machine:
# scp -r ./taskmaster-dashboard taskmaster@your-server-ip:~/
```

### 2. Install Dependencies

```bash
# Install production dependencies
npm ci --only=production

# Or install all dependencies
npm install
```

### 3. Build Application

```bash
# Build for production
npm run build

# Verify build
ls -la dist/
```

### 4. Configure Environment

```bash
# Create .env file
nano .env
```

Add configuration:

```bash
NODE_ENV=production
PORT=5000
PROJECT_ROOT=/home/taskmaster/taskmaster-dashboard
LOG_LEVEL=info
TASKMASTER_PATH=.taskmaster
ISSUES_PATH=.taskmaster/issues
```

Save and exit (Ctrl+X, Y, Enter)

### 5. Upload .taskmaster Directory

```bash
# On local machine: upload .taskmaster directory
scp -r /path/to/your/.taskmaster taskmaster@your-server-ip:~/taskmaster-dashboard/

# On server: verify
ls -la ~/taskmaster-dashboard/.taskmaster/
```

### 6. Test Application

```bash
# Start application (test mode)
npm run start

# In another terminal, test
curl http://localhost:5000/api/health

# Stop test (Ctrl+C)
```

## Process Manager Setup

### Option 1: PM2 (Recommended)

PM2 keeps your application running, restarts on failure, and manages logs.

#### Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

#### Configure PM2

Create `ecosystem.config.js`:

```bash
nano ecosystem.config.js
```

Add configuration:

```javascript
module.exports = {
  apps: [{
    name: 'taskmaster-dashboard',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '1G',
    watch: false,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

#### Start with PM2

```bash
# Create logs directory
mkdir -p logs

# Start application
pm2 start ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs

# Monitor resources
pm2 monit
```

#### PM2 Auto-Start

```bash
# Generate startup script
pm2 startup

# Copy and run the command PM2 outputs
# Example: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u taskmaster --hp /home/taskmaster

# Save PM2 process list
pm2 save

# Test reboot (optional)
sudo reboot

# After reboot, check PM2 status
pm2 status
```

#### PM2 Commands

```bash
# Start/Stop/Restart
pm2 start taskmaster-dashboard
pm2 stop taskmaster-dashboard
pm2 restart taskmaster-dashboard
pm2 reload taskmaster-dashboard  # Zero-downtime restart

# Logs
pm2 logs taskmaster-dashboard
pm2 logs --lines 100

# Monitoring
pm2 monit
pm2 status
pm2 info taskmaster-dashboard

# Delete process
pm2 delete taskmaster-dashboard

# Restart all
pm2 restart all
```

### Option 2: systemd

System service for tighter OS integration.

#### Create systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/taskmaster-dashboard.service
```

Add configuration:

```ini
[Unit]
Description=TaskMaster Dashboard
After=network.target

[Service]
Type=simple
User=taskmaster
WorkingDirectory=/home/taskmaster/taskmaster-dashboard
Environment=NODE_ENV=production
Environment=PORT=5000
ExecStart=/usr/bin/node /home/taskmaster/taskmaster-dashboard/dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=taskmaster-dashboard

[Install]
WantedBy=multi-user.target
```

#### Enable and Start Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable taskmaster-dashboard

# Start service
sudo systemctl start taskmaster-dashboard

# Check status
sudo systemctl status taskmaster-dashboard

# View logs
sudo journalctl -u taskmaster-dashboard -f
```

#### systemd Commands

```bash
# Start/Stop/Restart
sudo systemctl start taskmaster-dashboard
sudo systemctl stop taskmaster-dashboard
sudo systemctl restart taskmaster-dashboard

# Enable/Disable
sudo systemctl enable taskmaster-dashboard
sudo systemctl disable taskmaster-dashboard

# Status
sudo systemctl status taskmaster-dashboard

# Logs
sudo journalctl -u taskmaster-dashboard
sudo journalctl -u taskmaster-dashboard -f  # Follow
sudo journalctl -u taskmaster-dashboard --since "1 hour ago"
```

## Nginx Configuration

### 1. Install Nginx

```bash
sudo apt install -y nginx

# Verify installation
nginx -v

# Check status
sudo systemctl status nginx
```

### 2. Configure Nginx

```bash
# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Create configuration
sudo nano /etc/nginx/sites-available/taskmaster-dashboard
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/taskmaster-access.log;
    error_log /var/log/nginx/taskmaster-error.log;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:5000;
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
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/taskmaster-dashboard /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4. Test Nginx

```bash
# Test from server
curl -I http://localhost

# Test from local machine
curl -I http://your-server-ip
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)

Free SSL certificates with automatic renewal.

#### 1. Install Certbot

```bash
# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. Obtain Certificate

```bash
# Get certificate and configure Nginx automatically
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow prompts:
# 1. Enter email address
# 2. Agree to terms
# 3. Choose redirect option (select 2 for HTTPS redirect)
```

#### 3. Verify HTTPS

```bash
# Test HTTPS
curl -I https://your-domain.com

# Check certificate expiry
sudo certbot certificates
```

#### 4. Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Renewal is automatic (cron job installed by certbot)
# Check cron: sudo systemctl status certbot.timer
```

### Manual Nginx HTTPS Configuration

If Certbot doesn't auto-configure:

```bash
sudo nano /etc/nginx/sites-available/taskmaster-dashboard
```

Update configuration:

```nginx
# HTTP - redirect to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # ... rest of configuration (same as HTTP)
}
```

Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Monitoring and Logging

### Application Logs

#### PM2 Logs

```bash
# View all logs
pm2 logs

# View specific app logs
pm2 logs taskmaster-dashboard

# Save logs to files
pm2 flush  # Clear logs
pm2 logs --lines 1000 > logs.txt
```

#### systemd Logs

```bash
# View logs
sudo journalctl -u taskmaster-dashboard

# Follow logs
sudo journalctl -u taskmaster-dashboard -f

# Recent logs
sudo journalctl -u taskmaster-dashboard --since "1 hour ago"

# Export logs
sudo journalctl -u taskmaster-dashboard > logs.txt
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/taskmaster-access.log

# Error logs
sudo tail -f /var/log/nginx/taskmaster-error.log

# Search logs
sudo grep "error" /var/log/nginx/taskmaster-error.log
```

### System Monitoring

#### Install Monitoring Tools

```bash
# Install htop (interactive process viewer)
sudo apt install -y htop

# Run htop
htop
```

#### Basic Monitoring Commands

```bash
# CPU and memory usage
top

# Disk usage
df -h

# Disk I/O
iostat

# Network connections
netstat -tuln

# Check application port
sudo lsof -i :5000
```

### Log Rotation

Configure log rotation to prevent disk space issues:

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/taskmaster-dashboard
```

Add:

```
/home/taskmaster/taskmaster-dashboard/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 taskmaster taskmaster
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

## Security Hardening

### 1. SSH Security

```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config
```

Set:

```
# Disable root login
PermitRootLogin no

# Disable password authentication (use keys only)
PasswordAuthentication no

# Change default port (optional)
Port 2222
```

Restart SSH:

```bash
sudo systemctl restart sshd
```

**Important:** Test new SSH connection before closing current session!

### 2. Fail2Ban

Protect against brute-force attacks:

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Configure
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

Enable SSH protection:

```ini
[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
```

Start Fail2Ban:

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check status
sudo fail2ban-client status sshd
```

### 3. Automatic Security Updates

```bash
# Install unattended-upgrades
sudo apt install -y unattended-upgrades

# Enable automatic updates
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 4. File Permissions

```bash
# Set proper permissions
sudo chown -R taskmaster:taskmaster /home/taskmaster/taskmaster-dashboard

# Protect .env file
chmod 600 /home/taskmaster/taskmaster-dashboard/.env

# Read-only for .taskmaster (Phase 1)
chmod -R 440 /home/taskmaster/taskmaster-dashboard/.taskmaster
```

### 5. Network Security

```bash
# Only allow necessary ports
sudo ufw status

# Example: if using custom SSH port
sudo ufw allow 2222/tcp
sudo ufw delete allow OpenSSH
```

## Troubleshooting

### Application Won't Start

**Check PM2/systemd status:**

```bash
# PM2
pm2 status
pm2 logs taskmaster-dashboard

# systemd
sudo systemctl status taskmaster-dashboard
sudo journalctl -u taskmaster-dashboard -n 50
```

**Common issues:**

1. Port already in use
   ```bash
   sudo lsof -i :5000
   sudo kill <PID>
   ```

2. Missing dependencies
   ```bash
   cd ~/taskmaster-dashboard
   npm install
   ```

3. Environment variables not set
   ```bash
   cat .env
   # Verify all required variables exist
   ```

### Nginx Errors

**Check Nginx status:**

```bash
sudo systemctl status nginx
sudo nginx -t
```

**View error logs:**

```bash
sudo tail -f /var/log/nginx/error.log
```

**Common issues:**

1. Configuration syntax error
   ```bash
   sudo nginx -t  # Shows error details
   ```

2. Upstream connection refused
   ```bash
   # Check application is running
   curl http://localhost:5000
   pm2 status
   ```

### SSL Certificate Issues

**Check certificate status:**

```bash
sudo certbot certificates
```

**Renewal issues:**

```bash
# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

### Performance Issues

**Check resource usage:**

```bash
# CPU and memory
htop

# Disk space
df -h

# Application memory
pm2 info taskmaster-dashboard
```

**Optimize:**

1. Increase PM2 memory limit:
   ```javascript
   // ecosystem.config.js
   max_memory_restart: '2G'
   ```

2. Enable Nginx caching
3. Optimize Node.js flags:
   ```bash
   node --max-old-space-size=2048 dist/index.js
   ```

### Database Connection Issues

(Phase 2+, if using database)

**Check connection:**

```bash
# Test database connectivity
psql -h localhost -U username -d database
```

### Firewall Issues

**Check firewall status:**

```bash
sudo ufw status verbose
```

**Allow application port:**

```bash
sudo ufw allow 5000/tcp
```

## Backup Strategy

### 1. Backup .taskmaster Directory

```bash
# Manual backup
tar -czf taskmaster-backup-$(date +%Y%m%d).tar.gz .taskmaster/

# Automated backup script
nano backup.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/home/taskmaster/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/taskmaster-$TIMESTAMP.tar.gz .taskmaster/

# Keep only last 7 days
find $BACKUP_DIR -name "taskmaster-*.tar.gz" -mtime +7 -delete
```

Make executable and schedule:

```bash
chmod +x backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /home/taskmaster/taskmaster-dashboard/backup.sh
```

### 2. Backup Database

(Phase 2+, if using database)

```bash
pg_dump database_name > backup.sql
```

## Updating the Application

See [Updates Guide](./updates.md) for detailed update procedures.

**Quick update:**

```bash
# Stop application
pm2 stop taskmaster-dashboard

# Pull updates
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Start application
pm2 start taskmaster-dashboard

# Or with systemd
sudo systemctl restart taskmaster-dashboard
```

## Next Steps

- [Troubleshooting Guide](./troubleshooting.md)
- [Updates and Maintenance](./updates.md)
- [Environment Variables Reference](./environment-variables.md)
- [Monitoring Setup (Advanced)](./monitoring.md)

---

**Need Help?**
- [Project Troubleshooting](./troubleshooting.md)
- [Docker Deployment](./docker.md) (alternative)
- [Replit Deployment](./replit.md) (easier alternative)
