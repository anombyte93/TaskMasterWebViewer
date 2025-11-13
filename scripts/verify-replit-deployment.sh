#!/bin/bash
# Replit Deployment Verification Script
# Verifies that all required files and configurations are in place for Replit deployment

echo "============================================"
echo "TaskMaster Web Integration"
echo "Replit Deployment Verification"
echo "============================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to check if file exists
check_file() {
    local file=$1
    local description=$2

    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description: $file"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $description: $file (MISSING)"
        ((FAILED++))
    fi
}

# Function to check if directory exists
check_dir() {
    local dir=$1
    local description=$2

    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $description: $dir"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $description: $dir (MISSING)"
        ((FAILED++))
    fi
}

# Function to check package.json script
check_script() {
    local script=$1
    local description=$2

    if grep -q "\"$script\"" package.json; then
        echo -e "${GREEN}✓${NC} $description: npm run $script"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $description: npm run $script (MISSING)"
        ((FAILED++))
    fi
}

# Function to warn about optional file
warn_file() {
    local file=$1
    local description=$2

    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description: $file"
    else
        echo -e "${YELLOW}⚠${NC} $description: $file (OPTIONAL - not critical)"
        ((WARNINGS++))
    fi
}

echo "1. Checking Replit Configuration Files"
echo "---------------------------------------"
check_file ".replit" "Replit config"
check_file "replit.nix" "Nix environment"
check_file ".replitignore" "Ignore file"
echo ""

echo "2. Checking Core Project Files"
echo "-------------------------------"
check_file "package.json" "Package manifest"
check_file "vite.config.ts" "Vite config"
check_file "tsconfig.json" "TypeScript config"
check_file ".env.example" "Environment template"
echo ""

echo "3. Checking Server Files"
echo "------------------------"
check_file "server/index.ts" "Server entry point"
check_file "server/routes.ts" "API routes"
check_file "server/vite.ts" "Vite middleware"
check_dir "server/src/routes" "Route handlers"
check_dir "server/src/services" "Services"
echo ""

echo "4. Checking Client Files"
echo "------------------------"
check_file "client/index.html" "Client HTML"
check_file "client/src/main.tsx" "Client entry"
check_file "client/src/pages/Dashboard.tsx" "Dashboard page"
check_dir "client/src/lib" "Client libraries"
echo ""

echo "5. Checking TaskMaster Integration"
echo "-----------------------------------"
check_dir ".taskmaster" "TaskMaster directory"
check_dir ".taskmaster/tasks" "Tasks directory"
check_file ".taskmaster/tasks/tasks.json" "Tasks database"
check_file ".taskmaster/config.json" "TaskMaster config"
warn_file ".taskmaster/docs/prd.txt" "PRD document"
echo ""

echo "6. Checking Package Scripts"
echo "---------------------------"
check_script "dev" "Development server"
check_script "build" "Production build"
check_script "start" "Production server"
echo ""

echo "7. Checking Documentation"
echo "-------------------------"
check_file "README.md" "Main README"
check_dir "docs/deployment" "Deployment docs"
check_file "docs/deployment/replit-setup.md" "Replit setup guide"
echo ""

echo "8. Testing Build Process"
echo "------------------------"
echo "Running: npm run build"
if npm run build > /tmp/build-test.log 2>&1; then
    echo -e "${GREEN}✓${NC} Build succeeded"
    ((PASSED++))

    # Check build outputs
    if [ -d "dist/public" ]; then
        echo -e "${GREEN}✓${NC} Frontend build output: dist/public"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Frontend build output missing: dist/public"
        ((FAILED++))
    fi

    if [ -f "dist/index.js" ]; then
        echo -e "${GREEN}✓${NC} Backend build output: dist/index.js"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Backend build output missing: dist/index.js"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} Build failed (see /tmp/build-test.log)"
    ((FAILED++))
    echo ""
    echo "Build error details:"
    tail -20 /tmp/build-test.log
fi
echo ""

echo "9. Checking Environment Variables"
echo "----------------------------------"
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠${NC} .env file exists (should be in Replit Secrets, not committed)"
    ((WARNINGS++))

    # Check for required variables
    if grep -q "PROJECT_ROOT" .env; then
        echo -e "${GREEN}✓${NC} PROJECT_ROOT defined in .env"
    else
        echo -e "${YELLOW}⚠${NC} PROJECT_ROOT not in .env (configure in Replit Secrets)"
        ((WARNINGS++))
    fi
else
    echo -e "${GREEN}✓${NC} No .env file (good - use Replit Secrets instead)"
    ((PASSED++))
fi
echo ""

echo "10. Port Configuration"
echo "----------------------"
if grep -q 'PORT.*5000' .replit; then
    echo -e "${GREEN}✓${NC} Port 5000 configured in .replit"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Port 5000 not found in .replit"
    ((WARNINGS++))
fi

if grep -q 'localPort = 5000' .replit; then
    echo -e "${GREEN}✓${NC} Local port mapping configured"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Local port mapping missing in .replit"
    ((FAILED++))
fi
echo ""

echo "============================================"
echo "Verification Summary"
echo "============================================"
echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${RED}Failed:${NC}   $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push to GitHub (if not already done)"
    echo "2. Import project to Replit from GitHub"
    echo "3. Configure PROJECT_ROOT in Replit Secrets"
    echo "4. Click 'Run' to start development server"
    echo "5. Click 'Deploy' for production deployment"
    echo ""
    echo "See docs/deployment/replit-setup.md for detailed instructions"
    exit 0
else
    echo -e "${RED}✗ Some critical checks failed${NC}"
    echo "Please fix the issues above before deploying to Replit"
    exit 1
fi
