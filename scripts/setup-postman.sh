#!/bin/bash

# Postman API連携のセットアップスクリプト

echo "🔧 Postman API Integration Setup"
echo "================================="

echo "このスクリプトは、Postman APIとの連携設定をガイドします。"
echo ""

# Postman API キーの確認
echo "📋 Step 1: Postman API Key の設定"
echo ""
echo "1. Postmanにログイン: https://app.postman.com/"
echo "2. Settings → API Keys に移動"
echo "3. 'Generate API Key' をクリックして新しいキーを生成"
echo "4. 生成されたキーをコピー"
echo ""

# ワークスペースIDの確認
echo "📋 Step 2: Workspace ID の取得"
echo ""
echo "1. Postmanでワークスペースを開く"
echo "2. URLから workspace ID を確認"
echo "   例: https://app.postman.com/workspace/[WORKSPACE_ID]/..."
echo "3. または、Workspace Settings → Info → Workspace ID"
echo ""

# コレクションの作成/取得
echo "📋 Step 3: Collection の準備"
echo ""
echo "Option A: 既存のコレクションを使用する場合"
echo "1. Postmanで既存のコレクションを開く"
echo "2. Collection Settings → Info → Collection ID をコピー"
echo ""
echo "Option B: 新しいコレクションを自動作成する場合"
echo "1. Collection ID の設定をスキップ"
echo "2. 初回実行時に自動で作成されます"
echo ""

# GitHub Secrets の設定
echo "📋 Step 4: GitHub Secrets の設定"
echo ""
echo "1. GitHubリポジトリの Settings → Secrets and variables → Actions"
echo "2. 'New repository secret' で以下を追加:"
echo ""
echo "   Name: POSTMAN_API_KEY"
echo "   Value: [Step 1で取得したAPI Key]"
echo ""
echo "   Name: POSTMAN_WORKSPACE_ID"
echo "   Value: [Step 2で取得したWorkspace ID]"
echo ""
echo "   Name: POSTMAN_COLLECTION_UID (オプション)"
echo "   Value: [Step 3で取得したCollection ID]"
echo ""

# ローカルテスト用の環境変数設定
echo "📋 Step 5: ローカルテスト用の環境変数設定 (オプション)"
echo ""
echo "ローカルでテストする場合は、以下の環境変数を設定:"
echo ""
echo "export POSTMAN_API_KEY='your_api_key_here'"
echo "export POSTMAN_WORKSPACE_ID='your_workspace_id_here'"
echo "export POSTMAN_COLLECTION_UID='your_collection_id_here'  # オプション"
echo ""

# テスト実行
echo "📋 Step 6: 動作テスト"
echo ""
echo "設定完了後、以下のコマンドでテスト実行:"
echo ""
echo "# ローカルテスト"
echo "npm run postman:info    # ワークスペース情報の確認"
echo "npm run sync           # 完全同期（変換 + Postman更新）"
echo ""
echo "# GitHub Actionsテスト"
echo "git add ."
echo "git commit -m 'test: update API spec'"
echo "git push"
echo ""

echo "🎯 完了!"
echo ""
echo "設定が完了したら、input/ ディレクトリのOpenAPIファイルを"
echo "変更してコミットすることで、自動的にPostmanが更新されます。"
