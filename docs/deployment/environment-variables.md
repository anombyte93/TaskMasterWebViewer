# Environment Variables Reference

Complete reference for all environment variables used in TaskMaster Dashboard.

## Table of Contents

- [Required Variables](#required-variables)
- [Optional Variables](#optional-variables)
- [Feature Flags](#feature-flags)
- [Phase-Specific Variables](#phase-specific-variables)
- [Platform-Specific Configuration](#platform-specific-configuration)
- [Security Considerations](#security-considerations)
- [Examples](#examples)

## Required Variables

### PROJECT_ROOT

**Description:** Absolute path to the project containing `.taskmaster/` directory

**Type:** String (absolute path)

**Required:** Yes

**Default:** None

**Examples:**
```bash
# Replit
PROJECT_ROOT=/home/runner/YourReplName

# Docker
PROJECT_ROOT=/app

# VPS
PROJECT_ROOT=/home/taskmaster/taskmaster-dashboard

# Local development
PROJECT_ROOT=/Users/username/projects/myproject
```

**Validation:**
- Must be absolute path
- Directory must exist
- Must contain `.taskmaster/` subdirectory
- `.taskmaster/tasks/tasks.json` must exist

**Common Issues:**
```bash
# ❌ Wrong: Relative path
PROJECT_ROOT=./

# ❌ Wrong: Missing trailing .taskmaster
PROJECT_ROOT=/home/user/project/.taskmaster

# ✅ Correct
PROJECT_ROOT=/home/user/project
```

---

## Optional Variables

### NODE_ENV

**Description:** Application environment mode

**Type:** String

**Required:** No

**Default:** `development`

**Valid Values:**
- `development` - Development mode with hot reload
- `production` - Production mode with optimizations

**Examples:**
```bash
NODE_ENV=production
```

**Effects:**
- `development`:
  - Verbose logging
  - No caching
  - Hot module reload
  - Detailed error pages

- `production`:
  - Minimal logging
  - Aggressive caching
  - No hot reload
  - Generic error pages

---

### PORT

**Description:** Port number for HTTP server

**Type:** Number

**Required:** No

**Default:** `5000`

**Valid Range:** 1024-65535 (recommended: 3000-8080)

**Examples:**
```bash
PORT=5000
PORT=3000
PORT=8080
```

**Platform Notes:**
- **Replit:** Must use 5000 (firewalled otherwise)
- **Docker:** Can use any port internally, map in docker-compose.yml
- **VPS:** Any available port, configure in Nginx

---

### LOG_LEVEL

**Description:** Logging verbosity level

**Type:** String

**Required:** No

**Default:** `info`

**Valid Values:**
- `error` - Only errors
- `warn` - Warnings and errors
- `info` - Informational messages, warnings, and errors
- `debug` - All messages including debug

**Examples:**
```bash
# Production
LOG_LEVEL=info

# Development
LOG_LEVEL=debug

# Critical systems
LOG_LEVEL=error
```

**What Gets Logged:**

| Level | Errors | Warnings | Info | Debug |
|-------|--------|----------|------|-------|
| error | ✅ | ❌ | ❌ | ❌ |
| warn  | ✅ | ✅ | ❌ | ❌ |
| info  | ✅ | ✅ | ✅ | ❌ |
| debug | ✅ | ✅ | ✅ | ✅ |

---

### TASKMASTER_PATH

**Description:** Path to `.taskmaster` directory relative to PROJECT_ROOT

**Type:** String (relative path)

**Required:** No

**Default:** `.taskmaster`

**Examples:**
```bash
# Default
TASKMASTER_PATH=.taskmaster

# Custom location
TASKMASTER_PATH=taskmaster-data

# Subdirectory
TASKMASTER_PATH=data/.taskmaster
```

**When to Change:**
- Custom TaskMaster directory structure
- Multiple TaskMaster instances
- Testing environments

---

### ISSUES_PATH

**Description:** Path to issues directory relative to PROJECT_ROOT

**Type:** String (relative path)

**Required:** No

**Default:** `.taskmaster/issues`

**Examples:**
```bash
# Default
ISSUES_PATH=.taskmaster/issues

# Custom location
ISSUES_PATH=.taskmaster/bugs

# Separate directory
ISSUES_PATH=issues
```

---

## Feature Flags

Feature flags control functionality availability across different phases.

### ENABLE_EDITING

**Description:** Enable file editing capabilities

**Type:** Boolean

**Required:** No

**Default:** `false`

**Phase:** 3+

**Examples:**
```bash
# Phase 1 & 2 (disabled)
ENABLE_EDITING=false

# Phase 3+ (enabled)
ENABLE_EDITING=true
```

**Effects when enabled:**
- File editor in dashboard
- Save/edit task files
- Modify .taskmaster/tasks/tasks.json

**Security Note:** Only enable if file system is writable and secured

---

### ENABLE_GIT_ACTIONS

**Description:** Enable git operations (push, pull, commit)

**Type:** Boolean

**Required:** No

**Default:** `false`

**Phase:** 3+

**Examples:**
```bash
# Phase 1 & 2 (disabled)
ENABLE_GIT_ACTIONS=false

# Phase 3+ (enabled)
ENABLE_GIT_ACTIONS=true
```

**Effects when enabled:**
- Git commit button
- Push/pull controls
- Branch management

**Requirements:**
- Git installed on system
- Repository initialized
- Git credentials configured

---

### ENABLE_MCP_MANAGEMENT

**Description:** Enable MCP server management

**Type:** Boolean

**Required:** No

**Default:** `false`

**Phase:** 3+

**Examples:**
```bash
# Phase 1 & 2 (disabled)
ENABLE_MCP_MANAGEMENT=false

# Phase 3+ (enabled)
ENABLE_MCP_MANAGEMENT=true
```

**Effects when enabled:**
- Start/stop MCP servers
- MCP server status monitoring
- Configuration management

---

## Phase-Specific Variables

### Phase 1 (MVP) - Current

**Required:**
```bash
PROJECT_ROOT=/path/to/project
```

**Recommended:**
```bash
NODE_ENV=production
PORT=5000
LOG_LEVEL=info
```

**Feature Flags:**
```bash
ENABLE_EDITING=false
ENABLE_GIT_ACTIONS=false
ENABLE_MCP_MANAGEMENT=false
```

---

### Phase 2 (WebSocket & Terminal)

**Additional Variables:**

#### WS_HEARTBEAT_INTERVAL

**Description:** WebSocket heartbeat interval in milliseconds

**Type:** Number

**Default:** `30000` (30 seconds)

**Examples:**
```bash
WS_HEARTBEAT_INTERVAL=30000
```

#### WS_TIMEOUT

**Description:** WebSocket connection timeout in milliseconds

**Type:** Number

**Default:** `60000` (60 seconds)

**Examples:**
```bash
WS_TIMEOUT=60000
```

#### TERMINAL_ROWS

**Description:** Terminal emulator row count

**Type:** Number

**Default:** `30`

**Examples:**
```bash
TERMINAL_ROWS=30
```

#### TERMINAL_COLS

**Description:** Terminal emulator column count

**Type:** Number

**Default:** `120`

**Examples:**
```bash
TERMINAL_COLS=120
```

#### TERMINAL_SCROLLBACK

**Description:** Terminal scrollback buffer size (lines)

**Type:** Number

**Default:** `10000`

**Examples:**
```bash
TERMINAL_SCROLLBACK=10000
```

---

### Phase 3 (Advanced Features)

**Additional Variables:**

#### GIT_COMMIT_LIMIT

**Description:** Maximum number of commits to display

**Type:** Number

**Default:** `10`

**Examples:**
```bash
GIT_COMMIT_LIMIT=10
```

#### ENABLE_EDITING

See [Feature Flags](#enable_editing)

#### ENABLE_GIT_ACTIONS

See [Feature Flags](#enable_git_actions)

#### ENABLE_MCP_MANAGEMENT

See [Feature Flags](#enable_mcp_management)

---

## Platform-Specific Configuration

### Replit

**Required:**
```bash
PROJECT_ROOT=/home/runner/YourReplName
```

**Platform Variables (auto-set by Replit):**
```bash
REPL_ID=<auto-set>
REPL_OWNER=<auto-set>
REPL_SLUG=<auto-set>
```

**Configuration Method:**
- Use Replit Secrets tab (lock icon)
- Never commit to `.replit` or `.env` files

**Example Configuration:**
```
# In Replit Secrets:
PROJECT_ROOT=/home/runner/MyTaskMasterDashboard
NODE_ENV=production
LOG_LEVEL=info
```

---

### Docker

**Required:**
```bash
PROJECT_ROOT=/app
```

**Configuration Method:**
- Use `docker-compose.yml` environment section
- Or use `.env` file (not committed)
- Or pass via `docker run -e`

**Example docker-compose.yml:**
```yaml
services:
  taskmaster-dashboard:
    environment:
      - NODE_ENV=production
      - PORT=5000
      - PROJECT_ROOT=/app
      - LOG_LEVEL=info
    # Or use env_file:
    # env_file:
    #   - .env.production
```

**Example .env file:**
```bash
NODE_ENV=production
PORT=5000
PROJECT_ROOT=/app
LOG_LEVEL=info
```

---

### VPS

**Required:**
```bash
PROJECT_ROOT=/home/taskmaster/taskmaster-dashboard
```

**Configuration Method:**
- Create `.env` file in project root
- Or set in process manager (PM2/systemd)
- Or export in shell profile

**Example .env file:**
```bash
NODE_ENV=production
PORT=5000
PROJECT_ROOT=/home/taskmaster/taskmaster-dashboard
LOG_LEVEL=info
```

**Example PM2 (ecosystem.config.js):**
```javascript
module.exports = {
  apps: [{
    name: 'taskmaster-dashboard',
    script: './dist/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      PROJECT_ROOT: '/home/taskmaster/taskmaster-dashboard',
      LOG_LEVEL: 'info'
    }
  }]
};
```

**Example systemd service:**
```ini
[Service]
Environment="NODE_ENV=production"
Environment="PORT=5000"
Environment="PROJECT_ROOT=/home/taskmaster/taskmaster-dashboard"
Environment="LOG_LEVEL=info"
```

---

## Security Considerations

### 1. Never Commit Sensitive Variables

**Create `.env.example` with placeholders:**
```bash
PROJECT_ROOT=/path/to/your/project
NODE_ENV=production
PORT=5000
```

**Create `.env` (git-ignored) with actual values:**
```bash
PROJECT_ROOT=/home/user/actual-project
NODE_ENV=production
PORT=5000
```

**Ensure `.gitignore` includes:**
```
.env
.env.local
.env.*.local
```

---

### 2. Use Secrets Management

**Replit:**
- Use Secrets tab (encrypted)
- Never use .env file in Replit

**Docker:**
- Use Docker Secrets
- Or external secret manager (HashiCorp Vault, AWS Secrets Manager)

**VPS:**
- Secure .env file: `chmod 600 .env`
- Or use system environment variables
- Or use secret management tool

---

### 3. Validate Environment Variables

Application should validate on startup:

```javascript
// Example validation
const requiredVars = ['PROJECT_ROOT'];
const missingVars = requiredVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}
```

---

### 4. Principle of Least Privilege

Only set variables that are needed:

**Phase 1:**
```bash
# Minimal configuration
PROJECT_ROOT=/path/to/project
NODE_ENV=production
```

**Phase 3:**
```bash
# Full configuration
PROJECT_ROOT=/path/to/project
NODE_ENV=production
ENABLE_EDITING=true
ENABLE_GIT_ACTIONS=true
ENABLE_MCP_MANAGEMENT=true
```

---

## Examples

### Development Environment

```bash
# .env.development
NODE_ENV=development
PORT=5000
PROJECT_ROOT=/Users/username/projects/myproject
LOG_LEVEL=debug
TASKMASTER_PATH=.taskmaster
ISSUES_PATH=.taskmaster/issues
ENABLE_EDITING=false
ENABLE_GIT_ACTIONS=false
ENABLE_MCP_MANAGEMENT=false
```

---

### Production Environment (Phase 1)

```bash
# .env.production
NODE_ENV=production
PORT=5000
PROJECT_ROOT=/home/taskmaster/taskmaster-dashboard
LOG_LEVEL=info
TASKMASTER_PATH=.taskmaster
ISSUES_PATH=.taskmaster/issues
ENABLE_EDITING=false
ENABLE_GIT_ACTIONS=false
ENABLE_MCP_MANAGEMENT=false
```

---

### Production Environment (Phase 3)

```bash
# .env.production
NODE_ENV=production
PORT=5000
PROJECT_ROOT=/home/taskmaster/taskmaster-dashboard
LOG_LEVEL=info
TASKMASTER_PATH=.taskmaster
ISSUES_PATH=.taskmaster/issues

# WebSocket Configuration
WS_HEARTBEAT_INTERVAL=30000
WS_TIMEOUT=60000

# Terminal Configuration
TERMINAL_ROWS=30
TERMINAL_COLS=120
TERMINAL_SCROLLBACK=10000

# Feature Flags
ENABLE_EDITING=true
ENABLE_GIT_ACTIONS=true
ENABLE_MCP_MANAGEMENT=true

# Git Configuration
GIT_COMMIT_LIMIT=10
```

---

### Testing Environment

```bash
# .env.test
NODE_ENV=test
PORT=5001
PROJECT_ROOT=/tmp/taskmaster-test
LOG_LEVEL=debug
TASKMASTER_PATH=.taskmaster
ISSUES_PATH=.taskmaster/issues
ENABLE_EDITING=true
ENABLE_GIT_ACTIONS=false
ENABLE_MCP_MANAGEMENT=false
```

---

## Troubleshooting

### Variable Not Loading

**Check load order:**
```bash
# 1. .env file loaded?
cat .env

# 2. Variable in environment?
printenv | grep PROJECT_ROOT

# 3. Application reading it?
# Check application logs for startup messages
```

---

### Incorrect Value

**Debug value:**
```bash
# Print value in application
console.log('PROJECT_ROOT:', process.env.PROJECT_ROOT);

# Check for whitespace
echo -n "$PROJECT_ROOT" | od -c
```

---

### Platform-Specific Issues

**Replit:**
- Use Secrets tab, not .env
- Verify in Shell: `echo $PROJECT_ROOT`

**Docker:**
- Check docker-compose.yml
- Inspect container: `docker exec <container> printenv`

**VPS:**
- Check .env file exists
- Check file permissions: `ls -l .env`
- Verify PM2/systemd configuration

---

## Quick Reference

| Variable | Required | Default | Phase | Type |
|----------|----------|---------|-------|------|
| PROJECT_ROOT | Yes | None | All | String |
| NODE_ENV | No | development | All | String |
| PORT | No | 5000 | All | Number |
| LOG_LEVEL | No | info | All | String |
| TASKMASTER_PATH | No | .taskmaster | All | String |
| ISSUES_PATH | No | .taskmaster/issues | All | String |
| ENABLE_EDITING | No | false | 3+ | Boolean |
| ENABLE_GIT_ACTIONS | No | false | 3+ | Boolean |
| ENABLE_MCP_MANAGEMENT | No | false | 3+ | Boolean |
| WS_HEARTBEAT_INTERVAL | No | 30000 | 2+ | Number |
| WS_TIMEOUT | No | 60000 | 2+ | Number |
| TERMINAL_ROWS | No | 30 | 2+ | Number |
| TERMINAL_COLS | No | 120 | 2+ | Number |
| TERMINAL_SCROLLBACK | No | 10000 | 2+ | Number |
| GIT_COMMIT_LIMIT | No | 10 | 3+ | Number |

---

## Next Steps

- [Deployment Guide](./README.md)
- [Troubleshooting](./troubleshooting.md)
- [Platform-Specific Guides](./README.md#platform-specific-guides)

---

**Environment Variable Checklist:**

Before deployment:
- [ ] PROJECT_ROOT is set correctly
- [ ] NODE_ENV is production
- [ ] PORT is available
- [ ] .taskmaster directory exists at PROJECT_ROOT
- [ ] All feature flags are appropriate for your phase
- [ ] Sensitive values are not committed to Git
- [ ] Variables are validated in application code
- [ ] Platform-specific configuration is correct

**Testing Variables:**
```bash
# Quick test script
#!/bin/bash
echo "Testing environment variables..."
echo "PROJECT_ROOT: $PROJECT_ROOT"
echo ".taskmaster exists: $(test -d $PROJECT_ROOT/.taskmaster && echo 'Yes' || echo 'No')"
echo "tasks.json exists: $(test -f $PROJECT_ROOT/.taskmaster/tasks/tasks.json && echo 'Yes' || echo 'No')"
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"
```
