#!/bin/bash

# GitHub Actions実行状況を確認するスクリプト

echo "🔍 GitHub Actions Status Checker"
echo "================================"

# リポジトリ情報を取得
REPO_OWNER=$(git remote get-url origin | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1/')
REPO_NAME=$(git remote get-url origin | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\2/')

echo "Repository: $REPO_OWNER/$REPO_NAME"
echo "Current branch: $(git branch --show-current)"
echo "Latest commit: $(git log -1 --oneline)"
echo ""

echo "📋 Quick Actions:"
echo "1. View Actions: https://github.com/$REPO_OWNER/$REPO_NAME/actions"
echo "2. View Workflow: https://github.com/$REPO_OWNER/$REPO_NAME/actions/workflows/openapi-to-postman.yml"
echo "3. Manual Run: https://github.com/$REPO_OWNER/$REPO_NAME/actions/workflows/openapi-to-postman.yml (click 'Run workflow')"
echo ""

echo "🧪 Local Testing Commands:"
echo "npm run convert  # Convert OpenAPI to Postman"
echo "npm run validate # Validate generated collections"
echo "npm run build    # Full build pipeline"
echo ""

echo "📁 Generated Files:"
if [ -d "output" ]; then
    ls -la output/
else
    echo "No output directory found. Run 'npm run convert' first."
fi
