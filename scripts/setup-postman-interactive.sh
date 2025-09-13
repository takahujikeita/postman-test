#!/bin/bash

# インタラクティブなPostman API設定ガイド

echo "🔧 Postman API Key 設定ガイド"
echo "================================"
echo ""

echo "このスクリプトは、Postman API Key の取得と設定をガイドします。"
echo ""

# ステップ1: Postman API Key
echo "📋 Step 1: Postman API Key の取得"
echo ""
echo "1. ブラウザで以下のURLを開いてください:"
echo "   👉 https://app.postman.com/"
echo ""
echo "2. ログイン後、右上のプロフィールアイコンをクリック"
echo "3. 'Settings' を選択"
echo "4. 左メニューから 'API Keys' を選択"
echo "5. 'Generate API Key' ボタンをクリック"
echo "6. キー名を入力 (例: 'GitHub Actions Integration')"
echo "7. 'Generate' をクリック"
echo "8. ⚠️  表示されたキーを必ずコピーして保存 (再表示不可)"
echo ""

read -p "API Key を取得しましたか? (y/N): " api_key_ready
if [[ $api_key_ready =~ ^[Yy]$ ]]; then
    echo "✅ API Key 取得完了"
else
    echo "❌ まず API Key を取得してから続行してください"
    exit 1
fi

echo ""

# ステップ2: Workspace ID
echo "📋 Step 2: Workspace ID の取得"
echo ""
echo "1. Postmanで使用したいワークスペースを開く"
echo "2. URLからワークスペースIDを確認:"
echo "   例: https://app.postman.com/workspace/[WORKSPACE_ID]/overview"
echo "   または"
echo "3. ワークスペース名の隣の '⚙️' → 'Workspace Settings'"
echo "4. 'Info' タブ → 'Workspace ID' をコピー"
echo ""

read -p "Workspace ID を取得しましたか? (y/N): " workspace_ready
if [[ $workspace_ready =~ ^[Yy]$ ]]; then
    echo "✅ Workspace ID 取得完了"
else
    echo "❌ まず Workspace ID を取得してから続行してください"
    exit 1
fi

echo ""

# ステップ3: Collection ID (オプション)
echo "📋 Step 3: Collection ID の取得 (オプション)"
echo ""
echo "既存のコレクションを更新したい場合のみ必要です。"
echo "新しいコレクションを自動作成する場合はスキップしてください。"
echo ""
echo "既存コレクションを使用する場合:"
echo "1. 更新したいコレクションを開く"
echo "2. コレクション名の隣の '⋯' → 'Settings'"
echo "3. 'Info' タブ → 'Collection ID' をコピー"
echo ""

read -p "既存のコレクションを使用しますか? (y/N): " use_existing
if [[ $use_existing =~ ^[Yy]$ ]]; then
    echo "✅ Collection ID も取得してください"
    COLLECTION_NEEDED=true
else
    echo "ℹ️  新しいコレクションが自動作成されます"
    COLLECTION_NEEDED=false
fi

echo ""

# ステップ4: GitHub Secrets 設定
echo "📋 Step 4: GitHub Secrets の設定"
echo ""
echo "以下のURLを開いてGitHub Secretsを設定してください:"
echo "👉 https://github.com/takahujikeita/postman-test/settings/secrets/actions"
echo ""
echo "設定するSecrets:"
echo ""
echo "1. New repository secret をクリック"
echo "   Name: POSTMAN_API_KEY"
echo "   Secret: [Step 1で取得したAPI Key]"
echo ""
echo "2. New repository secret をクリック"
echo "   Name: POSTMAN_WORKSPACE_ID"  
echo "   Secret: [Step 2で取得したWorkspace ID]"
echo ""

if [[ $COLLECTION_NEEDED == true ]]; then
    echo "3. New repository secret をクリック"
    echo "   Name: POSTMAN_COLLECTION_UID"
    echo "   Secret: [Step 3で取得したCollection ID]"
    echo ""
fi

echo "⚠️  重要: Secret の値は一度設定すると再表示できません。"
echo "    正確にコピー&ペーストしてください。"
echo ""

read -p "GitHub Secrets の設定は完了しましたか? (y/N): " secrets_ready
if [[ $secrets_ready =~ ^[Yy]$ ]]; then
    echo "✅ GitHub Secrets 設定完了"
else
    echo "❌ GitHub Secrets を設定してから続行してください"
    exit 1
fi

echo ""

# ステップ5: テスト実行
echo "📋 Step 5: 動作テスト"
echo ""
echo "設定完了です！以下の方法でテストできます:"
echo ""
echo "🧪 ローカルテスト (環境変数を設定した場合):"
echo "   npm run postman:info"
echo ""
echo "🚀 GitHub Actions テスト:"
echo "   1. input/ ディレクトリのOpenAPIファイルを編集"
echo "   2. git add . && git commit -m 'test: update API'"
echo "   3. git push"
echo "   4. GitHub Actions タブで実行結果を確認"
echo ""
echo "🎯 完了!"
echo ""
echo "設定が正しく行われていれば、OpenAPI ファイルの変更時に"
echo "自動的にPostman コレクションが更新されます。"

# 便利なリンクを表示
echo ""
echo "📚 便利なリンク:"
echo "   - GitHub Actions: https://github.com/takahujikeita/postman-test/actions"
echo "   - GitHub Secrets: https://github.com/takahujikeita/postman-test/settings/secrets/actions"
echo "   - Postman App: https://app.postman.com/"
echo ""
