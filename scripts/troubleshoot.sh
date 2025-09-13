#!/bin/bash

# GitHub Actions ワークフローのトラブルシューティングスクリプト

echo "🔧 GitHub Actions Troubleshooting"
echo "================================="

# 基本情報
echo "📋 Repository Info:"
echo "  Current branch: $(git branch --show-current)"
echo "  Latest commit: $(git log -1 --oneline)"
echo "  Remote URL: $(git remote get-url origin)"
echo ""

# ローカル環境での前提条件チェック
echo "🔍 Pre-flight checks:"

# Node.js version check
if command -v node >/dev/null 2>&1; then
    echo "  ✅ Node.js: $(node --version)"
else
    echo "  ❌ Node.js not found"
fi

# npm version check
if command -v npm >/dev/null 2>&1; then
    echo "  ✅ npm: $(npm --version)"
else
    echo "  ❌ npm not found"
fi

# package.json check
if [ -f "package.json" ]; then
    echo "  ✅ package.json exists"
else
    echo "  ❌ package.json not found"
fi

# package-lock.json check
if [ -f "package-lock.json" ]; then
    echo "  ✅ package-lock.json exists"
else
    echo "  ❌ package-lock.json not found - run 'npm install'"
fi

echo ""

# Dependencies check
echo "📦 Dependencies check:"
if [ -d "node_modules" ]; then
    echo "  ✅ node_modules exists"
    if [ -f "node_modules/openapi-to-postmanv2/package.json" ]; then
        echo "  ✅ openapi-to-postmanv2 installed"
    else
        echo "  ❌ openapi-to-postmanv2 not found - run 'npm install'"
    fi
else
    echo "  ❌ node_modules not found - run 'npm install'"
fi

echo ""

# Input files check
echo "📁 Input files check:"
if [ -d "input" ]; then
    echo "  ✅ input directory exists"
    if [ -f "input/auth-api.yml" ]; then
        echo "  ✅ auth-api.yml exists"
    else
        echo "  ❌ auth-api.yml not found"
    fi
    if [ -f "input/pricing-api.yml" ]; then
        echo "  ✅ pricing-api.yml exists"
    else
        echo "  ❌ pricing-api.yml not found"
    fi
else
    echo "  ❌ input directory not found"
fi

echo ""

# Test local conversion
echo "🧪 Testing local conversion:"
if npm run convert 2>/dev/null; then
    echo "  ✅ Local conversion successful"
    if [ -f "output/combined-collection.json" ]; then
        echo "  ✅ combined-collection.json generated"
    else
        echo "  ❌ combined-collection.json not found"
    fi
else
    echo "  ❌ Local conversion failed"
    echo "  Run 'npm run convert' manually to see error details"
fi

echo ""

# GitHub Actions workflow check
echo "🤖 GitHub Actions workflow check:"
if [ -f ".github/workflows/openapi-to-postman.yml" ]; then
    echo "  ✅ Workflow file exists"
    
    # Check if workflow has syntax errors (basic check)
    if command -v yq >/dev/null 2>&1; then
        if yq eval '.jobs' .github/workflows/openapi-to-postman.yml >/dev/null 2>&1; then
            echo "  ✅ Workflow syntax appears valid"
        else
            echo "  ⚠️ Workflow syntax may have issues"
        fi
    else
        echo "  ⚠️ Cannot validate workflow syntax (yq not installed)"
    fi
else
    echo "  ❌ Workflow file not found"
fi

echo ""

# Suggested fixes
echo "🔧 Suggested fixes for common issues:"
echo ""
echo "If conversion fails:"
echo "  1. npm install"
echo "  2. npm run convert"
echo "  3. Check input/*.yml files are valid OpenAPI specs"
echo ""
echo "If GitHub Actions fails:"
echo "  1. Check the Actions tab: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\([^/]*\/[^.]*\).*/\1/')/actions"
echo "  2. Verify package-lock.json is committed"
echo "  3. Check workflow file syntax"
echo "  4. Try manual workflow dispatch"
echo ""
echo "If artifacts not found:"
echo "  1. Ensure first job completes successfully"
echo "  2. Check artifact upload step logs"
echo "  3. Verify output files are generated"
echo ""

# Quick test command suggestions
echo "💡 Quick test commands:"
echo "  npm run build     # Full local test"
echo "  npm run validate  # Validate existing output"
echo "  git push          # Trigger GitHub Actions"
